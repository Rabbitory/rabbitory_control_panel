"use client";

import { useInstanceContext } from "../InstanceContext";
import { useEffect, useState } from "react";
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
          `/api/instances/${instance?.name}/alarms?region=${instance?.region}`
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
        `/api/instances/${instance?.name}/alarms?region=${instance?.region}&type=${type}&id=${id}`
      );
      setStorageAlarms((prev) => prev.filter((alarm) => alarm.id !== id));
      setMemoryAlarms((prev) => prev.filter((alarm) => alarm.id !== id));
    } catch (error) {
      console.error("Error deleting alarm:", error);
    }
  };

  return (
    <>
      <button
        className="px-3 py-1 bg-blue-500 text-white rounded-md mr-2"
        onClick={(e) => {
          e.preventDefault();
          router.push(
            `/instances/${instance?.name}/alarms/new?region=${instance?.region}`
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
            <div className="overflow-x-auto">
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
                          <button
                            onClick={() => handleDelete("storage", alarm.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded-md"
                          >
                            Delete
                          </button>
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
            <div className="overflow-x-auto">
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
                          <button
                            onClick={() => handleDelete("memory", alarm.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded-md"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
