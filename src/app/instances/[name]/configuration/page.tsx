"use client";
import * as React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useInstanceContext } from "../InstanceContext";
import { useNotificationsContext } from "@/app/NotificationContext";
import { configItems } from "@/types/configuration";
import { validateConfiguration } from "@/utils/validateConfig";
import ErrorBanner from "@/app/components/ErrorBanner";
import Link from "next/link";
import SubmissionSpinner from "@/app/components/SubmissionSpinner";

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
      configSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
  
    if (!instance || !instance.name) {
      throw new Error("No instance found");
    };

    await addNotification({
      type: "configuration",
      status: "pending",
      instanceName: instance.name,
      path: "configuration",
      message: `Setting new configuration for ${instance?.name}`,
    });

    try {
      console.log("Submitting configuration:", configuration);

      const response = await axios.post(
        `/api/instances/${instance?.name}/configuration?region=${instance?.region}`,
        { configuration },
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
      <h1 className="font-heading1 text-headertext1 text-2xl mb-10">Configuration</h1>
      <p className="font-text1 text-sm text-pagetext1 mb-6">
        Below are the RabbitMQ server configurations. For detailed explanations
        of each setting, refer to the{" "}
        <a
          href="https://www.rabbitmq.com/docs/configure"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-pagetext1 hover:text-headertext1"
        >
          RabbitMQ Configuration Guide
        </a>
        .
      </p>

      {errors.length > 0 && (
        <div className="mb-6 space-y-2">
          {errors.map((error, i) => (
            <ErrorBanner key={i} message={error} onClose={() => resetError(error)} />
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <table className="w-full border-collapse">
          <thead className="font-heading1 text-headertext1 text-sm">
            <tr>
              <th className="p-2 text-left border-b">Setting</th>
              <th className="p-2 text-left border-b">Description</th>
              <th className="p-2 text-left border-b">Value</th>
            </tr>
          </thead>
          <tbody className={`font-text1 text-sm ${isLoading ? "" : "animate-fade-in"}`}>
            {configItems.map((item) => (
              <tr key={item.key} className="p-2">
                <td className="p-2 border-b">
                  {isLoading ? (
                    <div className="w-32 h-4 bg-gray-600 rounded-sm animate-pulse"></div>
                  ) : (
                    item.key
                  )}
                </td>
                <td className="p-2 border-b">
                  {isLoading ? (
                    <div className="w-48 h-4 bg-gray-600 rounded-sm animate-pulse"></div>
                  ) : (
                    item.description
                  )}
                </td>
                <td className="p-2 border-b w-1/6 text-center">
                  {isLoading ? (
                    <div className="w-24 h-4 bg-gray-600 rounded-sm animate-pulse"></div>
                  ) : item.type === "dropdown" && item.options ? (
                    <select
                      name={item.key}
                      value={configuration[item.key] ?? ""}
                      onChange={handleChange}
                      className="w-full p-1 border rounded-sm text-sm"
                    >
                      {item.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={item.type}
                      name={item.key}
                      aria-label={item.key}
                      readOnly={item.readOnly}
                      value={configuration[item.key] ?? ""}
                      onChange={handleChange}
                      className="text-sm w-full py-1 pl-2 pr-1 border rounded-md"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="font-heading1 text-sm flex justify-end gap-4 mt-6">
          <Link
            href="/"
            className="px-4 py-2 bg-card border-1 border-btn1 text-btn1 rounded-sm text-center hover:shadow-[0_0_8px_#87d9da] transition-all duration-200 hover:bg-card"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={formPending()}
            className={`px-4 py-2 text-mainbg1 font-semibold rounded-sm ${
              formPending()
                ? "bg-btnhover1 opacity-70 cursor-not-allowed"
                : "bg-btn1 hover:bg-btnhover1 flex items-center justify-center hover:shadow-[0_0_10px_#87d9da] transition-all duration-200"
            }`}
          >
            {formPending() ? 
              <span className="flex items-center gap-2">
                  <SubmissionSpinner />
                  Saving ...
              </span>
              : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
