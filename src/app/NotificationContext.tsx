"use client";

import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { Notification } from "@/types/notification";
import { useNotifications } from "@/utils/useNotifications";

interface NotificationsContextType {
  notifications: Notification[];
  notificationsReady: boolean;
  addNotification: (notification: Notification) => void;
  updateNotification: (notification: Notification) => void;
  clearNotifications: () => void;
  deleteNotification: (
    type: string,
    instanceName: string,
    message: string,
    index: number
  ) => void;
  formPending: () => boolean;
  linkPending: (pageName: string) => boolean;
  instancePending: (instanceName: string) => boolean;
  instanceCreating: (instanceName: string) => boolean;
  instanceTerminated: (instanceName: string) => boolean;
  instanceCreated: (instanceName: string) => boolean;
}

const defaultContextValue: NotificationsContextType = {
  notifications: [],
  notificationsReady: false,

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
  linkPending: () => {
    throw new Error("linkPending not implemented");
  },
  instancePending: () => {
    throw new Error("instancePending not implemented");
  },
  instanceCreating: () => {
    throw new Error("instanceCreating not implemented");
  },

  instanceTerminated: () => {
    throw new Error("instanceTerminated not implemented");
  },
  instanceCreated: () => {
    throw new Error("instanceCreated not implemented");
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
    notificationsReady,
    addNotification,
    updateNotification,
    clearNotifications,
    deleteNotification,
    formPending,
    linkPending,
    instancePending,
    instanceCreating,
    instanceTerminated,
    instanceCreated,
  } = useNotifications();

  const value = useMemo(
    () => ({
      notifications,
      notificationsReady,
      linkPending,
      instancePending,
      instanceCreating,
      addNotification,
      updateNotification,
      clearNotifications,
      deleteNotification,
      formPending,
      instanceTerminated,
      instanceCreated,
    }),
    [
      notifications,
      notificationsReady,
      linkPending,
      instancePending,
      instanceCreating,
      addNotification,
      updateNotification,
      clearNotifications,
      deleteNotification,
      formPending,
      instanceTerminated,
      instanceCreated,
    ]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
