"use client";

import { useState, useEffect } from "react";
import { Notification } from "@/types/notification";
import { usePathname } from "next/navigation";

export const useNotifications = () => {
  const path = usePathname();

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = async (newNotification: Notification) => {
    setNotifications([...notifications, newNotification]);
  };

  const updateNotification = async (newNotification: Notification) => {
    setNotifications(
      notifications.map((notification) =>
        notification.type === newNotification.type &&
        notification.instanceName === newNotification.instanceName
          ? newNotification
          : notification,
      ),
    );
  };

  const deleteNotification = async (type: string, instanceName: string) => {
    setNotifications(
      notifications.filter(
        (notification) =>
          notification.instanceName !== instanceName &&
          notification.type !== type,
      ),
    );
  };

  const clearNotifications = async () => {
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
