"use client";

import { useState, useEffect, useRef } from "react";
import { useNotificationsContext } from "../NotificationContext";
import { NotificationStatus } from "@/types/notification";
import { Bell, X } from "lucide-react";


export default function NotificationsDropdown() {
  const { notifications, updateNotification, deleteNotification } = useNotificationsContext();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const getTextColor = (status: NotificationStatus) => {
    switch (status) {
      case "success":
        return "text-btnhover1";
      case "pending":
        return "text-btn1";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-800";
    }
  };

  const getBubbleColor = (status: NotificationStatus) => {
    switch (status) {
      case "success":
        return "bg-btnhover1";
      case "pending":
        return "bg-btn1";
      case "error":
        return "bg-red-400";
      default:
        return "bg-gray-500";
    }
  };

  useEffect(() => {
    const eventSource = new EventSource("/api/notifications");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      updateNotification(data);
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [updateNotification]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const notificationCount = notifications.length;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 transition group"
        aria-label="Toggle notifications dropdown"
      >
        <Bell className="w-5 h-5 text-btn1 group-hover:animate-wiggle hover:text-checkmark" />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-400 text-white rounded-full text-xs w-4 h-4 px-[2.5] flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 bg-card border border-mainbg1 z-50 w-64 p-2 rounded-sm">
          {notificationCount === 0 ? (
            <div className="font-text1 text-pagetext1 text-sm p-1">No notifications</div>
          ) : (
            <ul className="text-sm space-y-2">
              {notifications.map((notification, index) => (
                <li
                  key={index}
                  className={`font-text1 flex items-start border-b last:border-none border-gray-200 pb-1 ${getTextColor(
                    notification.status
                  )}`}
                >
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-2 mt-2 ${getBubbleColor(
                      notification.status
                    )}`}
                  />
                  <span className="flex-1 break-words">{notification.message}</span>
                  <button
                    onClick={() =>
                      deleteNotification(
                        notification.type,
                        notification.instanceName,
                        notification.message,
                        index
                      )
                    }
                    className="ml-2 text-pagetext1 hover:text-card text-xs"
                    disabled={notification.status === "pending"}
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
