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
          `/api/instances/${instance?.name}/logs`
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
  }, [instance?.name]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">
        RabbitMQ Logs
      </h1>

      {isFetching && <p className="text-gray-600">Fetching logs...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {logs && (
        <div className="relative">
          <button
            onClick={() => navigator.clipboard.writeText(logs)}
            className="absolute top-2 right-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Copy
          </button>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono text-sm">
            {logs}
          </pre>
        </div>
      )}
    </div>
  );
}
