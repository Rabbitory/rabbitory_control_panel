"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface Notification {
  status: "error" | "pending" | "success";
  message: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
}

const defaultContextValue: NotificationsContextType = {
  notifications: [],
  setNotifications: () => {
    throw new Error("setNotifications called outside of NotificationsProvider");
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
  const [notifications, setNotifications] = useState<Notification[]>([]);

  return (
    <NotificationsContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}
