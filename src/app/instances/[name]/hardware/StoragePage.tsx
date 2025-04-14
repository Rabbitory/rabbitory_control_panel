"use client";

import { useEffect, useState } from "react";

import { useNotificationsContext } from "@/app/NotificationContext";
import { useInstanceContext } from "../InstanceContext";

import axios from "axios";
import { useRouter } from "next/navigation";
import React from "react";
import { StorageDetails } from "@/app/components/StorageDetails";
import ErrorBanner from "@/app/components/ErrorBanner";
import SubmissionSpinner from "@/app/components/SubmissionSpinner";

export function StoragePage() {
  const router = useRouter();
  const { instance } = useInstanceContext();
  const [currentVolumeSize, setCurrentVolumeSize] = useState(0);
  const [newVolumeSize, setNewVolumeSize] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const { addNotification, formPending } = useNotificationsContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch volume size:", error);
      }
    }

    fetchVolumeSize();
  }, [instance?.EBSVolumeId, instance?.region, instance?.id, instance?.name]);

  const validateStorageSize = (): boolean => {
    const errorMessages: string[] = [];

    if (!newVolumeSize || newVolumeSize <= currentVolumeSize) {
      errorMessages.push(
        `Storage size must be greater than current size (${currentVolumeSize} GB).`
      );
    }
    if (newVolumeSize > 16000) {
      errorMessages.push("Storage size cannot exceed 16000 GB.");
    }

    setErrors(errorMessages);
    return errorMessages.length === 0;
  };

  const updateStorageSize = async () => {
    if (!validateStorageSize()) {
      return false;
    }

    if (!instance || !instance.name) {
      throw new Error("No instance found");
    };

    await addNotification({
      type: "storage",
      status: "pending",
      instanceName: instance?.name,
      path: "instances",
      message: `Updating storage size for ${instance?.name}`,
    });

    try {
      await axios.put(`/api/instances/${instance?.name}/hardware/storage`, {
        instanceId: instance?.id,
        volumeId: instance?.EBSVolumeId,
        region: instance?.region,
        size: newVolumeSize,
        instanceName: instance?.name,
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card rounded-lg shadow-md mt-8 text-pagetext1">
      <h1 className="font-heading1 text-headertext1 text-2xl mb-10">
        Instance Storage
      </h1>

      {isLoading ? (
        <div className="animate-pulse">
          <div className="space-y-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-1/3 h-6 bg-gray-600 rounded-sm"></div>
            </div>
          </div>
        </div>
        ) :
        <div className="flex items-center gap-2 mb-6">
          <p className="font-text1 text-md">
          Current instance storage size:
          </p>
          <p className="font-text1 text-btnhover1 text-sm">
          {` ${currentVolumeSize} GB`}
          </p>
        </div>
      }
      <p className="font-text1 text-sm text-pagetext1 mb-6">
        The amount of storage the broker has access to. 8gb minimum. System
        files take about 4gb.
      </p>
      <StorageDetails />

      {errors.length > 0 && (
              <div className="mb-4">
                {errors.map((error, index) => (
                  <ErrorBanner key={index} message={error} onClose={() => setErrors([])} />
                ))}
              </div>
            )}


      <fieldset disabled={formPending()} className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="space-y-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-1/3 h-6 bg-gray-600 rounded-sm"></div>
              </div>
            </div>
          </div>
          ) :
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
        }

        <div className="font-heading1 text-sm flex justify-end gap-4">
          <button
            className={`font-heading1 px-4 py-2 text-mainbg1 font-semibold rounded-sm
                  ${
                    formPending()
                      ? "bg-btnhover1 opacity-70 cursor-not-allowed"
                      : "px-4 py-2 bg-btn1 hover:bg-btnhover1 text-mainbg1 font-semibold rounded-sm flex items-center justify-center hover:shadow-[0_0_10px_#87d9da] transition-all duration-200"
                  }
                `}
            disabled={formPending()}
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
            {formPending() ? 
              <span className="flex items-center gap-2">
                <SubmissionSpinner />
                Updating Storage ...
              </span>
              : "Update Storage"}
          </button>
        </div>
      </fieldset>
    </div>
  );
}
