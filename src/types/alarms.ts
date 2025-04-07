export interface AlarmThresholds {
  timeThreshold: number;
  storageThreshold: number;
  reminderInterval: number;
}

export interface Alarm {
  id: string;
  data: AlarmThresholds;
}

