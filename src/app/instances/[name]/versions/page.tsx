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
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
          <h1 className="font-heading1 text-3xl mb-10 text-center">Versions</h1>
          <table className="w-full border-collapse">
            <tbody className="font-text1 text-xl">
              <tr>
                <td className="border p-2">
                  Current RabbitMQ version
                  <br />
                  Current Erlang version
                </td>
                <td className="border p-2">
                  {versions?.rabbitmq}
                  <br />
                  {versions?.erlang}
                </td>
                {/* <td className="border p-2">
                  <button>Update</button>
                </td> */}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
