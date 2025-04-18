"use client";

import axios from "axios";
import { useInstanceContext } from "../InstanceContext";
import { useEffect, useState } from "react";
import { NewAlarmModal } from "./components/NewAlarmModal";
import { SlackModal } from "./components/SlackModal";
import SlackEndpointCard from "./components/SlackEndpointCard";
import StorageAlarmsSection from "./components/StorageAlarmsSection";
import MemoryAlarmsSection from "./components/MemoryAlarmsSection";
import LoadingSkeleton from "./components/LoadingSkeleton";
import CreateAlarmButton from "./components/CreateAlarmButton";
import Alarm from "./types/alarm";


export default function AlarmsPage() {
  const { instance } = useInstanceContext();
  const [isLoading, setIsLoading] = useState(false);
  const [storageAlarms, setStorageAlarms] = useState<Alarm[]>([]);
  const [memoryAlarms, setMemoryAlarms] = useState<Alarm[]>([]);
  const [showSlackModal, setShowSlackModal] = useState(false);
  const [showNewAlarmModal, setShowNewAlarmModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    const fetchCurrentWebhookUrl = async () => {
      try {
        const response = await axios.get(
          `/api/instances/${instance?.name}/alarms/slack?region=${instance?.region}`,
        );

        setWebhookUrl(response.data.webhookUrl || "");
      } catch (error) {
        console.error("Error fetching webhook url:", error);
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
        console.error("Error fetching alarms:", error);
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
      if (type === "storage") {
        setStorageAlarms((prev) => prev.filter((alarm) => alarm.id !== id));
      } else {
        setMemoryAlarms((prev) => prev.filter((alarm) => alarm.id !== id));
      }
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
    <>
      <SlackEndpointCard
        webhookUrl={webhookUrl}
        onClick={() => setShowSlackModal(true)}
      />

      {webhookUrl &&
        <>
          <div className="max-w-4xl mx-auto p-6 bg-card text-pagetext1 rounded-sm shadow-md mt-8">
            <h1 className="font-heading1 text-headertext1 text-2xl mb-10">Alarms</h1>
            <p className="font-text1 text-sm mb-6">
              Alarms are triggered when the storage or memory usage of your RabbitMQ instance exceeds the specified thresholds.
              You can set up alarms to receive notifications via Slack using the button below.
            </p>
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <>
                <StorageAlarmsSection
                  storageAlarms={storageAlarms}
                  onDelete={handleDelete}
                  onTrigger={handleTrigger}
                />

                <MemoryAlarmsSection
                  memoryAlarms={memoryAlarms}
                  onDelete={handleDelete}
                  onTrigger={handleTrigger}
                />

                <CreateAlarmButton onClick={() => setShowNewAlarmModal(true)} />
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
