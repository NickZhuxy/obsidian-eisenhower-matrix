import { Plugin } from "obsidian";

export default class EisenhowerMatrixPlugin extends Plugin {
  async onload() {
    console.log("Eisenhower Matrix plugin loaded");
  }

  onunload() {
    console.log("Eisenhower Matrix plugin unloaded");
  }
}
