"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { Notification } from "@/types/notification";
import { useNotifications } from "@/utils/useNotifications";

interface NotificationsContextType {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  addNotification: (notification: Notification) => void;
  updateNotification: (notification: Notification) => void;
  clearNotifications: () => void;
  deleteNotification: (type: string, instanceName: string) => void;
  formPending: () => boolean;
}

const defaultContextValue: NotificationsContextType = {
  notifications: [],
  setNotifications: () => {
    throw new Error("setNotifications not implemented");
  },
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
    setNotifications,
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
        setNotifications,
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
