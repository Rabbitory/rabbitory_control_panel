"use client";

import { useEffect, useState } from "react";
import { useInstanceContext } from "../InstanceContext";
import axios from "axios";

export default function LogsPage() {
  const { instance } = useInstanceContext();
  const [logs, setLogs] = useState<string>("");
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const response = await axios.get(
          `/api/instances/${instance?.name}/logs?region=${instance?.region}`
        );
        setLogs(response.data.logs);
      } catch (error) {
        console.error("Error fetching logs:", error);
        setError("Failed to fetch logs. Please try again later.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchLogs();

    // auto-refresh every 30 seconds
    const interval = setInterval(fetchLogs, 30000);

    return () => clearInterval(interval);
  }, [instance?.name, instance?.region]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card rounded-sm shadow-md mt-6 text-pagetext1">
      <h1 className="font-heading1 text-headertext1 text-2xl mb-10">
        RabbitMQ Logs
      </h1>

      {isFetching && <p className="font-text1">Fetching logs...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {logs && (
        <div className="relative">
          <button
            onClick={() => navigator.clipboard.writeText(logs)}
            className="font-heading1 absolute top-2 right-2 px-3 py-1 text-xs bg-card border-1 border-btn1 text-btn1 rounded-sm text-center hover:shadow-[0_0_8px_#87d9da] transition-all duration-200 hover:bg-card"
          >
            Copy
          </button>
          <pre className="bg-mainbg1 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-text1 text-sm">
            {logs}
          </pre>
        </div>
      )}
    </div>
  );
}
