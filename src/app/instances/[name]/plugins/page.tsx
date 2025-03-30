"use client";
import * as React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { plugins, Plugin } from "@/types/plugins";
import { useInstanceContext } from "../InstanceContext";

export default function PluginsPage() {
  const { instance } = useInstanceContext();
  const [enabledPlugins, setEnabledPlugins] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPlugins = async () => {
      setIsFetching(true);
      try {
        const response = await axios.get(
          `/api/instances/${instance?.name}/plugins`,
        );
        console.log(response.data);
        setEnabledPlugins(response.data);
      } catch (error) {
        console.error("Error fetching plugins:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchPlugins();
  }, [instance?.name]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    pluginName: string,
  ) => {
    e.preventDefault();
    const currentlyEnabled = enabledPlugins.includes(pluginName);
    const newValue = !currentlyEnabled;

    //update the state immediately,
    // we do this so that the toggle button updates immediately.
    setEnabledPlugins((prev) =>
      newValue ? [...prev, pluginName] : prev.filter((p) => p !== pluginName),
    );
    setIsSaving(true);

    try {
      await axios.post(`/api/instances/${instance?.name}/plugins`, {
        name: pluginName,
        enabled: newValue,
      });
      console.log(`${pluginName} updated successfully to ${newValue}`);
    } catch (error) {
      console.error(`Error updating ${pluginName}:`, error);

      setEnabledPlugins((prev) =>
        currentlyEnabled
          ? [...prev, pluginName]
          : prev.filter((p) => p !== pluginName),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
        Plugins
      </h1>
      {isSaving && <p className="text-gray-600">Saving...</p>}
      {isFetching ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <div className="space-y-4">
          {plugins.map((plugin: Plugin) => {
            const isEnabled = enabledPlugins.includes(plugin.name);
            return (
              <form
                key={plugin.name}
                onSubmit={(e) => handleSubmit(e, plugin.name)}
                className="flex flex-col md:flex-row items-center justify-between border-b pb-4"
              >
                <div className="mb-2 md:mb-0">
                  <h2 className="text-xl font-semibold">{plugin.name}</h2>
                  <p className="text-gray-600">{plugin.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      aria-label={plugin.name}
                      // When toggled, the form is immediately submitted.
                      onChange={(e) => e.currentTarget.form?.requestSubmit()}
                      className="sr-only peer"
                    />
                    <div
                      className="w-11 h-6 bg-gray-200 rounded-full
             peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300
             dark:bg-gray-700
             peer-checked:bg-green-500
             peer-checked:after:translate-x-full peer-checked:after:border-white
             after:content-[''] after:absolute after:top-0.5 after:left-[2px]
             after:bg-white after:border-gray-300 after:border after:rounded-full
             after:h-5 after:w-5 after:transition-all"
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
