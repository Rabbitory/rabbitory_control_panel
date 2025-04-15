"use client";

// import Form from "next/form";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import generateName from "@/utils/randomNameGenerator";
import axios from "axios";
import Link from "next/link";
import { Lightbulb } from "lucide-react";

import { StorageDetails } from "@/app/components/StorageDetails";
import { InstanceDetails } from "@/app/components/InstanceDetails";
import ErrorBanner from "@/app/components/ErrorBanner";
import NewInstanceLoadingSkeleton from "./NewInstanceLoadingSkeleton";
import SubmissionSpinner from "@/app/components/SubmissionSpinner";

import { useNotificationsContext } from "@/app/NotificationContext";

type InstanceTypes = Record<string, string[]>;

export default function NewInstancePage() {
  const router = useRouter();
  const { addNotification } = useNotificationsContext();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [instantiating, setInstantiating] = useState(false);

  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [instanceTypes, setInstanceTypes] = useState<InstanceTypes>({});
  const [filteredInstanceTypes, setFilteredInstanceTypes] = useState<string[]>(
    []
  );
  const configSectionRef = React.useRef<HTMLDivElement | null>(null);

  const [instanceName, setInstanceName] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedInstanceType, setSelectedInstanceType] = useState("");
  const [selectedInstanceSize, setSelectedInstanceSize] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [storageSize, setStorageSize] = useState(8);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [regionRes, typeRes] = await Promise.all([
          axios.get("/api/regions"),
          axios.get("/api/instanceTypes"),
        ]);
        setAvailableRegions(regionRes.data.regions);
        setInstanceTypes(typeRes.data.instanceTypes);
      } catch (err) {
        console.error("Error loading form data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setFilteredInstanceTypes(instanceTypes[selectedInstanceType] ?? []);
  }, [selectedInstanceType, instanceTypes]);

  useEffect(() => {
    if (errorMessages.length > 0) {
      configSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [errorMessages]);

  // Validation functions
  const validateName = (name: string) =>
    !/^[a-z0-9-_]{3,64}$/i.test(name)
      ? [
          "Instance name must be 3–64 characters long and use only letters, numbers, hyphens, or underscores.",
        ]
      : [];

  const validateRegion = (region: string) =>
    !region
      ? ["Please select a region."]
      : !availableRegions.includes(region)
      ? ["Selected region is not valid."]
      : [];

  const validateInstanceType = (type: string) =>
    !type
      ? ["Please select an instance type."]
      : !(type in instanceTypes)
      ? ["Selected instance type is not valid."]
      : [];

  const validateSize = (size: string) =>
    !size
      ? ["Please select an instance size."]
      : !filteredInstanceTypes.includes(size)
      ? ["Selected instance size is not valid."]
      : [];

  const validateUsername = (u: string) =>
    !u
      ? ["Username is required."]
      : u.length < 6
      ? ["Username must be at least 6 characters long."]
      : [];

  const validatePassword = (p: string) =>
    !p
      ? ["Password is required."]
      : p.length < 8 ||
        !/[a-zA-Z]/.test(p) ||
        !/[0-9]/.test(p) ||
        !/[!@#$%^&*]/.test(p)
      ? [
          "Password must be at least 8 characters long and include a letter, a number, and a special character.",
        ]
      : [];

  const validateStorageSize = (size: number) =>
    isNaN(size) || size < 8 || size > 16000
      ? ["Storage size must be between 8 and 16000 GB."]
      : [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInstantiating(true);

    const errors: string[] = [
      ...validateName(instanceName),
      ...validateRegion(selectedRegion),
      ...validateInstanceType(selectedInstanceType),
      ...validateSize(selectedInstanceSize),
      ...validateUsername(username),
      ...validatePassword(password),
      ...validateStorageSize(storageSize),
    ];

    if (errors.length > 0) {
      setErrorMessages(errors);
      setInstantiating(false);
      return;
    }

    try {
      await addNotification({
        type: "newInstance",
        status: "pending",
        instanceName,
        path: "instances",
        message: `Creating ${instanceName} instance.`,
      });
      await axios.post("/api/instances", {
        instanceName,
        region: selectedRegion,
        instanceType: selectedInstanceSize,
        username,
        password,
        storageSize,
      });
      router.push("/");
    } catch (err) {
      console.error("Error creating instance:", err);
      setErrorMessages([
        "Something went wrong while creating the instance. Please try again.",
      ]);
    } finally {
      setInstantiating(false);
    }
  };

  const handleGenerate = () => setInstanceName(generateName());
  const dismissError = (i: number) =>
    setErrorMessages((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div
      className="max-w-3xl mx-auto p-6 bg-card text-pagetext1 rounded-sm shadow-md mt-6 mb-6"
      ref={configSectionRef}
    >
      <h1 className="text-2xl font-heading1 text-headertext1 mb-10">
        Create Instance
      </h1>
      <p className="font-text1 text-pagetext1 text-sm mb-8 px-4">
        Provide the following details to launch a new RabbitMQ instance in the
        cloud.
      </p>

      {errorMessages.length > 0 && (
        <div className="space-y-2 mb-4">
          {errorMessages.map((msg, idx) => (
            <ErrorBanner
              key={idx}
              message={msg}
              onClose={() => dismissError(idx)}
            />
          ))}
        </div>
      )}

      {isLoading ? (
        <NewInstanceLoadingSkeleton />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 m-5">
          <fieldset disabled={instantiating} className="space-y-4">
            {/* Instance Name */}
            <div className="flex items-center gap-4">
              <label
                htmlFor="instanceName"
                className="font-heading1 text-md text-headertext1 w-1/4"
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
                  className="font-text1 text-btnhover1 w-9/16 p-2 border border-pagetext1 rounded-md text-sm"
                />
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="font-heading1 text-xs ml-2 px-6 py-2 bg-card border-1 border-btn1 text-btn1 rounded-sm text-center hover:shadow-[0_0_8px_#87d9da] transition-all duration-200 hover:bg-card"
                >
                  Generate random name
                </button>
              </div>
            </div>

            {/* Region */}
            <div className="flex items-center gap-4">
              <label
                htmlFor="region"
                className="font-heading1 text-md text-headertext1 w-1/4"
              >
                Region:
              </label>
              <select
                id="region"
                name="region"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="font-text1 w-3/4 p-2 border rounded-md text-sm"
              >
                <option value="">Select a region</option>
                {availableRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <InstanceDetails />

            {/* Instance Type */}
            <div className="flex items-center gap-4">
              <label
                htmlFor="instanceType"
                className="font-heading1 text-md text-headertext1 w-1/4"
              >
                Instance Type:
              </label>
              <select
                id="instanceType"
                name="instanceType"
                value={selectedInstanceType}
                onChange={(e) => setSelectedInstanceType(e.target.value)}
                className="font-text1 w-3/4 p-2 border rounded-md text-sm"
              >
                <option value="">Select an instance type</option>
                {Object.keys(instanceTypes).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Instance Size */}
            <div className="flex items-center gap-4">
              <label
                htmlFor="instanceSize"
                className="font-heading1 text-md text-headertext1 w-1/4"
              >
                Instance Size:
              </label>
              <select
                id="instanceSize"
                name="instanceSize"
                value={selectedInstanceSize}
                onChange={(e) => setSelectedInstanceSize(e.target.value)}
                disabled={!selectedInstanceType}
                className="font-text1 w-3/4 p-2 border rounded-md text-sm"
              >
                <option value="">Select an instance size</option>
                {filteredInstanceTypes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <StorageDetails />

            {/* Storage Size */}
            <div className="flex items-center gap-4">
              <label
                htmlFor="storageSize"
                className="font-heading1 text-md text-headertext1 w-1/4"
              >
                Storage Size (GB):
              </label>
              <input
                id="storageSize"
                name="storageSize"
                type="number"
                value={storageSize}
                onChange={(e) => setStorageSize(Number(e.target.value))}
                className="font-text1 w-3/4 p-2 border rounded-md text-sm"
              />
            </div>

            <p className="py-4 bg-card font-text1 text-sm text-p flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-btnhover1" />
              The following username and password will be for logging into your
              RabbitMQ Manager portal.
            </p>

            {/* Username */}
            <div className="flex items-center gap-4">
              <label
                htmlFor="username"
                className="font-heading1 text-md text-headertext1 w-1/4"
              >
                Username:
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="font-text1 w-3/4 p-2 border rounded-md text-sm"
              />
            </div>

            {/* Password */}
            <div className="flex items-center gap-4">
              <label
                htmlFor="password"
                className="font-heading1 text-md text-headertext1 w-1/4"
              >
                Password:
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-text1 w-3/4 p-2 border rounded-md text-sm"
              />
            </div>

            <div className="border-t border-headertext1 my-6"></div>

            {/* Buttons */}
            <div className="font-heading1 text-sm flex justify-end gap-4 mt-6">
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
                  <span className="flex items-center gap-2">
                    <SubmissionSpinner />
                    Creating ...
                  </span>
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </fieldset>
        </form>
      )}
    </div>
  );
}
