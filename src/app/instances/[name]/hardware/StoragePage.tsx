"use client";

import { useEffect, useState } from "react";

import { useNotificationsContext } from "@/app/NotificationContext";
import { useInstanceContext } from "../InstanceContext";

import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React from "react";
import { StorageDetails } from "@/app/components/StorageDetails";

export function StoragePage() {
  const [currentVolumeSize, setCurrentVolumeSize] = useState(0);
  const [newVolumeSize, setNewVolumeSize] = useState(0);
  const { instance } = useInstanceContext();
  const { addNotification, formPending } = useNotificationsContext();
  const router = useRouter();

  useEffect(() => {
    async function fetchVolumeSize() {
      if (!instance?.EBSVolumeId || !instance?.region) {
        console.error("Missing EBSVolumeId or region");
        return;
      }

      try {
        const response = await axios.get(
          `/api/instances/${instance?.name}/hardware/storage?volumeId=${instance?.EBSVolumeId}&region=${instance?.region}`
        );

        if (response.data) {
          setCurrentVolumeSize(response.data.size);
          setNewVolumeSize(response.data.size);
        }
      } catch (error) {
        console.error("Failed to fetch volume size:", error);
      }
    }

    fetchVolumeSize();
  }, [instance?.EBSVolumeId, instance?.region, instance?.id, instance?.name]);

  const isValidStorageSize = (size: number) =>
    size >= 1 && size <= 16000 && size > currentVolumeSize;

  const updateStorageSize = async () => {
    if (!isValidStorageSize(newVolumeSize) || !instance || !instance.name) {
      alert(
        "Invalid storage size. Must be greater than current size & less than or equal to 16000 GB"
      );
      return false;
    }

    await addNotification({
      type: "storage",
      status: "pending",
      instanceName: instance.name,
      path: "instances",
      message: `Updating storage size for ${instance.name}`,
    });

    try {
      await axios.put(`/api/instances/${instance.name}/hardware/storage`, {
        instanceId: instance.id,
        volumeId: instance.EBSVolumeId,
        region: instance.region,
        size: newVolumeSize,
        instanceName: instance.name,
      });
      return true;
    } catch (error) {
      console.error("Failed to update storage size:", error);
      alert(
        "Failed to update storage size. You might have to wait 6 hours since the last update."
      );
      return false;
    }
  };

  if (!currentVolumeSize) return <div>Loading...</div>;

  return (
    <>
      <h1 className="font-heading1 text-headertext1 text-2xl mb-10">
        Edit storage
      </h1>
      <p className="font-text1 text-sm text-pagetext1 mb-6">
        The amount of storage the broker has access to. 8gb minimum. System
        files take about 4gb.
      </p>
      <StorageDetails />
      <p className="font-text1 text-md mb-6">
        Current instance storage size:{` ${currentVolumeSize} GB`}
      </p>
      <fieldset disabled={formPending()} className="space-y-4">
        <div className="flex items-center gap-4">
          <label
            htmlFor="storageSize"
            className="font-text1 text-md text-headertext1 w-1/4"
          >
            Storage Size (GB):
          </label>
          <input
            id="storageSize"
            name="storageSize"
            type="number"
            value={newVolumeSize}
            onChange={(e) => setNewVolumeSize(Number(e.target.value))}
            className="font-text1 w-1/10 p-1 border rounded-md text-sm"
            min={currentVolumeSize + 1}
            max={16000}
          />
        </div>
        <div className="font-heading1 text-sm flex justify-end gap-4">
          <Link
            href={`/instances/${instance?.name}/hardware?region=${instance?.region}`}
            className="px-4 py-2 bg-card border-1 border-btn1 text-btn1 rounded-sm text-center hover:shadow-[0_0_8px_#87d9da] transition-all duration-200 hover:bg-card"
          >
            Cancel
          </Link>
          <button
            className={`font-heading1 px-4 py-2 text-mainbg1 font-semibold rounded-sm
                  ${
                    formPending()
                      ? "bg-btnhover1 opacity-70 cursor-not-allowed"
                      : "px-4 py-2 bg-btn1 hover:bg-btnhover1 text-mainbg1 font-semibold rounded-sm flex items-center justify-center hover:shadow-[0_0_10px_#87d9da] transition-all duration-200"
                  }
                `}
            disabled={formPending() || !isValidStorageSize(newVolumeSize)}
            onClick={async (e) => {
              e.preventDefault();
              const success = await updateStorageSize();
              if (success) {
                router.push(
                  `/instances/${instance?.name}/hardware?region=${instance?.region}`
                );
              }
            }}
          >
            {formPending() ? "Saving..." : "Save"}
          </button>
        </div>
      </fieldset>
    </>
  );
}
