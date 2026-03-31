import { EisenhowerTask } from "./types";
import { pixelToNormalized } from "./utils";

export interface DragCallbacks {
  onDragEnd: (taskId: string, x: number, y: number) => void;
  onClick: (taskId: string) => void;
}

export class DragManager {
  private canvasEl: HTMLElement;
  private callbacks: DragCallbacks;
  private dragging: {
    taskId: string;
    dotEl: HTMLElement;
    startX: number;
    startY: number;
    didMove: boolean;
  } | null = null;
  private tooltipEl: HTMLElement | null = null;
  private static DRAG_THRESHOLD = 3;

  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseUp: (e: MouseEvent) => void;

  constructor(canvasEl: HTMLElement, callbacks: DragCallbacks) {
    this.canvasEl = canvasEl;
    this.callbacks = callbacks;

    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseUp = this.onMouseUp.bind(this);
  }

  startDrag(task: EisenhowerTask, dotEl: HTMLElement, event: MouseEvent): void {
    this.dragging = {
      taskId: task.id,
      dotEl,
      startX: event.clientX,
      startY: event.clientY,
      didMove: false,
    };

    document.addEventListener("mousemove", this.boundMouseMove);
    document.addEventListener("mouseup", this.boundMouseUp);
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.dragging) return;

    const dx = e.clientX - this.dragging.startX;
    const dy = e.clientY - this.dragging.startY;

    if (!this.dragging.didMove) {
      if (Math.abs(dx) + Math.abs(dy) < DragManager.DRAG_THRESHOLD) return;
      this.dragging.didMove = true;
      this.dragging.dotEl.addClass("eisenhower-dot--dragging");
    }

    const rect = this.canvasEl.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const { x, y } = pixelToNormalized(px, py, rect.width, rect.height);
    const size = this.dragging.dotEl.clientWidth;

    this.dragging.dotEl.style.left = `${px - size / 2}px`;
    this.dragging.dotEl.style.top = `${py - size / 2}px`;

    this.showDragTooltip(px, py, x, y);
  }

  private onMouseUp(e: MouseEvent): void {
    if (!this.dragging) return;

    document.removeEventListener("mousemove", this.boundMouseMove);
    document.removeEventListener("mouseup", this.boundMouseUp);

    if (this.dragging.didMove) {
      const rect = this.canvasEl.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const { x, y } = pixelToNormalized(px, py, rect.width, rect.height);

      this.dragging.dotEl.removeClass("eisenhower-dot--dragging");
      this.hideDragTooltip();

      const taskId = this.dragging.taskId;
      this.dragging = null;
      this.callbacks.onDragEnd(taskId, x, y);
    } else {
      // Simple click — no drag happened
      const taskId = this.dragging.taskId;
      this.dragging = null;
      this.callbacks.onClick(taskId);
    }
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
