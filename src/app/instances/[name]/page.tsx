"use client";

import React from "react";
import formatDate from "@/utils/formatDate";
import { useInstanceContext } from "./InstanceContext";
import { Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function InstancePage() {
  const { instance } = useInstanceContext();
  const [showCopied, setShowCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showUrlPassword, setShowUrlPassword] = useState(false);

  const handleCopy = async () => {
    if (!instance?.endpointUrl) return;
    await navigator.clipboard.writeText(instance.endpointUrl);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const secureWindow = () => {
    return (
      window !== undefined &&
      (new RegExp(/^https/).test(window.location.href) ||
        new RegExp(/^http:\/\/localhost/).test(window.location.href))
    );
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleUrlPassword = () => {
    setShowUrlPassword((prev) => !prev);
  };

  const getDisplayedEndpointUrl = (): string => {
    if (!instance || !instance.endpointUrl) return "";

    try {
      const full = instance.endpointUrl;

      const protocolSplit = full.split("://");
      if (protocolSplit.length !== 2) return full;

      const protocol = protocolSplit[0] + "://";
      const rest = protocolSplit[1];

      const atIndex = rest.lastIndexOf("@");
      if (atIndex === -1) return full;

      const credentials = rest.slice(0, atIndex);
      const hostAndPath = rest.slice(atIndex + 1);

      const [username, rawPassword] = credentials.split(":");

      if (!username || !rawPassword) return full;

      const displayedPassword = showUrlPassword
        ? decodeURIComponent(rawPassword)
        : "•".repeat(decodeURIComponent(rawPassword).length || 8);

      return `${protocol}${username}:${displayedPassword}@${hostAndPath}`;
    } catch (error) {
      console.error("Error parsing endpoint URL:", error);
      return instance.endpointUrl;
    }
  };

  return (
    <div className="text-pagetext1 flex-1 max-w-7xl mx-auto p-6 bg-card rounded-sm shadow-md">
      <h1 className="font-heading1 text-headertext1 text-2xl mb-10">
        {instance?.name}
      </h1>

      <h2 className="font-heading1 text-headertext1 text-md pb-4">
        Instance Info
      </h2>
      <table className="text-sm w-full table-auto mb-6">
        <colgroup>
          <col className="w-1/5" />
          <col />
        </colgroup>
        <tbody className="font-text1">
          <tr>
            <td className="py-2">Status:</td>
            <td
              className={
                instance?.state === "running"
                  ? "text-btnhover1"
                  : instance?.state === "stopped" ||
                    instance?.state === "stopping"
                  ? "text-red-300"
                  : instance?.state === "shutting-down"
                  ? "text-pagetext1 italic"
                  : ""
              }
            >
              {instance?.state}
            </td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-2">Host:</td>
            <td className="py-2">{instance?.publicDns}</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-2">Created at:</td>
            <td className="py-2">
              {instance?.launchTime && formatDate(instance?.launchTime)}
            </td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-2">Data Center:</td>
            <td className="py-2">{instance?.region}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="font-heading1 text-headertext1 text-md pb-4">
        RabbitMQ Server Info:
      </h2>
      <table className="text-sm w-full table-auto mb-6">
        <colgroup>
          <col className="w-1/5" />
          <col />
        </colgroup>
        <tbody className="font-text1">
          <tr>
            <td className="py-2">Port:</td>
            <td className="py-2">{instance?.port}</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-2">User:</td>
            <td className="py-2">{instance?.user}</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-2">Password:</td>
            <td className="py-2 flex items-center gap-2">
              <span className="font-mono">
                {showPassword
                  ? instance?.password
                  : "•".repeat(instance?.password?.length || 8)}
              </span>
              <button
                onClick={togglePassword}
                className="text-btn1 hover:text-checkmark p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-2">RabbitMQ Connection URL:</td>
            <td className="py-2 relative">
              <div className="flex items-center gap-2">
                <span>{getDisplayedEndpointUrl()}</span>
                <button
                  onClick={toggleUrlPassword}
                  className="text-btn1 hover:text-checkmark p-1"
                  aria-label={
                    showUrlPassword ? "Hide URL password" : "Show URL password"
                  }
                >
                  {showUrlPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <div className="relative">
                  {secureWindow() && (
                    <button
                      onClick={handleCopy}
                      className="text-btn1 hover:text-checkmark p-1"
                    >
                      <Copy size={16} />
                    </button>
                  )}
                  {showCopied && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 bg-black text-white text-xs px-2 py-1 rounded shadow z-10 whitespace-nowrap">
                      RabbitMQ URL copied to clipboard
                    </div>
                  )}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
