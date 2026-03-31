import { EisenhowerTask, PluginSettings } from "./types";
import { normalizedToPixel, positionToColor } from "./utils";

export interface MatrixRendererCallbacks {
  onDotMouseDown: (task: EisenhowerTask, event: MouseEvent) => void;
  onCanvasDblClick: (x: number, y: number, event: MouseEvent) => void;
}

export class MatrixRenderer {
  private containerEl: HTMLElement;
  private canvasEl: HTMLElement;
  private callbacks: MatrixRendererCallbacks;
  private settings: PluginSettings;
  private tooltipEl: HTMLElement | null = null;

  constructor(
    containerEl: HTMLElement,
    callbacks: MatrixRendererCallbacks,
    settings: PluginSettings
  ) {
    this.containerEl = containerEl;
    this.callbacks = callbacks;
    this.settings = settings;

    this.canvasEl = containerEl.createEl("div", { cls: "eisenhower-canvas" });

    this.canvasEl.addEventListener("dblclick", (e) => {
      if ((e.target as HTMLElement).classList.contains("eisenhower-dot")) return;
      const rect = this.canvasEl.getBoundingClientRect();
      this.callbacks.onCanvasDblClick(
        e.clientX - rect.left,
        e.clientY - rect.top,
        e
      );
    });

    this.renderLabels();
  }

  updateSettings(settings: PluginSettings): void {
    this.settings = settings;
    // Re-render labels when settings change
    this.canvasEl.querySelectorAll(
      ".eisenhower-axis-label, .eisenhower-quadrant-label"
    ).forEach((el) => el.remove());
    this.renderLabels();
  }

  render(tasks: EisenhowerTask[]): void {
    // Remove existing dots
    this.canvasEl.querySelectorAll(".eisenhower-dot").forEach((el) => el.remove());

    const width = this.canvasEl.clientWidth;
    const height = this.canvasEl.clientHeight;

    for (const task of tasks) {
      if (this.settings.hideCompleted && task.done) continue;

      const { px, py } = normalizedToPixel(task.x, task.y, width, height);
      const size = this.settings.dotSize;
      const color = positionToColor(task.x, task.y);

      const dot = this.canvasEl.createEl("div", { cls: "eisenhower-dot" });
      dot.dataset.taskId = task.id;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.left = `${px - size / 2}px`;
      dot.style.top = `${py - size / 2}px`;
      dot.style.boxShadow = `0 0 ${size}px ${color.replace("65%", "40%")}`;

      if (task.done) {
        dot.addClass("eisenhower-dot--done");
        dot.style.borderColor = color;
      } else {
        dot.style.backgroundColor = color;
      }

      dot.addEventListener("mouseenter", () => this.showTooltip(task, dot));
      dot.addEventListener("mouseleave", () => this.hideTooltip());
      dot.addEventListener("mousedown", (e) => {
        e.preventDefault();
        this.callbacks.onDotMouseDown(task, e);
      });
    }
  }

  getDotElement(taskId: string): HTMLElement | null {
    return this.canvasEl.querySelector(
      `.eisenhower-dot[data-task-id="${taskId}"]`
    );
  }

  getCanvasEl(): HTMLElement {
    return this.canvasEl;
  }

  getCanvasSize(): { width: number; height: number } {
    return {
      width: this.canvasEl.clientWidth,
      height: this.canvasEl.clientHeight,
    };
  }

  private showTooltip(task: EisenhowerTask, dotEl: HTMLElement): void {
    this.hideTooltip();
    const tooltip = this.canvasEl.createEl("div", {
      cls: "eisenhower-tooltip",
      text: task.name,
    });
    const dotRect = dotEl.getBoundingClientRect();
    const canvasRect = this.canvasEl.getBoundingClientRect();
    tooltip.style.left = `${dotRect.left - canvasRect.left + dotRect.width / 2}px`;
    tooltip.style.top = `${dotRect.top - canvasRect.top - 30}px`;
    this.tooltipEl = tooltip;
  }

  private hideTooltip(): void {
    if (this.tooltipEl) {
      this.tooltipEl.remove();
      this.tooltipEl = null;
    }
  }

  private renderLabels(): void {
    if (this.settings.showAxisLabels) {
      this.canvasEl.createEl("div", {
        cls: "eisenhower-axis-label eisenhower-axis-label--x",
        text: "URGENCY →",
      });
      this.canvasEl.createEl("div", {
        cls: "eisenhower-axis-label eisenhower-axis-label--y",
        text: "IMPORTANCE →",
      });
    }

    if (this.settings.showQuadrantLabels) {
      const labels = [
        { text: "DO FIRST", pos: "top: 8px; right: 8px;" },
        { text: "SCHEDULE", pos: "top: 8px; left: 8px;" },
        { text: "DELEGATE", pos: "bottom: 8px; right: 8px;" },
        { text: "ELIMINATE", pos: "bottom: 8px; left: 8px;" },
      ];
      for (const label of labels) {
        const el = this.canvasEl.createEl("div", {
          cls: "eisenhower-quadrant-label",
          text: label.text,
        });
        el.setAttribute("style", label.pos);
      }
    }
  }

  destroy(): void {
    this.hideTooltip();
    this.canvasEl.remove();
  }
}
