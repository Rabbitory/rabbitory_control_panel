"use client";

import * as React from "react";
import formatDate from "@/utils/formatDate";
import { useInstanceContext } from "./InstanceContext";

export default function InstancePage() {
  const { instance } = useInstanceContext();

  return (
    <div className="text-pagetext1 flex-1 max-w-7xl mx-auto p-6 bg-card shadow-md m-6">
      <h1 className="font-heading1 text-headertext1 text-2xl mb-10">{instance?.name}</h1>
  
      <h2 className="font-heading1 text-headertext1 text-md pb-4">Instance Info</h2>
      <table className="w-full table-auto mb-6">
        <colgroup>
          <col className="w-1/5" />
          <col />
        </colgroup>
        <tbody className="font-text1">
          <tr>
            <td className="py-2">Status:</td>
            <td>{instance?.state}</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-2">Host:</td>
            <td>{instance?.publicDns}</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-2">Launch Time:</td>
            <td>{instance?.launchTime && formatDate(instance?.launchTime)}</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-2">Region:</td>
            <td>{instance?.region}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="font-heading1 text-headertext1 text-md pb-4">RabbitMQ Server Info:</h2>
      <table className="w-full table-auto mb-6">
        <colgroup>
          <col className="w-1/5" />
          <col />
        </colgroup>
        <tbody className="font-text1">
          <tr>
            <td className="py-2">Port:</td>
            <td>{instance?.port}</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-2">User:</td>
            <td>{instance?.user}</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-2">Password:</td>
            <td>{instance?.password}</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-2">RabbitMQ URL:</td>
            <td>
              {instance?.endpointUrl}{" "}
              <a
                onClick={async (e) => {
                  e.preventDefault();
                  if (instance?.endpointUrl === undefined) return;
                  await navigator.clipboard.writeText(instance?.endpointUrl);
                }}
                className="text-blue-600 underline cursor-pointer"
              >
                Copy URL
              </a>
            </td>
          </tr>
        </tbody>
      </table>

    </div>
  );
  
}
