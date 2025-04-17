"use client";

import React from "react";
import { useInstanceContext } from "./InstanceContext";
import InstanceInfo from "./components/InstanceInfo";
import ServerInfo from "./components/ServerInfo";

export default function InstancePage() {
  const { instance } = useInstanceContext();

  if (!instance) {
    throw new Error("Instance not found");
  }

  return (
    <div className="text-pagetext1 flex-1 max-w-7xl mx-auto p-6 bg-card rounded-sm shadow-md">
      <h1 className="font-heading1 text-headertext1 text-2xl mb-10">
        {instance?.name}
      </h1>

      <InstanceInfo instance={instance} />
      <ServerInfo instance={instance} />
    </div>
  );
}
