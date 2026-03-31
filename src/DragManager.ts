import { EisenhowerTask } from "./types";
import { pixelToNormalized } from "./utils";

export interface DragCallbacks {
  onDragMove: (taskId: string, x: number, y: number) => void;
  onDragEnd: (taskId: string, x: number, y: number) => void;
}

export class DragManager {
  private canvasEl: HTMLElement;
  private callbacks: DragCallbacks;
  private dragging: { taskId: string; dotEl: HTMLElement } | null = null;
  private tooltipEl: HTMLElement | null = null;

  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseUp: (e: MouseEvent) => void;

  constructor(canvasEl: HTMLElement, callbacks: DragCallbacks) {
    this.canvasEl = canvasEl;
    this.callbacks = callbacks;

    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseUp = this.onMouseUp.bind(this);
  }

  startDrag(task: EisenhowerTask, dotEl: HTMLElement, event: MouseEvent): void {
    this.dragging = { taskId: task.id, dotEl };
    dotEl.addClass("eisenhower-dot--dragging");

    document.addEventListener("mousemove", this.boundMouseMove);
    document.addEventListener("mouseup", this.boundMouseUp);

    // Suppress the click that would fire after mouseup
    dotEl.addEventListener("click", this.suppressClick, { once: true, capture: true });
  }

  private suppressClick = (e: MouseEvent): void => {
    e.stopImmediatePropagation();
  };

  private onMouseMove(e: MouseEvent): void {
    if (!this.dragging) return;

    const rect = this.canvasEl.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const { x, y } = pixelToNormalized(px, py, rect.width, rect.height);
    const size = this.dragging.dotEl.clientWidth;

    this.dragging.dotEl.style.left = `${px - size / 2}px`;
    this.dragging.dotEl.style.top = `${py - size / 2}px`;

    this.showDragTooltip(px, py, x, y);
    this.callbacks.onDragMove(this.dragging.taskId, x, y);
  }

  private onMouseUp(e: MouseEvent): void {
    if (!this.dragging) return;

    const rect = this.canvasEl.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const { x, y } = pixelToNormalized(px, py, rect.width, rect.height);

    this.dragging.dotEl.removeClass("eisenhower-dot--dragging");
    this.hideDragTooltip();

    document.removeEventListener("mousemove", this.boundMouseMove);
    document.removeEventListener("mouseup", this.boundMouseUp);

    this.callbacks.onDragEnd(this.dragging.taskId, x, y);
    this.dragging = null;
  }

  private showDragTooltip(px: number, py: number, x: number, y: number): void {
    this.hideDragTooltip();
    const tooltip = this.canvasEl.createEl("div", {
      cls: "eisenhower-tooltip",
      text: `urgency: ${x.toFixed(2)}  importance: ${y.toFixed(2)}`,
    });
    tooltip.style.left = `${px}px`;
    tooltip.style.top = `${py - 30}px`;
    this.tooltipEl = tooltip;
  }

  private hideDragTooltip(): void {
    if (this.tooltipEl) {
      this.tooltipEl.remove();
      this.tooltipEl = null;
    }
  }

  destroy(): void {
    document.removeEventListener("mousemove", this.boundMouseMove);
    document.removeEventListener("mouseup", this.boundMouseUp);
    this.hideDragTooltip();
  }
}
