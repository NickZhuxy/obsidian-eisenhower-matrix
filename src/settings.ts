import { App, PluginSettingTab, Setting } from "obsidian";
import EisenhowerMatrixPlugin from "./main";

export class EisenhowerSettingTab extends PluginSettingTab {
  plugin: EisenhowerMatrixPlugin;

  constructor(app: App, plugin: EisenhowerMatrixPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Eisenhower Matrix" });

    new Setting(containerEl)
      .setName("Dot size")
      .setDesc("Base size of task dots in pixels")
      .addSlider((slider) =>
        slider
          .setLimits(6, 24, 2)
          .setValue(this.plugin.data.settings.dotSize)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.data.settings.dotSize = value;
            await this.plugin.savePluginData();
            this.plugin.refreshViews();
          })
      );

    new Setting(containerEl)
      .setName("Show axis labels")
      .setDesc("Display 'URGENCY' and 'IMPORTANCE' labels on axes")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.data.settings.showAxisLabels)
          .onChange(async (value) => {
            this.plugin.data.settings.showAxisLabels = value;
            await this.plugin.savePluginData();
            this.plugin.refreshViews();
          })
      );

    new Setting(containerEl)
      .setName("Show quadrant labels")
      .setDesc("Display quadrant names (Do First, Schedule, Delegate, Eliminate)")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.data.settings.showQuadrantLabels)
          .onChange(async (value) => {
            this.plugin.data.settings.showQuadrantLabels = value;
            await this.plugin.savePluginData();
            this.plugin.refreshViews();
          })
      );

    new Setting(containerEl)
      .setName("Hide completed tasks")
      .setDesc("Hide tasks that have been marked as done")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.data.settings.hideCompleted)
          .onChange(async (value) => {
            this.plugin.data.settings.hideCompleted = value;
            await this.plugin.savePluginData();
            this.plugin.refreshViews();
          })
      );
  }
}
