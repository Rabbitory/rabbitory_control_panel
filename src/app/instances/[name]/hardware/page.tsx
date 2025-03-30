"use client";

import { useEffect, useState } from "react";
import { useInstanceContext } from "../InstanceContext";
import Link from "next/link";
import axios from "axios";

export default function HardwarePage() {
  const { instance } = useInstanceContext();
  const [volumeSize, setVolumeSize] = useState<number | "Loading...">(
    "Loading...",
  );

  useEffect(() => {
    async function fetchVolumeSize() {
      if (!instance?.EBSVolumeId || !instance?.region) {
        alert("Missing EBSVolumeId or region");
        return;
      }

      const response = await axios.get(
        `/api/instances/${instance?.name}/hardware/storage?volumeId=${instance?.EBSVolumeId}&region=${instance?.region}`,
      );

      if (response.data) {
        setVolumeSize(response.data.size);
      }
    }

    fetchVolumeSize();
  }, [instance]);

  return (
    <>
      <div>
        <h1>Hardware</h1>
        <p>Current instance hardware: {instance?.type}</p>
        <Link href={`/instances/${instance?.name}/hardware/type/edit`}>
          Change instance type
        </Link>
        <p>Current instance storage size: {volumeSize}</p>
        <Link href={`/instances/${instance?.name}/hardware/storage/edit`}>
          Change storage size
        </Link>
      </div>
    </>
  );
}
