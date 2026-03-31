import { ItemView, WorkspaceLeaf } from "obsidian";
import { MatrixRenderer } from "./MatrixRenderer";
import { DragManager } from "./DragManager";
import { DetailPanel } from "./DetailPanel";
import { TaskStore } from "./TaskStore";
import { PluginSettings } from "./types";
import { pixelToNormalized } from "./utils";

export const VIEW_TYPE_MATRIX = "eisenhower-matrix";

export class MatrixView extends ItemView {
  private renderer: MatrixRenderer | null = null;
  private dragManager: DragManager | null = null;
  private detailPanel: DetailPanel | null = null;
  private store: TaskStore | null = null;
  private settings: PluginSettings | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_MATRIX;
  }

  getDisplayText(): string {
    return "Eisenhower Matrix";
  }

  getIcon(): string {
    return "scatter-chart";
  }

  initialize(store: TaskStore, settings: PluginSettings): void {
    this.store = store;
    this.settings = settings;
  }

  async onOpen(): Promise<void> {
    const container = this.contentEl;
    container.empty();
    container.addClass("eisenhower-matrix-container");

    if (!this.store || !this.settings) return;

    this.renderer = new MatrixRenderer(container, {
      onDotMouseDown: (task, event) => {
        const dot = this.renderer?.getDotElement(task.id);
        if (dot) this.dragManager?.startDrag(task, dot, event);
      },
      onDotClick: (task) => {
        const fullTask = this.store!.getTask(task.id);
        if (fullTask) this.detailPanel?.open(fullTask);
      },
      onCanvasDblClick: (px, py) => this.handleCreateTask(px, py),
    }, this.settings);

    const canvasEl = this.renderer.getCanvasEl();

    this.dragManager = new DragManager(canvasEl, {
      onDragMove: () => {},
      onDragEnd: async (taskId, x, y) => {
        await this.store!.updateTask(taskId, { x, y });
      },
    });

    this.detailPanel = new DetailPanel(canvasEl, {
      onMarkDone: async (taskId) => {
        const task = this.store!.getTask(taskId);
        if (task) {
          await this.store!.updateTask(taskId, {
            done: !task.done,
            doneAt: task.done ? undefined : Date.now(),
          });
          const updated = this.store!.getTask(taskId);
          if (updated && this.detailPanel?.getCurrentTaskId() === taskId) {
            if (this.settings?.hideCompleted && updated.done) {
              this.detailPanel.close();
            } else {
              this.detailPanel.close();
              this.detailPanel.open(updated);
            }
          }
        }
      },
      onDelete: async (taskId) => {
        await this.store!.deleteTask(taskId);
      },
      onRename: async (taskId, newName) => {
        await this.store!.updateTask(taskId, { name: newName });
        const updated = this.store!.getTask(taskId);
        if (updated && this.detailPanel?.getCurrentTaskId() === taskId) {
          this.detailPanel.open(updated);
        }
      },
    });

    // Close detail panel when clicking canvas background
    canvasEl.addEventListener("click", (e) => {
      if (
        (e.target as HTMLElement) === canvasEl &&
        this.detailPanel?.isOpen()
      ) {
        this.detailPanel.close();
      }
    });

    this.store.onChange(() => this.renderDots());

    this.resizeObserver = new ResizeObserver(() => this.renderDots());
    this.resizeObserver.observe(container);

    setTimeout(() => this.renderDots(), 50);
  }

  async onClose(): Promise<void> {
    this.resizeObserver?.disconnect();
    this.dragManager?.destroy();
    this.detailPanel?.destroy();
    this.renderer?.destroy();
    this.renderer = null;
    this.dragManager = null;
    this.detailPanel = null;
  }

  refreshSettings(settings: PluginSettings): void {
    this.settings = settings;
    this.renderer?.updateSettings(settings);
    this.renderDots();
  }

  private renderDots(): void {
    if (!this.renderer || !this.store) return;
    this.renderer.render(this.store.getTasks());
  }

  private async handleCreateTask(px: number, py: number): Promise<void> {
    if (!this.store || !this.renderer) return;

    const canvasEl = this.renderer.getCanvasEl();
    const input = canvasEl.createEl("input", {
      cls: "eisenhower-inline-input",
      attr: { type: "text", placeholder: "Task name..." },
    });
    input.style.left = `${px}px`;
    input.style.top = `${py}px`;
    input.focus();

    const cleanup = () => input.remove();

    input.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        const name = input.value.trim();
        if (name) {
          const { width, height } = this.renderer!.getCanvasSize();
          const { x, y } = pixelToNormalized(px, py, width, height);
          await this.store!.addTask(name, x, y);
        }
        cleanup();
      } else if (e.key === "Escape") {
        cleanup();
      }
    });

    input.addEventListener("blur", cleanup);
  }
}
