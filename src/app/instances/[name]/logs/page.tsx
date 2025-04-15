"use client";

import { useEffect, useState, useRef } from "react";
import { useInstanceContext } from "../InstanceContext";
import axios from "axios";
import { Copy } from "lucide-react";

export default function LogsPage() {
  const { instance } = useInstanceContext();
  const [logs, setLogs] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

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

  const secureWindow = () => {
    return (
      window !== undefined &&
      (new RegExp(/^https/).test(window.location.href) ||
        new RegExp(/^http:\/\/localhost/).test(window.location.href))
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-full mx-auto p-6 bg-card rounded-sm shadow-md mt-8 text-pagetext1">
      <h1 className="font-heading1 text-headertext1 text-2xl mb-10">
        RabbitMQ Logs
      </h1>
      <p className="font-text1 text-sm text-pagetext1 mb-6">
        The following logs are fetched from the RabbitMQ server on your running
        instance. They are displayed here for convenient debugging. You can also
        copy your logs as needed.
      </p>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 20 }).map((_, index) => (
            <div key={index} className="bg-gray-600 h-4 rounded w-7/8"></div>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="relative">
          {secureWindow() && (
            <button
              onClick={handleCopy}
              className="font-heading1 absolute top-2 right-2 p-2 text-xs bg-mainbg1 text-btn1 rounded-sm text-center hover:text-checkmark transition-all duration-200"
            >
              <Copy size={18} />
            </button>
          )}

          {copied && (
            <div className="absolute top-8 right-2 text-xs bg-gray-800 text-white p-1 rounded-md">
              Copied logs to clipboard
            </div>
          )}

          <div
            ref={scrollContainerRef}
            className="overflow-auto max-h-[400px] scrollbar-thin scrollbar-thumb-btn1 scrollbar-track-gray-100"
          >
            <pre className="bg-mainbg1 p-4 rounded-lg whitespace-pre-wrap font-text1 text-gray-300 text-sm">
              {logs}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
