"use client";

import { useRouter } from "next/navigation";
import { useInstanceContext } from "../../../InstanceContext";
import { useNotificationsContext } from "@/app/NotificationContext";
import { useEffect, useState } from "react";
import axios from "axios";

type InstanceTypes = Record<string, string[]>;

export default function HardwarePage() {
  const router = useRouter();
  const [instanceTypes, setInstanceTypes] = useState<InstanceTypes>({});
  const { instance } = useInstanceContext();
  const { addNotification, formPending } = useNotificationsContext();
  const [loading, setLoading] = useState(true);
  const [selectedInstanceType, setSelectedInstanceType] = useState("");
  const [filteredInstanceTypes, setFilteredInstanceTypes] = useState<string[]>(
    [],
  );
  const [instanceSize, setInstanceSize] = useState("");

  useEffect(() => {
    const fetchInstanceTypes = async () => {
      try {
        const { data } = await axios.get("/api/instanceTypes");
        setLoading(false);
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

  const updateHardware = async () => {
    if (!selectedInstanceType || !instanceSize || !instance) {
      alert("Missing instance type or size");
      return;
    }
    await addNotification({
      type: "instanceType",
      status: "pending",
      instanceName: instance.name,
      path: "instances",
      message: `Updating type of ${instance.name} to ${selectedInstanceType}`,
    });

    try {
      await axios.put(`/api/instances/${instance?.name}/hardware/type`, {
        instanceId: instance?.id,
        instanceType: instanceSize,
        region: instance?.region,
      });
      return true;
    } catch (error) {
      console.error(error);
      alert("Failed to update instance hardware");
      return false;
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div>
        <h1>Edit Hardware</h1>
        <p>Current instance hardware: {instance?.type}</p>
        <fieldset disabled={formPending()} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <label
                htmlFor="instanceType"
                className="text-xl text-gray-700 w-1/4"
              >
                New Instance Type:
              </label>
              <select
                id="instanceType"
                name="instanceType"
                value={selectedInstanceType}
                onChange={(e) => setSelectedInstanceType(e.target.value)}
                className="w-3/4 p-2 border rounded-md text-xl"
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
                className="text-xl text-gray-700 w-1/4"
              >
                New Instance Size:
              </label>
              <select
                id="instanceSize"
                name="instanceSize"
                disabled={!selectedInstanceType}
                className="w-3/4 p-2 border rounded-md text-xl"
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
          </div>
          <button
            type="submit"
            className="w-1/4 py-2 bg-green-400 text-white rounded-full hover:bg-green-300 focus:ring-2 focus:ring-green-500 text-xl"
            disabled={formPending()}
            onClick={async (e) => {
              e.preventDefault();
              await updateHardware();
              router.push("/instances");
            }}
          >
            {formPending() ? "Saving..." : "Submit"}
          </button>
        </fieldset>
      </div>
    </>
  );
}
