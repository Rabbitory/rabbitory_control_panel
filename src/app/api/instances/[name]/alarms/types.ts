export interface Alarm {
  id: string;
  data: {
    memoryThreshold: number;
    storageThreshold: number;
    reminderInterval: number;
  };
}
export interface AlarmData {
  type: "memory" | "storage";
  data: {
    memoryThreshold?: number;
    storageThreshold?: number;
    reminderInterval: number;
  };
}

export interface GetAlarmsParams {
  region: string;
  instanceName: string;
}

export interface AddAndStartAlarmsParams {
  region: string;
  alarmData: AlarmData;
  instanceName: string;
}
