import { describe, it, expect, beforeEach } from "vitest";
import { TaskStore } from "../TaskStore";
import { DEFAULT_DATA, PluginData } from "../types";

function createMockStore(): { store: TaskStore; data: PluginData } {
  const data: PluginData = JSON.parse(JSON.stringify(DEFAULT_DATA));
  const save = async (d: PluginData) => {
    Object.assign(data, d);
  };
  const store = new TaskStore(data, save);
  return { store, data };
}

describe("TaskStore", () => {
  let store: TaskStore;
  let data: PluginData;

  beforeEach(() => {
    ({ store, data } = createMockStore());
  });

  it("creates a task with correct fields", async () => {
    const task = await store.addTask("Test task", 0.5, 0.7);
    expect(task.name).toBe("Test task");
    expect(task.x).toBe(0.5);
    expect(task.y).toBe(0.7);
    expect(task.done).toBe(false);
    expect(task.id).toBeTruthy();
    expect(data.tasks).toHaveLength(1);
  });

  it("gets a task by id", async () => {
    const task = await store.addTask("Find me", 0.1, 0.2);
    expect(store.getTask(task.id)).toEqual(task);
  });

  it("returns undefined for unknown id", () => {
    expect(store.getTask("nonexistent")).toBeUndefined();
  });

  it("updates task position", async () => {
    const task = await store.addTask("Move me", 0.1, 0.2);
    await store.updateTask(task.id, { x: 0.9, y: 0.8 });
    expect(store.getTask(task.id)!.x).toBe(0.9);
    expect(store.getTask(task.id)!.y).toBe(0.8);
  });

  it("marks task as done", async () => {
    const task = await store.addTask("Finish me", 0.5, 0.5);
    await store.updateTask(task.id, { done: true, doneAt: Date.now() });
    expect(store.getTask(task.id)!.done).toBe(true);
    expect(store.getTask(task.id)!.doneAt).toBeDefined();
  });

  it("deletes a task", async () => {
    const task = await store.addTask("Delete me", 0.3, 0.3);
    await store.deleteTask(task.id);
    expect(store.getTask(task.id)).toBeUndefined();
    expect(store.getTasks()).toHaveLength(0);
  });

  it("notifies on change", async () => {
    let called = false;
    store.onChange(() => { called = true; });
    await store.addTask("Trigger", 0.1, 0.1);
    expect(called).toBe(true);
  });
});
