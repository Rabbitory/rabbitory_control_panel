"use client";
import * as React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import styles from "./VersionsPage.module.css";
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
        <>
          <h2>Versions</h2>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td className={styles.td}>
                  Current RabbitMQ version
                  <br />
                  Current Erlang version
                </td>
                <td className={styles.td}>
                  {versions?.rabbitmq}
                  <br />
                  {versions?.erlang}
                </td>
                <td className={styles.td}>
                  <button>Update</button>
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
