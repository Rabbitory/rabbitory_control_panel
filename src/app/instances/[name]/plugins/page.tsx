"use client";
import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { plugins, Plugin } from "@/types/plugins";
import { useInstanceContext } from "../InstanceContext";
import { useNotificationsContext } from "@/app/NotificationContext";

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

    await addNotification({
      type: "plugin",
      status: "pending",
      instanceName: instance?.name,
      path: "plugins",
      message: `${newValue ? "Enabling" : "Disabling"} ${pluginName}`,
    });

    //update the state immediately,
    // we do this so that the toggle button updates immediately.
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
      <h1 className="font-heading1 text-2xl text-headertext1 mb-10">Plugins</h1>
      <p className="font-text1 text-sm text-pagetext1 mb-6">
        Below is a list of RabbitMQ plugins that you can enable or disable.
        Toggling a plugin will immediately update its status on this page and
        within your RabbitMQ instance. For more detailed information on RabbitMQ
        plugins and their management, refer to the{" "}
        <a
          href="https://www.rabbitmq.com/docs/plugins"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-pagetext1 hover:text-headertext1"
        >
          RabbitMQ Plugins Guide
        </a>
        .
      </p>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(plugins.length)].map((_, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-center justify-between border-b border-gray-300 pb-4 animate-pulse"
            >
              <div className="mb-2 md:mb-0">
                <div className="w-32 h-4 bg-gray-600 rounded-sm"></div>
                <div className="w-48 h-3 bg-gray-60 rounded-sm mt-2"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-4 bg-gray-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {plugins.map((plugin: Plugin) => {
            const isEnabled = enabledPlugins.includes(plugin.name);
            return (
              <form
                key={plugin.name}
                onSubmit={(e) => handleSubmit(e, plugin.name)}
                className="flex flex-col md:flex-row items-center justify-between border-b border-gray-300 pb-4"
              >
                <div className="mb-2 md:mb-0">
                  <h2
                    className={`font-heading1 text-sm ${
                      isEnabled ? "text-btnhover1" : "text-pagetext1"
                    }`}
                  >
                    {plugin.name}
                  </h2>
                  <p className="font-text1 text-xs text-gray-500">
                    {plugin.description}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      aria-label={plugin.name}
                      onChange={(e) => e.currentTarget.form?.requestSubmit()}
                      className="sr-only peer"
                      disabled={formPending()}
                    />
                    <div
                      className="w-8 h-4 bg-pagetext1/60 rounded-full
               peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300
               peer-checked:bg-btnhover1
               peer-checked:after:translate-x-4 peer-checked:after:border-white
               after:content-[''] after:absolute after:top-0.5 after:left-[2px]
               after:bg-white after:border-gray-300 after:border after:rounded-full
               after:h-3 after:w-3 after:transition-all"
                    ></div>
                  </label>
                </div>
              </form>
            );
          })}
        </div>
      )}
    </div>
  );
}
