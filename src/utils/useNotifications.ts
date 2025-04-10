"use client";

import { useState, useEffect, useCallback } from "react";
import { Notification } from "@/types/notification";
import { usePathname } from "next/navigation";
import axios from "axios";

export const useNotifications = () => {
  const path = usePathname();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  useEffect(() => {
    const fetchNotificationsBackups = async () => {
      try {
        const response = await axios.get("/api/notifications/backups");
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotificationsBackups();
  }, []);

  const addNotification = async (newNotification: Notification) => {
    setNotifications((prevNotifications) => {
      return [...prevNotifications, newNotification];
    });
    try {
      await axios.post("/api/notifications", newNotification);
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  const updateNotification = useCallback((newNotification: Notification) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.type === newNotification.type &&
        notification.instanceName === newNotification.instanceName
          ? { ...notification, ...newNotification }
          : notification
      )
    );
  }, []);

  const deleteNotification = (type: string, instanceName: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter(
        (notification) =>
          !(
            notification.type === type &&
            notification.instanceName === instanceName
          )
      )
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

  // useEffect(() => {});

  return {
    notifications,
    setNotifications,
    addNotification,
    updateNotification,
    clearNotifications,
    deleteNotification,
    formPending,
  };
};
