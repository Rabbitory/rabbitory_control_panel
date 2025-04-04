"use client";

import { useEffect, useState } from "react";

interface InstanceReadyEvent {
  instanceId: string;
  instanceName: string;
  timestamp: string;
}

export default function Notifications() {
  const [instanceReadyEvents, setInstanceReadyEvents] = useState<
    InstanceReadyEvent[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.addEventListener("instanceReady", (event: MessageEvent) => {
      try {
        const data: InstanceReadyEvent = JSON.parse(event.data);
        setInstanceReadyEvents((prev) => [...prev, data]);
      } catch (error) {
        console.error("Error parsing instanceReady message:", error);
      }
    });

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const toggleNotifications = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className="relative inline-block cursor-pointer"
        onClick={toggleNotifications}
      >
        {/* Notification icon (using an emoji for simplicity, replace with your icon if needed) */}
        <span className="text-3xl">🔔</span>
        {/* Red badge for notification count */}
        {instanceReadyEvents.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {instanceReadyEvents.length}
          </span>
        )}
      </div>

      {isOpen && (
        <div className="mt-2 p-2 border border-gray-300 rounded-md bg-gray-200 text-black text-sm w-64 shadow-lg">
          <h2 className="font-semibold mb-1">Notifications</h2>
          {instanceReadyEvents.length === 0 ? (
            <p>No notifications</p>
          ) : (
            <ul className="max-h-60 overflow-y-auto">
              {instanceReadyEvents.map((msg, idx) => (
                <li key={idx} className="border-b last:border-none py-1">
                  {msg.instanceName} is ready!
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
