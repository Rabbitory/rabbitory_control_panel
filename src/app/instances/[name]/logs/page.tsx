"use client";

import { useEffect, useState, useRef } from "react";
import { useInstanceContext } from "../InstanceContext";
import axios from "axios";
import LogsDescription from "./components/LogsDescription";
import LoadingSkeleton from "./components/LoadingSkeleton";
import CopyableLogSection from "./components/CopyableLogSection";

export default function LogsPage() {
  const { instance } = useInstanceContext();
  const [logs, setLogs] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `/api/instances/${instance?.name}/logs?region=${instance?.region}`,
        );
        setLogs(response.data.logs);
      } catch (error) {
        console.error("Error fetching logs:", error);
        setError("Failed to fetch logs. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();

    // auto-refresh every 30 seconds
    const interval = setInterval(fetchLogs, 30000);

    return () => clearInterval(interval);
  }, [instance?.name, instance?.region]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [logs]);

  const handleCopy = () => {
    navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-full mx-auto p-6 bg-card rounded-sm shadow-md mt-8 text-pagetext1">
      <LogsDescription />

      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <CopyableLogSection
          logs={logs}
          copied={copied}
          onCopy={handleCopy}
          scrollContainerRef={scrollContainerRef}
        />
      )}
    </div>
  );
}
