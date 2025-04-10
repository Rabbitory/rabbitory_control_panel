import { Notification } from "@/types/notification";

const eventBackups: Notification[] = [];

export function addEvent(notification: Notification): void {
  eventBackups.push(notification);
  console.log(eventBackups);
}
export function deleteEvent(
  name: Notification["instanceName"],
  type: Notification["type"]
): void {
  for (let i = 0; i < eventBackups.length; i++) {
    if (
      eventBackups[i].instanceName === name &&
      eventBackups[i].type === type
    ) {
      eventBackups.splice(i, 1);
      console.log("deteled event:", name, type);
      return;
    }
  }
}

export function getEvents(): Notification[] {
  return eventBackups;
}
