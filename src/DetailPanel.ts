import { EisenhowerTask } from "./types";
import { positionToColor } from "./utils";

export interface DetailPanelCallbacks {
  onMarkDone: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onRename: (taskId: string, newName: string) => void;
}

export class DetailPanel {
  private panelEl: HTMLElement;
  private callbacks: DetailPanelCallbacks;
  private currentTaskId: string | null = null;

  constructor(containerEl: HTMLElement, callbacks: DetailPanelCallbacks) {
    this.callbacks = callbacks;
    this.panelEl = containerEl.createEl("div", {
      cls: "eisenhower-detail-panel",
    });
  }

  open(task: EisenhowerTask): void {
    if (this.currentTaskId === task.id) {
      this.close();
      return;
    }

    this.currentTaskId = task.id;
    this.panelEl.empty();

    const color = positionToColor(task.x, task.y);

    // Header
    const header = this.panelEl.createEl("div", {
      cls: "eisenhower-detail-panel__header",
    });
    const dot = header.createEl("div", {
      cls: "eisenhower-detail-panel__dot",
    });
    dot.style.backgroundColor = color;

    const nameEl = header.createEl("div", {
      cls: "eisenhower-detail-panel__name",
      text: task.name,
    });

    // Click name to edit
    nameEl.addEventListener("click", () => {
      this.startEditName(task, nameEl);
    });

    // Stats
    this.renderStat("Urgency", task.x, color);
    this.renderStat("Importance", task.y, color);

    // Actions
    const actions = this.panelEl.createEl("div", {
      cls: "eisenhower-detail-panel__actions",
    });

    const doneBtn = actions.createEl("button", {
      cls: "eisenhower-detail-panel__btn eisenhower-detail-panel__btn--done",
      text: task.done ? "↩ Undo" : "✓ Done",
    });
    doneBtn.addEventListener("click", () => {
      this.callbacks.onMarkDone(task.id);
      this.close();
    });

    const deleteBtn = actions.createEl("button", {
      cls: "eisenhower-detail-panel__btn eisenhower-detail-panel__btn--delete",
      text: "✕ Delete",
    });
    deleteBtn.addEventListener("click", () => {
      this.callbacks.onDelete(task.id);
      this.close();
    });

    this.panelEl.addClass("eisenhower-detail-panel--open");
  }

  close(): void {
    this.panelEl.removeClass("eisenhower-detail-panel--open");
    this.currentTaskId = null;
  }

  isOpen(): boolean {
    return this.currentTaskId !== null;
  }

  getCurrentTaskId(): string | null {
    return this.currentTaskId;
  }

  private renderStat(label: string, value: number, color: string): void {
    const stat = this.panelEl.createEl("div", {
      cls: "eisenhower-detail-panel__stat",
    });
    stat.createEl("span", {
      cls: "eisenhower-detail-panel__stat-label",
      text: label,
    });
    stat.createEl("span", {
      cls: "eisenhower-detail-panel__stat-value",
      text: value.toFixed(2),
    });
    stat.style.color = color;

    const bar = this.panelEl.createEl("div", {
      cls: "eisenhower-detail-panel__bar",
    });
    const fill = bar.createEl("div", {
      cls: "eisenhower-detail-panel__bar-fill",
    });
    fill.style.width = `${value * 100}%`;
    fill.style.backgroundColor = color;
  }

  private startEditName(task: EisenhowerTask, nameEl: HTMLElement): void {
    const input = document.createElement("input");
    input.className = "eisenhower-detail-panel__name-input";
    input.value = task.name;
    nameEl.replaceWith(input);
    input.focus();
    input.select();

    const finish = () => {
      const newName = input.value.trim();
      if (newName && newName !== task.name) {
        this.callbacks.onRename(task.id, newName);
      }
      const newNameEl = document.createElement("div");
      newNameEl.className = "eisenhower-detail-panel__name";
      newNameEl.textContent = newName || task.name;
      newNameEl.addEventListener("click", () => {
        task.name = newNameEl.textContent!;
        this.startEditName(task, newNameEl);
      });
      input.replaceWith(newNameEl);
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") finish();
      if (e.key === "Escape") {
        input.value = task.name;
        finish();
      }
    });
    input.addEventListener("blur", finish);
  }

  destroy(): void {
    this.panelEl.remove();
  }
}
