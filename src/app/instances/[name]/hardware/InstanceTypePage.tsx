"use client";

import { useInstanceContext } from "../InstanceContext";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import ErrorBanner from "@/app/components/ErrorBanner";

type InstanceTypes = Record<string, string[]>;

export function InstanceTypePage() {
  const [instanceTypes, setInstanceTypes] = useState<InstanceTypes>({});
  const { instance } = useInstanceContext();
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInstanceType, setSelectedInstanceType] = useState("");
  const [filteredInstanceTypes, setFilteredInstanceTypes] = useState<string[]>(
    [],
  );
  const [instanceSize, setInstanceSize] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchInstanceTypes = async () => {
      try {
        const { data } = await axios.get("/api/instanceTypes");
        setIsLoading(false);
        setInstanceTypes(data.instanceTypes);
      } catch (error) {
        console.log("Error fetching instance types:", error);
      }
    };

    fetchInstanceTypes();
  }, []);

  useEffect(() => {
    setFilteredInstanceTypes(instanceTypes[selectedInstanceType] ?? []);
  }, [selectedInstanceType, instanceTypes]);

  const resetErrors = () => setErrors([]);

  const addError = (error: string) => setErrors((prevErrors) => [...prevErrors, error]);

  const validateInstanceTypeAndSize = (): boolean => {
    resetErrors();

    if (!selectedInstanceType) {
      addError("Please select an instance type.");
    } else if (!(selectedInstanceType in instanceTypes)) {
      addError("The selected instance type is not valid.");
    }

    if (!instanceSize) {
      addError("Please select an instance size.");
    } else if (!instanceTypes[selectedInstanceType]?.includes(instanceSize)) {
      addError(`The selected size is not valid for the chosen instance type.`);
    }

    return errors.length === 0;
  };

  const updateHardware = async () => {
    if (!validateInstanceTypeAndSize()) {
      setSaving(false);
      return false;
    }

    try {
      await axios.put(`/api/instances/${instance?.name}/hardware/type`, {
        instanceId: instance?.id,
        instanceType: instanceSize,
        region: instance?.region,
      });
      return true;
    } catch (error) {
      setSaving(false);
      console.error(error);
      alert("Failed to update instance hardware");
      return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card rounded-lg shadow-md mt-8 text-pagetext1">
      <h1 className="font-heading1 text-headertext1 text-2xl mb-10">
        Instance Type
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
          <p className="font-text1 text-md">Current instance type and size:</p>
          <p className="font-text1 text-btnhover1 text-sm">{instance?.type}</p>
        </div>
      }

      <p className="font-text1 text-sm text-pagetext1 mb-6">
        This is the hardware of your instance. You can change the hardware to better suit the needs of the broker, or expand the size to have more cores and memory.{" "}
        <a
          href="https://aws.amazon.com/ec2/instance-types/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-pagetext1 hover:text-headertext1"
        >
          AWS EC2 Instance Types
        </a>.
      </p>

      {errors.length > 0 && (
        <div className="mb-4">
          {errors.map((error, index) => (
            <ErrorBanner key={index} message={error} onClose={() => setErrors([])} />
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-1/3 h-6 bg-gray-600 rounded-sm"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-1/3 h-6 bg-gray-600 rounded-sm"></div>
            </div>
          </div>
        </div>
      ) : (
        <fieldset disabled={saving} className="space-y-4">
          <div className="flex items-center gap-4">
            <label
              htmlFor="instanceType"
              className="font-text1 text-headertext1 text-md w-1/3"
            >
              Change Instance Type:
            </label>
            <select
              id="instanceType"
              name="instanceType"
              value={selectedInstanceType}
              onChange={(e) => setSelectedInstanceType(e.target.value)}
              className="font-text1 w-1/3 p-2 border rounded-md text-sm"
            >
              <option value="">Select an instance type</option>
              {Object.keys(instanceTypes).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label
              htmlFor="instanceSize"
              className="font-text1 text-headertext1 text-md w-1/3"
            >
              Change Instance Size:
            </label>
            <select
              id="instanceSize"
              name="instanceSize"
              disabled={!selectedInstanceType}
              className="font-text1 w-1/3 p-2 border rounded-md text-sm"
              value={instanceSize}
              onChange={(e) => setInstanceSize(e.target.value)}
            >
              <option value="">Select an instance size</option>
              {filteredInstanceTypes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="font-heading1 text-sm flex justify-end gap-4 mt-6">
            <Link
              href={`/instances/${instance?.name}/hardware?region=${instance?.region}`}
              className="px-4 py-2 bg-card border-1 border-btn1 text-btn1 rounded-sm text-center hover:shadow-[0_0_8px_#87d9da] transition-all duration-200 hover:bg-card"
            >
              Cancel
            </Link>
            <button
              className={`font-heading1 px-4 py-2 text-mainbg1 font-semibold rounded-sm
                    ${saving ? "bg-btnhover1 opacity-70 cursor-not-allowed" : "px-4 py-2 bg-btn1 hover:bg-btnhover1 text-mainbg1 font-semibold rounded-sm flex items-center justify-center hover:shadow-[0_0_10px_#87d9da] transition-all duration-200"}
                  `}
              type="submit"
              disabled={saving}
              onClick={async (e) => {
                e.preventDefault();
                setSaving(true);
                const success = await updateHardware();
                if (success)
                  window.location.href = `/instances/${instance?.name}/hardware?region=${instance?.region}`;
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </fieldset>
      )}
    </div>
  );
}
