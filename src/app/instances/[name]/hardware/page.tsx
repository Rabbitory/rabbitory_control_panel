"use client";

import { StoragePage } from "./components/StoragePage";
import { InstanceTypePage } from "./components/InstanceTypePage";

export default function HardwarePage() {
  return (
    <>
      <InstanceTypePage />
      <StoragePage />
    </>
  );
}
