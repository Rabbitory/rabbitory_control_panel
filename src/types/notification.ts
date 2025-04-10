export type NotificationType =
  | "newInstance"
  | "deleteInstance"
  | "plugin"
  | "configuration"
  | "backup"
  | "firewall"
  | "storage"
  | "instanceType";

export type NotificationStatus = "error" | "pending" | "success";

export interface Notification {
  type: NotificationType;
  status: NotificationStatus;
  instanceName: string;
  path: string;
  message: string;
}
