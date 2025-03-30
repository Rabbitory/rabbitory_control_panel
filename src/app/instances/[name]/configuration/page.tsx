"use client";
import * as React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useInstanceContext } from "../InstanceContext";
import { configItems } from "@/types/configuration";
import { validateConfiguration } from "@/utils/validateConfig";
import Link from "next/link";

interface Configuration {
  [key: string]: string;
}

export default function ConfigurationPage() {
  const { instance } = useInstanceContext();
  const [configuration, setConfiguration] = useState<Configuration>({});
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchConfiguration = async () => {
      setIsFetching(true);
      try {
        const response = await axios.get(
          `/api/instances/${instance?.name}/configuration`,
        );
        console.log(response.data);
        setConfiguration(response.data);
      } catch (error) {
        console.error("Error fetching configuration:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchConfiguration();
  }, [instance?.name]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setConfiguration((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { valid, errors } = validateConfiguration(configuration);
    if (!valid) {
      console.error("Invalid configuration:", errors);
      return;
    }
    setIsSaving(true);
    try {
      const response = await axios.post(
        `/api/instances/${instance?.name}/configuration`,
        {
          configuration,
        },
      );
      //console.log(response.data);
      setConfiguration(response.data);
    } catch (error) {
      console.error("Error saving configuration:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
        Configuration
      </h1>
      {isFetching ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left border-b">Setting</th>
                <th className="p-2 text-left border-b">Description</th>
                <th className="p-2 text-left border-b">Value</th>
              </tr>
            </thead>
            <tbody>
              {configItems.map((item) => (
                <tr key={item.key}>
                  <td className="p-2 font-semibold border-b">{item.key}</td>
                  <td className="p-2 border-b">{item.description}</td>
                  <td className="p-2 border-b">
                    {item.type === "dropdown" && item.options ? (
                      <select
                        name={item.key}
                        value={configuration[item.key] ?? ""}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md text-xl"
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
                        className="w-full p-2 border rounded-md text-xl"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end gap-4 mt-6">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-green-400 text-white rounded-md"
            >
              {isSaving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
