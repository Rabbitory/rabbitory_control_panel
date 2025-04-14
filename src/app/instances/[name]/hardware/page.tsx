"use client";

import { StoragePage } from "./StoragePage";
import { InstanceTypePage } from "./InstanceTypePage";

export default function HardwarePage() {
  return (
    <>
      <InstanceTypePage />
      <StoragePage />
    </>
  );
}
