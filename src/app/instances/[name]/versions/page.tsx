"use client";
import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useInstanceContext } from "../InstanceContext";
import VersionsDescription from "./components/VersionsDescription";
import LoadingSkeleton from "./components/LoadingSkeleton";

interface Version {
  rabbitmq: string;
  erlang: string;
}

export default function VersionsPage() {
  const { instance } = useInstanceContext();
  const [versions, setVersions] = useState<Version | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVersions = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `/api/instances/${instance?.name}/versions?region=${instance?.region}`,
          {
            headers: {
              "x-rabbitmq-username": instance?.user,
              "x-rabbitmq-password": instance?.password,
            },
          }
        );

        setVersions({
          rabbitmq: response.data.rabbitmq_version,
          erlang: response.data.erlang_version,
        });
      } catch (error) {
        console.error("Error fetching versions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersions();
  }, [instance?.name, instance?.user, instance?.password, instance?.region]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card text-pagetext1 rounded-sm shadow-md mt-8">
      <VersionsDescription />
      <div className="max-w-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-headertext1 font-heading1 text-sm bg-background">
              <th className="py-2 text-left">Software</th>
              <th className="py-2 text-left">Version</th>
            </tr>
          </thead>
          <tbody
            className={`text-pagetext1 px-4 py-2 ${isLoading ? "" : "animate-fade-in"
              }`}
          >
            {isLoading ? (
              <LoadingSkeleton />
            ) : versions ? (
              <>
                <tr className="font-text1 border-t border-gray-300">
                  <td className="py-2 pr-2 font-semibold whitespace-nowrap">
                    RabbitMQ
                  </td>
                  <td className="py-2 pl-1">{versions.rabbitmq}</td>
                </tr>
                <tr className="font-text1 border-t border-gray-300">
                  <td className="py-2 pr-2 font-semibold whitespace-nowrap">
                    Erlang
                  </td>
                  <td className="py-2 pl-1">{versions.erlang}</td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan={2} className="px-4 py-3 text-center">
                  <p className="text-pagetext1">No versions available</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
