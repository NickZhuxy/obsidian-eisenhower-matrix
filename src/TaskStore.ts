import { EisenhowerTask, PluginData } from "./types";
import { generateId } from "./utils";

export class TaskStore {
  private data: PluginData;
  private save: (data: PluginData) => Promise<void>;
  private listeners: Array<() => void> = [];

  constructor(data: PluginData, save: (data: PluginData) => Promise<void>) {
    this.data = data;
    this.save = save;
  }

  getTasks(): EisenhowerTask[] {
    return this.data.tasks;
  }

  getTask(id: string): EisenhowerTask | undefined {
    return this.data.tasks.find((t) => t.id === id);
  }

  async addTask(name: string, x: number, y: number): Promise<EisenhowerTask> {
    const task: EisenhowerTask = {
      id: generateId(),
      name,
      x,
      y,
      done: false,
      createdAt: Date.now(),
    };
    this.data.tasks.push(task);
    await this.persist();
    return task;
  }

  async updateTask(
    id: string,
    updates: Partial<Omit<EisenhowerTask, "id" | "createdAt">>
  ): Promise<void> {
    const task = this.getTask(id);
    if (!task) return;
    Object.assign(task, updates);
    await this.persist();
  }

  async deleteTask(id: string): Promise<void> {
    this.data.tasks = this.data.tasks.filter((t) => t.id !== id);
    await this.persist();
  }

  onChange(listener: () => void): void {
    this.listeners.push(listener);
  }

  private async persist(): Promise<void> {
    await this.save(this.data);
    this.listeners.forEach((fn) => fn());
  }
}
