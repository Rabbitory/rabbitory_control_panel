"use client";

import { StoragePage } from "./StoragePage";
import { InstanceTypePage } from "./InstanceTypePage";

export default function HardwarePage() {
  return (
    <div>
      <div className="max-w-4xl mx-auto p-6 bg-card rounded-lg shadow-md mt-8 text-pagetext1">
        <h1 className="font-heading1 text-2xl mb-10">Hardware</h1>
        <p className="text-pagetext1 text-sm mb-6">
          Changing anything here will restart the instance.
        </p>
        <InstanceTypePage />
        <StoragePage />
      </div>
    </div>
  );
}
