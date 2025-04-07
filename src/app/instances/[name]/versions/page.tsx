"use client";
import * as React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
// import styles from "./VersionsPage.module.css";
import { useInstanceContext } from "../InstanceContext";

interface Version {
  rabbitmq: string;
  erlang: string;
}

export default function VersionsPage() {
  const { instance } = useInstanceContext();
  const [versions, setVersions] = useState<Version | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const fetchVersions = async () => {
      setIsFetching(true);
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
        setIsFetching(false);
      }
    };

    fetchVersions();
  }, [instance?.name, instance?.user, instance?.password, instance?.region]);
  
  return (
    <>
      {isFetching ? (
        <div>Loading...</div>
      ) : (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-sm shadow-md mt-6 text-pagetext1">
          <h1 className="font-heading1 text-2xl mb-10">Versions</h1>
          <div className="max-w-md">
            <table className="w-full border-collapse">
              <tbody className="font-text1 text-md">
                <tr>
                  <td className="py-2 pr-2 font-semibold whitespace-nowrap">
                    Current RabbitMQ version
                  </td>
                  <td className="py-2 pl-1">{versions?.rabbitmq}</td>
                </tr>
                <tr className="border-t border-gray-300">
                  <td className="py-2 pr-2 font-semibold whitespace-nowrap">
                    Current Erlang version
                  </td>
                  <td className="py-2 pl-1">{versions?.erlang}</td>
                </tr>
              </tbody>
            </table>
          </div>


        </div>
      )}
    </>
  );
}
