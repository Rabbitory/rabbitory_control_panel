"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { Notification, NotificationStatus } from "@/types/notification";
import { useNotifications } from "@/utils/useNotifications";

interface NotificationsContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  updateNotification: (
    type: string,
    instanceName: string,
    newStatus: NotificationStatus,
  ) => void;
  clearNotifications: () => void;
  deleteNotification: (type: string, instanceName: string) => void;
  formPending: () => boolean;
}

const defaultContextValue: NotificationsContextType = {
  notifications: [],
  addNotification: () => {
    throw new Error("addNotification not implemented");
  },
  updateNotification: () => {
    throw new Error("updateNotification not implemented");
  },
  clearNotifications: () => {
    throw new Error("clearNotifications not implemented");
  },
  deleteNotification: () => {
    throw new Error("deleteNotification not implemented");
  },
  formPending: () => {
    throw new Error("formPending not implemented");
  },
};

export const NotificationsContext =
  createContext<NotificationsContextType>(defaultContextValue);

export function useNotificationsContext() {
  return useContext(NotificationsContext);
}

interface NotificationsProviderProps {
  children: ReactNode;
}

export function NotificationsProvider({
  children,
}: NotificationsProviderProps) {
  const {
    notifications,
    addNotification,
    updateNotification,
    clearNotifications,
    deleteNotification,
    formPending,
  } = useNotifications();

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        addNotification,
        updateNotification,
        clearNotifications,
        deleteNotification,
        formPending,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
