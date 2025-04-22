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
// import Link from "next/link";
import ErrorBanner from "@/app/instances/components/ErrorBanner";
import SubmissionSpinner from "../../components/SubmissionSpinner";

export default function PluginsPage() {
  const { instance } = useInstanceContext();
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const { formPending, addNotification } = useNotificationsContext();
  const [enabledPlugins, setEnabledPlugins] = useState<string[]>([]);
  const [localStates, setLocalStates] = useState<Record<string, boolean>>(() =>
    plugins.reduce<Record<string, boolean>>((acc, p) => {
      acc[p.name] = false;
      return acc;
    }, {})
  );
  const [isLoading, setIsLoading] = useState(false);

  const configSectionRef = React.useRef<HTMLDivElement | null>(null);

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
        const map: Record<string, boolean> = {};
        plugins.forEach((plugin) => {
          map[plugin.name] = response.data.includes(plugin.name);
        });
        setLocalStates(map);
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          const apiError = error.response.data;
          setErrorMessages([apiError.message]);
        } else {
          setErrorMessages([
            "Something went wrong while fetching the plugins. Please try again.",
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlugins();
  }, [instance?.name, instance?.user, instance?.password, instance?.region]);

  useEffect(() => {
    if (errorMessages.length > 0) {
      configSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [errorMessages]);

  const hasChanges = plugins.some(
    (plugin) =>
      enabledPlugins.includes(plugin.name) !== localStates[plugin.name]
  );

  const togglePlugin = (pluginName: string) => {
    setLocalStates((prev) => ({
      ...prev,
      [pluginName]: !prev[pluginName],
    }));
  };

  const dismissError = (i: number) => {
    setErrorMessages((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!instance?.name) return;

    const updates = Object.entries(localStates)
      .filter(
        ([name, isEnabled]) => enabledPlugins.includes(name) !== isEnabled
      )
      .map(([name, enabled]) => ({ name, enabled }));

    try {
      addNotification({
        type: "plugin",
        status: "pending",
        instanceName: instance?.name,
        path: "plugins",
        message: `Applying ${updates.length} plugin change(s) on instance ${instance.name}…`,
      });
      await axios.post(
        `/api/instances/${instance?.name}/plugins?region=${instance?.region}`,

        { updates }
      );

      setEnabledPlugins(
        Object.keys(localStates).filter((name) => localStates[name])
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data;
        setErrorMessages([apiError.message]);
      } else {
        setErrorMessages([
          "Something went wrong while updating plugins. Please try again.",
        ]);
      }

      const revert: Record<string, boolean> = {};
      plugins.forEach((p) => {
        revert[p.name] = enabledPlugins.includes(p.name);
      });
      setLocalStates(revert);
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto p-6 bg-card rounded-sm shadow-md mt-8"
      ref={configSectionRef}
    >
      <PluginsDescription />
      {errorMessages.length > 0 && (
        <div className="space-y-2 mb-4">
          {errorMessages.map((msg, idx) => (
            <ErrorBanner
              key={idx}
              message={msg}
              onClose={() => dismissError(idx)}
            />
          ))}
        </div>
      )}
      {isLoading ? (
        <LoadingSkeleton length={plugins.length} />
      ) : (
        <>
          <div className="space-y-4">
            {plugins.map((plugin: Plugin) => {
              return (
                <PluginEntry
                  key={plugin.name}
                  plugin={plugin}
                  isEnabled={localStates[plugin.name]}
                  disabled={formPending()}
                  onToggle={() => togglePlugin(plugin.name)}
                />
              );
            })}
          </div>
          {hasChanges && (
            <div className="font-heading1 text-sm flex justify-end gap-4 mt-6">
              <button
                className="px-4 py-2 bg-card border-1 border-btn1 text-btn1 rounded-sm text-center hover:shadow-[0_0_8px_#87d9da] transition-all duration-200 hover:bg-card"
                onClick={() => {
                  const reset: Record<string, boolean> = {};
                  plugins.forEach((plugin) => {
                    reset[plugin.name] = enabledPlugins.includes(plugin.name);
                  });
                  setLocalStates(reset);
                }}
                disabled={formPending()}
              >
                Reset
              </button>

              <button
                onClick={handleSubmit}
                disabled={formPending()}
                className={`px-4 py-2 ${
                  formPending()
                    ? "bg-btnhover1 opacity-70 cursor-not-allowed"
                    : "bg-btn1 hover:bg-btnhover1 text-mainbg1 font-semibold rounded-sm flex items-center justify-center hover:shadow-[0_0_10px_#87d9da] transition-all duration-200"
                }`}
              >
                {formPending() ? (
                  <span className="flex items-center gap-2">
                    <SubmissionSpinner />
                    Saving ...
                  </span>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
