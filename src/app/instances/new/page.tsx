"use client";

import Form from "next/form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import generateName from "@/utils/randomNameGenerator";
import axios from "axios";
import Link from "next/link";

type InstanceTypes = Record<string, string[]>;

export default function NewFormPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [instanceName, setInstanceName] = useState("");
  const [availableRegions, setAvailableRegions] = useState([]);
  const [instanceTypes, setInstanceTypes] = useState<InstanceTypes>({});
  const [instantiating, setInstantiating] = useState(false);
  const [selectedInstanceType, setSelectedInstanceType] = useState<string>("");
  const [filteredInstanceTypes, setFilteredInstanceTypes] = useState<string[]>(
    [],
  );

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get("/api/regions");
        setAvailableRegions(data.regions);
      } catch (error) {
        console.error("Error fetching regions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchInstanceTypes = async () => {
      try {
        const { data } = await axios.get("/api/instanceTypes");
        setInstanceTypes(data.instanceTypes);
      } catch (error) {
        console.log("Error fetching instance types:", error);
      }
    };

    fetchRegions();
    fetchInstanceTypes();
  }, []);

  useEffect(() => {
    setFilteredInstanceTypes(instanceTypes[selectedInstanceType] ?? []);
  }, [selectedInstanceType, instanceTypes]);

  const handleSubmit = async (formData: FormData) => {
    if (!isValidName(instanceName)) {
      alert(
        "Instance name must be 3-64 characters long with valid characters.",
      );
      setInstantiating(false);
      return;
    }

    if (!isValidStorageSize(Number(formData.get("storageSize")))) {
      alert("Storage size must be between 1 & 10000.");
      setInstantiating(false);
      return;
    }

    try {
      await axios.post("/api/instances", {
        instanceName: formData.get("instanceName"),
        region: formData.get("region"),
        instanceType: formData.get("instanceSize"),
        username: formData.get("username"),
        password: formData.get("password"),
        storageSize: formData.get("storageSize"),
      });
      router.push("/");
    } catch (error) {
      setInstantiating(false);
      console.error("Error creating instance:", error);
    }
  };

  const handleGenerate = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setInstanceName(generateName());
  };

  const isValidName = (name: string) => /^[a-z0-9-_]{3,64}$/i.test(name);
  const isValidStorageSize = (size: number) => size >= 1 && size <= 16000;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-card text-pagetext1 shadow-md mt-6">
      <h1 className="text-2xl font-heading1 text-headertext1 mb-10">
        Create Instance
      </h1>
      {isLoading ? (
          <div className="space-y-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-1/4 h-5 bg-gray-600 rounded"></div>
              <div className="w-3/4 h-5 bg-gray-600 rounded"></div>
            </div>
          ))}
          <div className="border-t border-gray-600 my-6" />
          <div className="flex justify-end gap-4 mt-6">
            <div className="w-24 h-5 bg-gray-600 rounded"></div>
            <div className="w-28 h-5 bg-gray-600 rounded"></div>
          </div>
        </div>
      ) : (
        <Form
          action={(formData) => {
            setInstantiating(true);
            handleSubmit(formData);
          }}
          className="space-y-4 m-5"
        >
          <fieldset disabled={instantiating} className="space-y-4">
            <div className="flex items-center gap-4">
              <label
                htmlFor="instanceName"
                className="text-md text-pagetext1 w-1/4"
              >
                Instance Name:
              </label>
              <div className="flex gap-2 w-3/4">
                <input
                  id="instanceName"
                  name="instanceName"
                  type="text"
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                  className={`w-9/16 p-2 border rounded-md text-sm`}
                />
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-4 py-2 bg-mainbg1 text-headertext1 rounded-sm hover:bg-mainbghover text-sm"
                >
                  Generate random name
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="region" className="text-md text-pagetext1 w-1/4">
                Region:
              </label>
              <select
                id="region"
                name="region"
                disabled={instantiating}
                className="w-3/4 p-2 border rounded-md text-sm"
              >
                {availableRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label
                htmlFor="instanceType"
                className="text-md text-pagetext1 w-1/4"
              >
                Instance Type:
              </label>
              <select
                id="instanceType"
                name="instanceType"
                value={selectedInstanceType}
                onChange={(e) => setSelectedInstanceType(e.target.value)}
                className="w-3/4 p-2 border rounded-md text-sm"
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
                className="text-md text-pagetext1  w-1/4"
              >
                Instance Size:
              </label>
              <select
                id="instanceSize"
                name="instanceSize"
                disabled={!selectedInstanceType}
                className="w-3/4 p-2 border rounded-md text-sm"
              >
                <option value="">Select an instance size</option>
                {filteredInstanceTypes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label
                htmlFor="storageSize"
                className="text-md text-pagetext1  w-1/4"
              >
                Storage Size (GB):
              </label>
              <input
                id="storageSize"
                name="storageSize"
                type="number"
                defaultValue={8}
                className="w-3/4 p-2 border rounded-md text-sm"
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="username" className="text-md text-pagetext1 w-1/4">
                Username:
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className="w-3/4 p-2 border rounded-md text-sm"
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="password" className="text-md text-pagetext1 w-1/4">
                Password:
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="w-3/4 p-2 border rounded-md text-sm"
              />
            </div>

            {/* Dividing Line */}
            <div className="border-t border-gray-300 my-6"></div>

            {/* Button Container */}

            <div className="font-heading1 text-sm  flex justify-end gap-4 mt-6">
              <Link
                href="/"
                className="px-4 py-2 bg-card border-1 border-btn1 text-btn1 rounded-sm text-center hover:shadow-[0_0_8px_#87d9da] transition-all duration-200 hover:bg-card"
              >
                Cancel
              </Link>
              <button 
                type="submit"
                disabled={instantiating}
                className="px-4 py-2 bg-btn1 hover:bg-btnhover1 text-mainbg1 font-semibold rounded-sm flex items-center justify-center hover:shadow-[0_0_10px_#87d9da] transition-all duration-200"
              >
                {instantiating ? (
                  <span className="flex items-center">
                    <div className="animate-spin border-2 border-t-2 border-mainbg1 w-4 h-4 rounded-full mr-2"></div>
                    Creating...
                  </span>
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </fieldset>
        </Form>
      )}
    </div>
  );
}
