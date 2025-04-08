export interface AlarmThresholds {
  memoryThreshold: number;
  storageThreshold: number;
  reminderInterval: number;
}

export interface Alarm {
  id: string;
  data: AlarmThresholds;
}

