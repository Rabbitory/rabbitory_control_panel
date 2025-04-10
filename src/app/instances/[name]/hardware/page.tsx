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
    <div>
      <div className="max-w-4xl mx-auto p-6 bg-card rounded-lg shadow-md mt-8 text-pagetext1">
        <h1 className="font-heading1 text-2xl mb-10">Hardware</h1>
        <div className="mb-10 text-pagetext1 text-md">
          <h2 className="font-text1 pb-2">Current instance hardware:</h2>
          <p className="font-text1 pb-4">{instance?.type}</p>
          <Link className="font-heading1 px-4 py-2 text-sm bg-btn1 hover:bg-btnhover1 text-mainbg1 font-semibold rounded-sm flex items-center justify-center hover:shadow-[0_0_10px_#87d9da] transition-all duration-200"
            href={`/instances/${instance?.name}/hardware/type/edit?region=${instance?.region}`}
          >
            Update instance type
          </Link>
        </div>

        <h2 className="font-text1 pb-2">Current instance storage size: </h2>
        <p className="font-text1 pb-4">{volumeSize} GB</p>
        <Link className="font-heading1 px-4 py-2 text-sm bg-btn1 hover:bg-btnhover1 text-mainbg1 font-semibold rounded-sm flex items-center justify-center hover:shadow-[0_0_10px_#87d9da] transition-all duration-200"
          href={`/instances/${instance?.name}/hardware/storage/edit?region=${instance?.region}`}
        >
          Update storage size
        </Link>
      </div>
    </div>
  );
}
