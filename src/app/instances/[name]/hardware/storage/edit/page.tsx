"use client";

import { useEffect, useState } from "react";
import { useInstanceContext } from "../../../InstanceContext";
import { useNotificationsContext } from "@/app/NotificationContext";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function StorageEditPage() {
  const [currentVolumeSize, setCurrentVolumeSize] = useState(0);
  const [newVolumeSize, setNewVolumeSize] = useState(0);
  const { instance } = useInstanceContext();
  const { addNotification, formPending } = useNotificationsContext();
  const router = useRouter();

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
        setCurrentVolumeSize(response.data.size);
        setNewVolumeSize(response.data.size);
      }
    }

    fetchVolumeSize();
  }, [instance?.EBSVolumeId, instance?.region, instance?.id, instance?.name]);

  const isValidStorageSize = (size: number) =>
    size >= 1 && size <= 16000 && size > currentVolumeSize;

  const updateStorageSize = async () => {
    if (!isValidStorageSize(newVolumeSize) || !instance || !instance.name) {
      alert(
        "Invalid storage size. Must be greater than current size & less than or equal to 16000 GB",
      );
      return;
    }

    addNotification({
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
      });
      return true;
    } catch (error) {
      console.error(error);
      alert(
        "Failed to update storage size. You might have to wait 6 hours since the last update.",
      );
      return false;
    }
  };

  if (!currentVolumeSize) return <div>Loading...</div>;

  return (
    <>
      <div>
        <h1>Hardware</h1>
        <p>Current instance storage size:{` ${currentVolumeSize} GB`}</p>
        <fieldset disabled={formPending()} className="space-y-4">
          <div className="flex items-center gap-4">
            <label
              htmlFor="storageSize"
              className="text-xl text-gray-700 w-1/4"
            >
              Storage Size (GB):
            </label>
            <input
              id="storageSize"
              name="storageSize"
              type="number"
              value={newVolumeSize}
              onChange={(e) => setNewVolumeSize(Number(e.target.value))}
              className="w-3/4 p-2 border rounded-md text-xl"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              disabled={formPending()}
              onClick={async (e) => {
                e.preventDefault();
                const success = await updateStorageSize();
                if (success) router.push(`/instances`);
              }}
              className="w-1/4 py-2 bg-green-400 text-white rounded-full hover:bg-green-300 focus:ring-2 focus:ring-green-500 text-xl"
            >
              {formPending() ? "Expanding storage size..." : "Expand"}
            </button>
          </div>
        </fieldset>
      </div>
    </>
  );
}
