"use client";

import { useState, useEffect } from "react";
import { useNotificationsContext } from "../NotificationContext";
import { NotificationStatus } from "@/types/notification";

export default function NotificationsDropdown() {
  const { notifications, updateNotification, deleteNotification } =
    useNotificationsContext();
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const getTextColor = (status: NotificationStatus) => {
    switch (status) {
      case "success":
        return "text-green-400";
      case "pending":
        return "text-blue-400";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-800";
    }
  };

  const getBubbleColor = (status: NotificationStatus) => {
    switch (status) {
      case "success":
        return "bg-green-400";
      case "pending":
        return "bg-blue-400";
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

  const notificationCount = notifications.length;

  return (
    <div className="relative inline-block">
      <button
        onClick={toggleDropdown}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Notifications
        {notificationCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full text-xs px-2 py-1">
            {notificationCount}
          </span>
        )}
      </button>
      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 shadow-md z-50 w-40 p-2">
          {notificationCount === 0 ? (
            <div className="text-gray-800 text-xs">No notifications</div>
          ) : (
            <ul className="list-none m-0 p-0 text-xs">
              {notifications.map((notification, index) => (
                <li
                  key={index}
                  className={`flex items-start p-2 border-b border-gray-200 last:border-0 ${getTextColor(
                    notification.status
                  )}`}
                >
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 mt-1 ${getBubbleColor(
                      notification.status
                    )}`}
                  />
                  {/* Use break-all for especially long words or single unbroken strings */}
                  <span className="flex-1 whitespace-normal break-all">
                    {notification.message}
                  </span>
                  <button
                    onClick={() =>
                      deleteNotification(
                        notification.type,
                        notification.instanceName,
                        notification.message
                      )
                    }
                    className="ml-2 text-xs text-red-500 hover:text-red-700"
                  >
                    X
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
