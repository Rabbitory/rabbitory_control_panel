"use client";

import { useInstanceContext } from "../InstanceContext";
import { useEffect, useState } from "react";
import { NewAlarmModal } from "@/app/components/NewAlarmModal";
import { SlackModal } from "@/app/components/SlackModal";
import Dropdown from "@/app/components/Dropdown";
import ErrorBanner from "@/app/components/ErrorBanner";
import axios from "axios";

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
  const [isLoading, setIsLoading] = useState(false);
  const [storageAlarms, setStorageAlarms] = useState<Alarm[]>([]);
  const [memoryAlarms, setMemoryAlarms] = useState<Alarm[]>([]);
  const [showSlackModal, setShowSlackModal] = useState(false);
  const [showNewAlarmModal, setShowNewAlarmModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchCurrentWebhookUrl = async () => {
      try {
        const response = await axios.get(
          `/api/instances/${instance?.name}/alarms/slack?region=${instance?.region}`,
        );

        setWebhookUrl(response.data.webhookUrl || "");
      } catch (error) {
        setErrors((prev) => [...prev, "Failed to fetch webhook url"]);
      }
    };

    fetchCurrentWebhookUrl();
  }, [instance?.name, instance?.region]);


  useEffect(() => {
    const fetchAlarms = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `/api/instances/${instance?.name}/alarms?region=${instance?.region}`,
        );
        setMemoryAlarms(response.data.memory || []);
        setStorageAlarms(response.data.storage || []);
      } catch (error) {
        setErrors((prev) => [...prev, "Failed to fetch alarms"]);
      } finally {
        setIsLoading(false);
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
      setErrors((prev) => [...prev, "Failed to delete alarm"]);
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
      setErrors((prev) => [...prev, "Failed to trigger alarm"]);
    }
  };

  const resetError = (msg: string) => {
    setErrors((prev) => prev.filter((e) => e !== msg));
  };


  return (
    <>
      {errors.length > 0 && (
        <div className="mb-6 space-y-2">
          {errors.map((error, i) => (
            <ErrorBanner key={i} message={error} onClose={() => resetError(error)} />
          ))}
        </div>
      )}

      {/* Slack Endpoint Card */}
      <div className="max-w-4xl mx-auto p-6 bg-card text-pagetext1 rounded-sm shadow-md mt-8">
        <h1 className="font-heading1 text-headertext1 text-2xl mb-10">Slack Endpoint</h1>
        {webhookUrl ? (
          <table className="text-sm w-full table-auto mb-6">
            <colgroup>
              <col className="w-1/5" />
              <col />
            </colgroup>
            <tbody className="font-text1">
              <tr>
                <td className="py-2">Webhook URL:</td>
                <td className="py-2">{webhookUrl}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="font-text1 text-sm mb-6">
            You must set up a slack endpoint before creating alarms.
          </p>
        )}
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
        </div>
      </div>

      {webhookUrl &&
        <>
          <div className="max-w-4xl mx-auto p-6 bg-card text-pagetext1 rounded-sm shadow-md mt-8">
            <h1 className="font-heading1 text-headertext1 text-2xl mb-10">Alarms</h1>
            <p className="font-text1 text-sm mb-6">
              Alarms are triggered when the storage or memory usage of your RabbitMQ instance exceeds the specified thresholds.
              You can set up alarms to receive notifications via Slack using the button below.
            </p>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-full h-6 bg-gray-600 rounded-sm"></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-full h-6 bg-gray-600 rounded-sm"></div>
                  </div>
                </div>
              </div>
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
                          <th className="p-2 text-left border-b">
                            Actions
                          </th>
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
                            Reminder Interval
                          </th>
                          <th className="p-2 text-left border-b">
                            Memory Threshold
                          </th>
                          <th className="p-2 text-left border-b">
                            Actions
                          </th>
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
                    className="px-4 py-2 bg-btn1 hover:bg-btnhover1 text-sm text-mainbg1 font-semibold rounded-sm flex items-center justify-center hover:shadow-[0_0_10px_#87d9da] transition-all duration-200"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowNewAlarmModal(true);
                    }}
                  >
                    Create Alarm
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      }
      {showSlackModal && <SlackModal url={webhookUrl} onSave={(url) => setWebhookUrl(url)} onClose={handleCloseSlackModal} />}
      {showNewAlarmModal && <NewAlarmModal onClose={handleCloseNewAlarmModal} />}
    </>

  );
}
