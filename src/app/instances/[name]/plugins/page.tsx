"use client";
import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { plugins, Plugin } from "@/types/plugins";
import { useInstanceContext } from "../InstanceContext";
import { useNotificationsContext } from "@/app/NotificationContext";
import PluginsDescription from "./components/PluginsDescription";
import LoadingSkeleton from "./components/LoadingSkeleton";
import PluginEntry from "./components/PluginEntry";

export default function PluginsPage() {
  const { instance } = useInstanceContext();
  const { formPending, addNotification } = useNotificationsContext();
  const [enabledPlugins, setEnabledPlugins] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPlugins = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `/api/instances/${instance?.name}/plugins?region=${instance?.region}`,
          {
            headers: {
              "x-rabbitmq-username": instance?.user,
              "x-rabbitmq-password": instance?.password,
            },
          }
        );
        setEnabledPlugins(response.data);
      } catch (error) {
        console.error("Error fetching plugins:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlugins();
  }, [instance?.name, instance?.user, instance?.password, instance?.region]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    pluginName: string
  ) => {
    e.preventDefault();
    if (!instance?.name) return;

    const currentlyEnabled = enabledPlugins.includes(pluginName);
    const newValue = !currentlyEnabled;

    addNotification({
      type: "plugin",
      status: "pending",
      instanceName: instance?.name,
      path: "plugins",
      message: `${newValue ? "Enabling" : "Disabling"} ${pluginName}`,
    });

    setEnabledPlugins((prev) =>
      newValue ? [...prev, pluginName] : prev.filter((p) => p !== pluginName)
    );

    try {
      await axios.post(
        `/api/instances/${instance?.name}/plugins?region=${instance?.region}`,
        {
          name: pluginName,
          enabled: newValue,
        }
      );
      console.log(`${pluginName} updated successfully to ${newValue}`);
    } catch (error) {
      console.error(`Error updating ${pluginName}:`, error);

      setEnabledPlugins((prev) =>
        currentlyEnabled
          ? [...prev, pluginName]
          : prev.filter((p) => p !== pluginName)
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card rounded-sm shadow-md mt-8">
      <PluginsDescription />

      {isLoading ? (
        <LoadingSkeleton length={plugins.length} />
      ) : (
        <div className="space-y-4">
          {plugins.map((plugin: Plugin) => {
            const isEnabled = enabledPlugins.includes(plugin.name);
            return (
              <PluginEntry
                key={plugin.name}
                plugin={plugin}
                onSubmit={handleSubmit}
                isEnabled={isEnabled}
                disabled={formPending()}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
