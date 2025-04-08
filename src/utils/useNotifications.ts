"use client";

import { useState, useEffect } from "react";
import { Notification } from "@/types/notification";
import { usePathname } from "next/navigation";

export const useNotifications = () => {
  const path = usePathname();

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      type: "plugin",
      status: "error",
      instanceName: "aqua-distinct-heron",
      path: "plugins",
      message: `Enabling plugin on aqua-distinct-heron`,
    },
  ]);

  const addNotification = (newNotification: Notification) => {
    setNotifications([...notifications, newNotification]);
  };

  const updateNotification = (newNotification: Notification) => {
    setNotifications(
      notifications.map((notification) =>
        notification.type === newNotification.type &&
        notification.instanceName === newNotification.instanceName
          ? newNotification
          : notification,
      ),
    );
  };

  const deleteNotification = (type: string, instanceName: string) => {
    setNotifications(
      notifications.filter(
        (notification) =>
          notification.instanceName !== instanceName &&
          notification.type !== type,
      ),
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const formPending = () => {
    return (
      notifications.find((notification) => {
        return (
          new RegExp(notification.path).test(path) &&
          new RegExp(notification.instanceName).test(path) &&
          notification.status === "pending"
        );
      }) !== undefined
    );
  };

  useEffect(() => {});

  return {
    notifications,
    addNotification,
    updateNotification,
    clearNotifications,
    deleteNotification,
    formPending,
  };
};
