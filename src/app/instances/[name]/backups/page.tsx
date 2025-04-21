"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useInstanceContext } from "../InstanceContext";
import { useNotificationsContext } from "@/app/NotificationContext";
import BackupsDescription from "./components/BackupsDescription";
import ManualBackupButton from "./components/ManualBackupButton";
import LoadingSkeleton from "./components/LoadingSkeleton";
import BackupsTable from "./components/BackupsTable";
import Backup from "./types/backup";

export default function BackupsPage() {
  const { instance } = useInstanceContext();

  if (!instance) {
    throw new Error("Instance not found");
  }

  const { addNotification, formPending } = useNotificationsContext();

  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBackups = async () => {
      if (!instance?.name) return;
      setIsLoading(true);
      try {
        const response = await axios.get(
          `/api/instances/${instance.name}/backups?region=${instance.region}`
        );

        setBackups(response.data);
      } catch (error) {
        console.error("Error fetching backups:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackups();
  }, [instance?.name, instance?.region, instance?.user, instance?.password]);

  const handleManualBackup = async () => {
    if (!instance?.name) return;
    addNotification({
      type: "backup",
      status: "pending",
      instanceName: instance?.name,
      path: "backups",
      message: `Saving backup for ${instance?.name}`,
    });
    try {
      const response = await axios.post(
        `/api/instances/${instance.name}/backups?region=${instance.region}`,
        null,
        {
          headers: {
            "x-rabbitmq-username": instance.user,
            "x-rabbitmq-password": instance.password,
          },
        }
      );
      setBackups(response.data);
    } catch (error) {
      console.error("Error creating manual backup:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card rounded-sm shadow-md mt-8 text-pagetext1">
      <BackupsDescription />
      <ManualBackupButton
        onClick={handleManualBackup}
        disabled={formPending()}
      />

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <BackupsTable
          backups={backups}
          instance={instance}
        />
      )}
    </div>
  );
}
