import { ItemView, WorkspaceLeaf } from "obsidian";

export const VIEW_TYPE_MATRIX = "eisenhower-matrix";

export class MatrixView extends ItemView {
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

  async onOpen(): Promise<void> {
    const container = this.contentEl;
    container.empty();
    container.addClass("eisenhower-matrix-container");
    container.createEl("div", {
      text: "Eisenhower Matrix — view loaded",
      cls: "eisenhower-placeholder",
    });
  }

  async onClose(): Promise<void> {
    this.contentEl.empty();
  }
}
