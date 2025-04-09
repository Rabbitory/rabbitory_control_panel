"use client";

import { useState, useEffect } from "react";
import { useNotificationsContext } from "../NotificationContext";
import { NotificationStatus } from "@/types/notification";
import axios from "axios";

export default function NotificationsDropdown() {
  const { notifications, setNotifications, updateNotification } =
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
  }, []);

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

  return (
    <div className="relative inline-block">
      <button
        onClick={toggleDropdown}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Notifications
      </button>
      {showDropdown && (
        <div className="absolute top-full right-0 bg-white border border-gray-300 shadow-md z-50 w-[200px]">
          {notifications.length === 0 ? (
            <div className="p-2 text-gray-800">No notifications</div>
          ) : (
            <ul className="list-none m-0 p-0">
              {notifications.map((notification, index) => (
                <li
                  key={index}
                  className={`flex items-center p-2 border-b border-gray-200 last:border-0 ${getTextColor(
                    notification.status
                  )}`}
                >
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${getBubbleColor(
                      notification.status
                    )}`}
                  />
                  {notification.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
