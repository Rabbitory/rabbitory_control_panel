"use client";
import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useInstanceContext } from "../InstanceContext";
import { useNotificationsContext } from "@/app/NotificationContext";
import { validateConfiguration } from "@/utils/validateConfig";
import ErrorBanner from "@/app/instances/components/ErrorBanner";
import ConfigurationDescription from "./components/ConfigurationDescription";
import ComponentsForm from "./components/ComponentsForm";

interface Configuration {
  [key: string]: string;
}

export default function ConfigurationPage() {
  const { instance } = useInstanceContext();
  const { addNotification, formPending } = useNotificationsContext();
  const [configuration, setConfiguration] = useState<Configuration>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errors, setErrors] = useState<string[]>([]);
  const configSectionRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchConfiguration = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `/api/instances/${instance?.name}/configuration?region=${instance?.region}`
        );
        setConfiguration(response.data);
      } catch (error) {
        console.error("Error fetching configuration:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfiguration();
  }, [instance?.name, instance?.region]);

  useEffect(() => {
    if (errors.length > 0) {
      configSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [errors]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setConfiguration((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validateConfiguration(configuration);
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      return;
    }

    if (!instance || !instance.name) {
      throw new Error("No instance found");
    }

    try {
      addNotification({
        type: "configuration",
        status: "pending",
        instanceName: instance.name,
        path: "configuration",
        message: `Setting new configuration for ${instance?.name}`,
      });

      const response = await axios.post(
        `/api/instances/${instance?.name}/configuration?region=${instance?.region}`,
        { configuration }
      );
      setConfiguration(response.data);
    } catch (error) {
      console.error("Error saving configuration:", error);
    }
  };

  const resetError = (msg: string) => {
    setErrors((prev) => prev.filter((e) => e !== msg));
  };

  return (
    <div
      className="max-w-4xl mx-auto p-6 bg-card text-pagetext1 rounded-sm shadow-md mt-8"
      ref={configSectionRef}
    >
      <ConfigurationDescription />

      {errors.length > 0 && (
        <div className="mb-6 space-y-2">
          {errors.map((error, i) => (
            <ErrorBanner
              key={i}
              message={error}
              onClose={() => resetError(error)}
            />
          ))}
        </div>
      )}

      <ComponentsForm
        configuration={configuration}
        isLoading={isLoading}
        onChange={handleChange}
        onSubmit={handleSubmit}
        disabled={errors.length > 0 || formPending()}
        pending={formPending()}
      />
    </div>
  );
}
