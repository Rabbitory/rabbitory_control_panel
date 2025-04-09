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
          `/api/instances/${instance?.name}/configuration?region=${instance?.region}`,
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
  }, [instance?.name, instance?.region]);

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
        `/api/instances/${instance?.name}/configuration?region=${instance?.region}`,
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
    <div className="max-w-4xl mx-auto p-6 bg-card text-pagetext1 rounded-sm shadow-md mt-6">
      <h1 className="font-heading1 text-headertext1 text-2xl mb-10">
        Configuration
      </h1>
      {isFetching ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <table className="w-full border-collapse">
            <thead className="font-heading1 text-headertext1 text-sm">
              <tr>
                <th className="p-2 text-left border-b">Setting</th>
                <th className="p-2 text-left border-b">Description</th>
                <th className="p-2 text-left border-b">Value</th>
              </tr>
            </thead>
            <tbody className="font-text1 text-sm">
              {configItems.map((item) => (
                <tr key={item.key} className="p-2">
                  <td className="p-2 border-b">{item.key}</td>
                  <td className="p-2 border-b">{item.description}</td>
                  <td className="p-2 border-b w-1/6 text-center">
                    {item.type === "dropdown" && item.options ? (
                      <select
                        name={item.key}
                        value={configuration[item.key] ?? ""}
                        onChange={handleChange}
                        className="w-full p-1 border rounded-md text-sm"
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
          <div className="font-heading1 flex justify-end gap-4 mt-6">
            <Link
              href="/"
              className="px-4 py-2 bg-mainbg1 text-headertext1 rounded-sm text-center hover:bg-mainbghover"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-4 py-2 text-mainbg1 font-semibold rounded-sm
                ${isSaving ? "bg-btnhover1 opacity-70 cursor-not-allowed" : "px-4 py-2 bg-btn1 hover:bg-btnhover1 text-mainbg1 font-semibold rounded-sm flex items-center justify-center hover:shadow-[0_0_10px_#87d9da] transition-all duration-200"}
              `}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
