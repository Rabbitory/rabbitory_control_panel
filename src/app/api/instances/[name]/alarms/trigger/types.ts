import { Alarm } from "../types";

export interface TriggerAlarmsParams {
  region: string;
  alarms: Alarm;
  type: string;
  instanceName: string;
}
