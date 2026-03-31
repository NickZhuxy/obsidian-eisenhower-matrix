export interface EisenhowerTask {
  id: string;
  name: string;
  x: number;       // urgency, 0-1
  y: number;       // importance, 0-1
  done: boolean;
  createdAt: number;
  doneAt?: number;
}

export interface PluginSettings {
  dotSize: number;
  showAxisLabels: boolean;
  showQuadrantLabels: boolean;
  hideCompleted: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  dotSize: 16,
  showAxisLabels: true,
  showQuadrantLabels: true,
  hideCompleted: false,
};

export interface PluginData {
  tasks: EisenhowerTask[];
  settings: PluginSettings;
}

export const DEFAULT_DATA: PluginData = {
  tasks: [],
  settings: { ...DEFAULT_SETTINGS },
};
