"use client";

import { useInstanceContext } from "../InstanceContext";
import { useEffect, useState } from "react";
import Dropdown from "@/app/components/Dropdown";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Alarm {
  id: string;
  data: {
    timeThreshold: number;
    storageThreshold: number;
    reminderInterval: number;
  };
}

export default function AlarmsPage() {
  const { instance } = useInstanceContext();
  const router = useRouter();
  const [isFetching, setIsFetching] = useState(false);
  const [storageAlarms, setStorageAlarms] = useState<Alarm[]>([]);
  const [memoryAlarms, setMemoryAlarms] = useState<Alarm[]>([]);

  useEffect(() => {
    const fetchAlarms = async () => {
      setIsFetching(true);
      try {
        const response = await axios.get(
          `/api/instances/${instance?.name}/alarms?region=${instance?.region}`,
        );
        setMemoryAlarms(response.data.memory || []);
        setStorageAlarms(response.data.storage || []);
      } catch (error) {
        console.error("Error fetching alarms:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchAlarms();
  }, [instance?.name, instance?.region]);

  const handleDelete = async (type: "storage" | "memory", id: string) => {
    try {
      await axios.delete(
        `/api/instances/${instance?.name}/alarms?region=${instance?.region}&type=${type}&id=${id}`,
      );
      setStorageAlarms((prev) => prev.filter((alarm) => alarm.id !== id));
      setMemoryAlarms((prev) => prev.filter((alarm) => alarm.id !== id));
    } catch (error) {
      console.error("Error deleting alarm:", error);
    }
  };

  const handleTrigger = async (type: "storage" | "memory", alarm: Alarm) => {
    try {
      await axios.post(
        `/api/instances/${instance?.name}/alarms/trigger?region=${instance?.region}&type=${type}`,
        alarm,
        {
          headers: {
            "x-rabbitmq-username": instance?.user,
            "x-rabbitmq-password": instance?.password,
          },
        },
      );
      console.log("Alarm triggered successfully");
    } catch (error) {
      console.error("Error triggering alarm:", error);
    }
  };

  const handleResolve = async (id: Alarm["id"]) => {
    try {
      await axios.post(
        `/api/instances/${instance?.name}/alarms/resolve?region=${instance?.region}&&id=${id}`,
        null,
      );
      console.log("Alarm resolved successfully");
    } catch (error) {
      console.error("Error resolving alarm:", error);
    }
  };

  return (
    <>
      <button
        className="px-3 py-1 bg-blue-500 text-white rounded-md mr-2"
        onClick={(e) => {
          e.preventDefault();
          router.push(
            `/instances/${instance?.name}/alarms/new?region=${instance?.region}`,
          );
        }}
      >
        Create Alarm
      </button>
      {isFetching ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Storage Alarms Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Storage Alarms
            </h2>
            <div className="overflow-visible">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left border-b">
                      Storage Threshold
                    </th>
                    <th className="p-2 text-left border-b">
                      Reminder Interval
                    </th>
                    <th className="p-2 text-left border-b">Time Threshold</th>
                    <th className="p-2 text-left border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {storageAlarms.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-2 text-center text-gray-600">
                        No storage alarms found.
                      </td>
                    </tr>
                  ) : (
                    storageAlarms.map((alarm) => (
                      <tr key={alarm.id}>
                        <td className="p-2 border-b">
                          {alarm.data.storageThreshold}
                        </td>
                        <td className="p-2 border-b">
                          {alarm.data.reminderInterval}
                        </td>
                        <td className="p-2 border-b">
                          {alarm.data.timeThreshold}
                        </td>
                        <td className="p-2 border-b">
                          <Dropdown
                            label="Actions"
                            options={{
                              Delete: () => handleDelete("storage", alarm.id),
                              Trigger: () => handleTrigger("storage", alarm),
                              Resolve: () => handleResolve(alarm.id),
                            }}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Memory Alarms Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Memory Alarms
            </h2>
            <div className="overflow-visible">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left border-b">
                      Storage Threshold
                    </th>
                    <th className="p-2 text-left border-b">
                      Reminder Interval
                    </th>
                    <th className="p-2 text-left border-b">Time Threshold</th>
                    <th className="p-2 text-left border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {memoryAlarms.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-2 text-center text-gray-600">
                        No memory alarms found.
                      </td>
                    </tr>
                  ) : (
                    memoryAlarms.map((alarm) => (
                      <tr key={alarm.id}>
                        <td className="p-2 border-b">
                          {alarm.data.storageThreshold}
                        </td>
                        <td className="p-2 border-b">
                          {alarm.data.reminderInterval}
                        </td>
                        <td className="p-2 border-b">
                          {alarm.data.timeThreshold}
                        </td>
                        <td className="p-2 border-b">
                          <Dropdown
                            label="Actions"
                            options={{
                              Delete: () => handleDelete("memory", alarm.id),
                              Trigger: () => handleTrigger("memory", alarm),
                              Resolve: () => handleResolve(alarm.id),
                            }}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded-md mr-2"
            onClick={(e) => {
              e.preventDefault();
              router.push(
                `/instances/${instance?.name}/alarms/slack?region=${instance?.region}`,
              );
            }}
          >
            Setup Slack
          </button>
        </>
      )}
    </>
  );
}
