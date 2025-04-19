export default interface Alarm {
  id: string;
  data: {
    memoryThreshold: number;
    storageThreshold: number;
    reminderInterval: number;
  };
}
