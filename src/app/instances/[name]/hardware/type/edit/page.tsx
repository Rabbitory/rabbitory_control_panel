"use client";

import Form from "next/form";
import { useInstanceContext } from "../../../InstanceContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { _InstanceType } from "@aws-sdk/client-ec2";
import { useRouter } from "next/navigation";

type InstanceTypes = Record<string, string[]>;

export default function HardwarePage() {
  const router = useRouter();
  const [instanceTypes, setInstanceTypes] = useState<InstanceTypes>({});
  const { instance } = useInstanceContext();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedInstanceType, setSelectedInstanceType] = useState<string>("");
  const [filteredInstanceTypes, setFilteredInstanceTypes] = useState<string[]>(
    [],
  );

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

  const handleEdit = async (formData: FormData) => {
    const instanceType = formData.get("instanceType") as string;
    const instanceSize = formData.get("instanceSize") as _InstanceType;

    if (!instanceType || !instanceSize) {
      alert("Missing instance type or size");
      setEditing(false);
      return;
    }

    await axios.put(`/api/instances/${instance?.name}/hardware/type`, {
      instanceId: instance?.id,
      instanceType: instanceSize,
      region: instance?.region,
    });

    router.push(`/instances/${instance?.name}`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div>
        <h1>Edit Hardware</h1>
        <p>Current instance hardware: {instance?.type}</p>
        <Form
          action={(formData) => {
            setEditing(true);
            handleEdit(formData);
          }}
        >
          <fieldset disabled={editing} className="space-y-4">
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
            >
              Submit
            </button>
          </fieldset>
        </Form>
      </div>
    </>
  );
}
