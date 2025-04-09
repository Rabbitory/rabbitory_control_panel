"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useInstanceContext } from "../InstanceContext";

interface DefinitionBackup {
  timestamp: string;
  rabbitmq_version: string;
  trigger: string;
  definitions: Record<string, unknown>;
}

export default function DefinitionsPage() {
  const { instance } = useInstanceContext();

  const [backups, setBackups] = useState<DefinitionBackup[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchDefinitions = async () => {
      if (!instance?.name) return;
      setIsFetching(true);
      try {
        const response = await axios.get(
          `/api/instances/${instance.name}/definitions?region=${instance.region}`
        );
        console.log(response.data);
        setBackups(response.data);
      } catch (error) {
        console.error("Error fetching definitions:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchDefinitions();
  }, [instance?.name, instance?.region, instance?.user, instance?.password]);

  const handleManualBackup = async () => {
    if (!instance?.name) return;
    setIsSaving(true);
    try {
      const response = await axios.post(
        `/api/instances/${instance.name}/definitions?region=${instance.region}`,
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = (backup: DefinitionBackup) => {
    const jsonString = JSON.stringify(backup.definitions, null, 2);

    const blob = new Blob([jsonString], { type: "application/json" });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${instance?.name}-${backup.timestamp}.json`);
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(url);
    link.remove();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card rounded-sm shadow-md mt-6 text-pagetext1">
      <h1 className="font-heading1 text-headertext1 text-2xl mb-6">
        Definitions
      </h1>
      <p className="font-text1 mb-10">
        Download backups of the cluster definitions. See{" "}
        <a
          href="https://www.rabbitmq.com/docs/definitions"
          className="underline hover:text-headertext1"
          target="_blank"
          rel="noopener noreferrer"
        >
          RabbitMQ documentation
        </a>
        .
      </p>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleManualBackup}
          disabled={isSaving}
          className="font-heading1 px-4 py-2 mb-8 bg-btn1 hover:bg-btnhover1 text-mainbg1 font-semibold rounded-sm flex items-center justify-center hover:shadow-[0_0_10px_#87d9da] transition-all duration-200"
        >
          {isSaving ? "Creating Backup..." : "+ Add Manual Backup"}
        </button>
      </div>

      {isFetching ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <div className="overflow-x-auto text-sm">
          <table className="w-full border-collapse">
            <thead className="font-heading1">
              <tr>
                <th className="p-2 text-left border-b border-gray-300">Date</th>
                <th className="p-2 text-left border-b border-gray-300">Broker version</th>
                <th className="p-2 text-left border-b border-gray-300">Trigger</th>
                <th className="p-2 text-left border-b border-gray-300"></th>
              </tr>
            </thead>
            <tbody className="font-text1">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-2 text-gray-600">
                    No backups found.
                  </td>
                </tr>
              ) : (
                backups.map((backup, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border-b border-gray-300">{backup.timestamp}</td>
                    <td className="p-2 border-b border-gray-300">{backup.rabbitmq_version}</td>
                    <td className="p-2 border-b border-gray-300">{backup.trigger}</td>
                    <td className="p-2 border-b border-gray-300">
                      <button
                        onClick={() => handleDownload(backup)}
                        className="px-3 py-1 bg-mainbg1 text-white rounded-sm mr-2 hover:bg-mainbghover"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
