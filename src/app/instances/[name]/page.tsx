"use client";

import * as React from "react";
import formatDate from "@/utils/formatDate";
import { useInstanceContext } from "./InstanceContext";

export default function InstancePage() {
  const { instance } = useInstanceContext();

  // return (
  //   <div className="flex-1 max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
  //     <h1 className="font-heading1 text-2xl pb-6">{instance?.name}</h1>
  //     <h2 className="font-heading1 font-semibold text-xl">Instance Info:</h2>
  //     <ul className="font-text1 pb-6">
  //       <li>
  //         <strong>Status:</strong> {instance?.state}
  //       </li>
  //       <li>
  //         <strong>Host:</strong> {instance?.publicDns}
  //       </li>
  //       <li>
  //         <strong>Launch Time:</strong>{" "}
  //         {instance?.launchTime && formatDate(instance?.launchTime)}
  //       </li>
  //       <li>
  //         <strong>Region:</strong> {instance?.region}
  //       </li>
  //     </ul>
  //     <h2 className="font-heading1 font-semibold text-xl">RabbitMQ Server Info:</h2>
  //     <ul className="font-text1 pb-6">
  //       <li>
  //         <strong>Port:</strong> {instance?.port}
  //       </li>
  //       <li>
  //         <strong>User:</strong> {instance?.user}
  //       </li>
  //       <li>
  //         <strong>Password:</strong> {instance?.password}
  //       </li>
  //       <li>
  //         <strong>Endpoint URL:</strong> {instance?.endpointUrl}{" "}
  //         <a
  //           onClick={async (e) => {
  //             e.preventDefault();
  //             if (instance?.endpointUrl === undefined) return;
  //             await navigator.clipboard.writeText(instance?.endpointUrl);
  //           }}
  //         >
  //           Copy URL
  //         </a>
  //       </li>
  //       <Link href="/">
  //         <button>Go Back</button>
  //       </Link>
  //     </ul>
  //   </div>
  // );

  return (
    <div className="flex-1 max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md m-6">
      <h1 className="font-heading1 text-3xl pb-6 text-center">{instance?.name}</h1>
  
      <h2 className="font-heading1 font-semibold text-xl pb-4">Instance Info:</h2>
      <table className="w-full table-auto mb-6">
        <tbody>
          <tr>
            <td className="font-semibold">Status:</td>
            <td>{instance?.state}</td>
          </tr>
          <tr>
            <td className="font-semibold">Host:</td>
            <td>{instance?.publicDns}</td>
          </tr>
          <tr>
            <td className="font-semibold">Launch Time:</td>
            <td>{instance?.launchTime && formatDate(instance?.launchTime)}</td>
          </tr>
          <tr>
            <td className="font-semibold">Region:</td>
            <td>{instance?.region}</td>
          </tr>
        </tbody>
      </table>
  
      <h2 className="font-heading1 font-semibold text-xl pb-4">RabbitMQ Server Info:</h2>
      <table className="w-full table-auto mb-6">
        <tbody>
          <tr>
            <td className="font-semibold">Port:</td>
            <td>{instance?.port}</td>
          </tr>
          <tr>
            <td className="font-semibold">User:</td>
            <td>{instance?.user}</td>
          </tr>
          <tr>
            <td className="font-semibold">Password:</td>
            <td>{instance?.password}</td>
          </tr>
          <tr>
            <td className="font-semibold">Endpoint URL:</td>
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
