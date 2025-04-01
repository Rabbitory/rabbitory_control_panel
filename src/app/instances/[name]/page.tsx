"use client";

import * as React from "react";
import formatDate from "@/utils/formatDate";
import Link from "next/link";
import { useInstanceContext } from "./InstanceContext";

export default function InstancePage() {
  const { instance } = useInstanceContext();

  return (
    <>
      <h2>{instance?.name}</h2>
      <ul>
        <li>
          <strong>Status:</strong> {instance?.state}
        </li>
        <li>
          <strong>Host:</strong> {instance?.publicDns}
        </li>
        <li>
          <strong>Launch Time:</strong>{" "}
          {instance?.launchTime && formatDate(instance?.launchTime)}
        </li>
        <li>
          <strong>Region:</strong> {instance?.region}
        </li>
        <li>
          <strong>Port:</strong> {instance?.port}
        </li>
        <li>
          <strong>User:</strong> {instance?.user}
        </li>
        <li>
          <strong>Password:</strong> {instance?.password}
        </li>
        <li>
          <strong>Endpoint URL:</strong> {instance?.endpointUrl}{" "}
          <a
            onClick={async (e) => {
              e.preventDefault();
              if (instance?.endpointUrl === undefined) return;
              await navigator.clipboard.writeText(instance?.endpointUrl);
            }}
          >
            Copy URL
          </a>
        </li>
        <Link href="/">
          <button>Go Back</button>
        </Link>
      </ul>
    </>
  );
}
