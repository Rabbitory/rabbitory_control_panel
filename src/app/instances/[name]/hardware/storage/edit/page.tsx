"use client";

import { useEffect, useState } from "react";
import { useInstanceContext } from "../../../InstanceContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StorageEditPage() {
  const [currentVolumeSize, setCurrentVolumeSize] = useState(0);
  const [newVolumeSize, setNewVolumeSize] = useState(0);
  const [saving, setSaving] = useState(false);
  const { instance } = useInstanceContext();
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
    if (!isValidStorageSize(newVolumeSize)) {
      alert(
        "Invalid storage size. Must be greater than current size & less than or equal to 16000 GB",
      );
      return;
    }

    setSaving(true);

    try {
      await axios.put(`/api/instances/${instance?.name}/hardware/storage`, {
        instanceId: instance?.id,
        volumeId: instance?.EBSVolumeId,
        region: instance?.region,
        size: newVolumeSize,
      });
      return true;
    } catch (error) {
      setSaving(false);
      console.error(error);
      alert(
        "Failed to update storage size. You might have to wait 6 hours since the last update.",
      );
      return false;
    }
  };

  if (!currentVolumeSize) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card rounded-sm shadow-md mt-6 text-pagetext1">
      <h1 className="font-heading1 text-headertext1 text-2xl mb-10">Edit Storage</h1>
      <p className="font-text1 text-md mb-6">Current instance storage size:{` ${currentVolumeSize} GB`}</p>
      <fieldset disabled={saving} className="space-y-4">
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
          />
        </div>
        <div className="flex justify-end gap-4">
          <Link
              href={`/instances/${instance?.name}/hardware?region=${instance?.region}`}
              className="px-4 py-2 bg-mainbg1 text-headertext1 rounded-sm text-center hover:bg-mainbghover"
            >
              Cancel
            </Link>
          <button
                className={`font-heading1 px-4 py-2 text-mainbg1 font-semibold rounded-sm
                  ${saving ? "bg-btnhover1 opacity-70 cursor-not-allowed" : "px-4 py-2 bg-btn1 hover:bg-btnhover1 text-mainbg1 font-semibold rounded-sm flex items-center justify-center hover:shadow-[0_0_10px_#87d9da] transition-all duration-200"}
                `}
                disabled={saving}
                onClick={async (e) => {
                  e.preventDefault();
                  const success = await updateStorageSize();
                  if (success)
                    router.push(
                      `/instances/${instance?.name}/hardware?region=${instance?.region}`,
                    );
                }}
              >
                {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </fieldset>
    </div>
  );
}
