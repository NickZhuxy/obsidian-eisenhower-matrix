import { Plugin, WorkspaceLeaf } from "obsidian";
import { MatrixView, VIEW_TYPE_MATRIX } from "./MatrixView";
import { TaskStore } from "./TaskStore";
import { PluginData, DEFAULT_DATA } from "./types";

export default class EisenhowerMatrixPlugin extends Plugin {
  data: PluginData = JSON.parse(JSON.stringify(DEFAULT_DATA));
  store: TaskStore | null = null;

  async onload() {
    await this.loadPluginData();

    this.store = new TaskStore(this.data, async (d) => {
      this.data = d;
      await this.savePluginData();
    });

    this.registerView(VIEW_TYPE_MATRIX, (leaf) => {
      const view = new MatrixView(leaf);
      view.initialize(this.store!, this.data.settings);
      return view;
    });

    this.addRibbonIcon("scatter-chart", "Open Eisenhower Matrix", () => {
      this.activateView();
    });

    this.addCommand({
      id: "open-eisenhower-matrix",
      name: "Open Eisenhower Matrix",
      callback: () => this.activateView(),
    });
  }

  onunload() {}

  async activateView(): Promise<void> {
    const { workspace } = this.app;
    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_MATRIX);

    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getLeaf("tab");
      await leaf.setViewState({ type: VIEW_TYPE_MATRIX, active: true });
    }

    workspace.revealLeaf(leaf);
  }

  async loadPluginData(): Promise<void> {
    const saved = await this.loadData();
    this.data = Object.assign(
      JSON.parse(JSON.stringify(DEFAULT_DATA)),
      saved
    );
  }

  async savePluginData(): Promise<void> {
    await this.saveData(this.data);
  }
}
