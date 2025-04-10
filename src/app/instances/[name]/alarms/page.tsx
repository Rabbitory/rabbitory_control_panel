"use client";

import { useInstanceContext } from "../InstanceContext";
import { useEffect, useState } from "react";
import { SlackModal } from "@/app/components/SlackModal";
import Dropdown from "@/app/components/Dropdown";
import axios from "axios";
import { useRouter } from "next/navigation";
import { NewAlarmModal } from "@/app/components/NewAlarmModal";

interface Alarm {
  id: string;
  data: {
    memoryThreshold: number;
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
  const [showSlackModal, setShowSlackModal] = useState(false);
  const [showNewAlarmModal, setShowNewAlarmModal] = useState(false);

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

  const handleCloseSlackModal = () => {
    setShowSlackModal(false);
  }

  const handleCloseNewAlarmModal = () => {
    setShowNewAlarmModal(false);
  }

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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card text-pagetext1 rounded-sm shadow-md mt-8">
      <h1 className="font-heading1 text-headertext1 text-2xl mb-10">Alarms</h1>

      {isFetching ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Storage Alarms Section */}
          <div className="mb-15">
            <h2 className="text-md font-heading1 text-headertext1 mb-2">
              Storage Alarms
            </h2>
            <div className="overflow-visible">
              <table className="font-heading1 text-sm w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left border-b">
                      Storage Threshold
                    </th>
                    <th className="p-2 text-left border-b">
                      Reminder Interval
                    </th>
                    <th className="p-2 text-left border-b">Memory Threshold</th>
                    <th className="p-2 text-left border-b">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-text1 text-sm text-pagetext1">
                  {storageAlarms.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-2 text-md text-center text-gray-600">
                        No storage alarms yet.
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
                          {alarm.data.memoryThreshold}
                        </td>
                        <td className="p-2 border-b">
                          <Dropdown
                            label="Actions"
                            options={{
                              Delete: () => handleDelete("storage", alarm.id),
                              Trigger: () => handleTrigger("storage", alarm),
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
          <div className="mb-15">
            <h2 className="text-md font-heading1 text-headertext1 mb-2">
              Memory Alarms
            </h2>
            <div className="overflow-visible">
              <table className="font-heading1 text-sm w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left border-b">
                      Storage Threshold
                    </th>
                    <th className="p-2 text-left border-b">
                      Reminder Interval
                    </th>
                    <th className="p-2 text-left border-b">Memory Threshold</th>
                    <th className="p-2 text-left border-b">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-text1 text-sm text-pagetext1">
                  {memoryAlarms.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-2 text-center text-gray-600">
                        No memory alarms yet.
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
                          {alarm.data.memoryThreshold}
                        </td>
                        <td className="p-2 border-b">
                          <Dropdown
                            label="Actions"
                            options={{
                              Delete: () => handleDelete("memory", alarm.id),
                              Trigger: () => handleTrigger("memory", alarm),
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

          <div className="font-heading1 text-sm flex justify-end gap-4 mt-6">
            <button
              className="px-4 py-2 bg-card border-1 border-btn1 text-btn1 rounded-sm text-center hover:shadow-[0_0_8px_#87d9da] transition-all duration-200 hover:bg-card"
              onClick={(e) => {
                e.preventDefault();
                setShowSlackModal(true);
              }}
            >
              Setup Slack
            </button>
            <button
              className="px-4 py-2 bg-btn1 hover:bg-btnhover1 text-sm text-mainbg1 font-semibold rounded-sm flex items-center justify-center hover:shadow-[0_0_10px_#87d9da] transition-all duration-200"
              onClick={(e) => {
                e.preventDefault();
                setShowNewAlarmModal(true);
                // router.push(
                //   `/instances/${instance?.name}/alarms/new?region=${instance?.region}`,
                // );
              }}
            >
              Create Alarm
            </button>
          </div>
        </>
      )}
      {showSlackModal && <SlackModal onClose={handleCloseSlackModal} />}
      {showNewAlarmModal && <NewAlarmModal onClose={handleCloseNewAlarmModal} />}
    </div>
  );
}
