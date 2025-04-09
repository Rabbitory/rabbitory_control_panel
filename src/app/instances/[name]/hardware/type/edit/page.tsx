"use client";

import { useInstanceContext } from "../../../InstanceContext";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

type InstanceTypes = Record<string, string[]>;

export default function HardwarePage() {
  const [instanceTypes, setInstanceTypes] = useState<InstanceTypes>({});
  const { instance } = useInstanceContext();
  const [saving, setSaving] = useState(false);
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
    if (!selectedInstanceType || !instanceSize) {
      alert("Missing instance type or size");
      setSaving(false);
      return;
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card rounded-md shadow-md mt-6 text-pagetext1">
      <h1 className="font-heading1 text-headertext1 text-2xl mb-10">Edit Instance Type + Size</h1>
      <p className="font-text1 text-md mb-6">Current instance hardware: {instance?.type}</p>
      <fieldset disabled={saving} className="space-y-4">
          <div className="flex items-center gap-4">
            <label
              htmlFor="instanceType"
              className="font-text1 text-headertext1 text-md w-1/4"
            >
              New Instance Type:
            </label>
            <select
              id="instanceType"
              name="instanceType"
              value={selectedInstanceType}
              onChange={(e) => setSelectedInstanceType(e.target.value)}
              className="font-text1 w-1/4 p-2 border rounded-md text-sm"
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
              className="font-text1 text-headertext1 text-md w-1/4"
            >
              New Instance Size:
            </label>
            <select
              id="instanceSize"
              name="instanceSize"
              disabled={!selectedInstanceType}
              className="font-text1 w-1/4 p-2 border rounded-md text-sm"
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
    </div>
  );
}
