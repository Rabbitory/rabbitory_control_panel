"use client";

// import Form from "next/form";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import generateName from "@/utils/randomNameGenerator";
import axios from "axios";
import Link from "next/link";
import { Lightbulb } from "lucide-react";

import { StorageDetails } from "../components/StorageDetails";
import { InstanceDetails } from "../components/InstanceDetails";
import ErrorBanner from "@/app/instances/components/ErrorBanner";
import NewInstanceLoadingSkeleton from "./components/NewInstanceLoadingSkeleton";
import SubmissionSpinner from "../components/SubmissionSpinner";

import { useNotificationsContext } from "@/app/NotificationContext";
import InstanceNameField from "./components/InstanceNameField";
import RegionField from "./components/RegionField";
import InstanceTypeField from "./components/InstanceTypeField";
import InstanceSizeField from "./components/InstanceSizeField";
import StorageSizeField from "./components/StorageSizeField";
import UsernameField from "./components/UsernameField";
import PasswordField from "./components/PasswordField";

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
      addNotification({
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
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        const apiError = err.response.data;
        setErrorMessages([apiError.message]);
      } else {
        setErrorMessages([
          "Something went wrong while creating the instance. Please try again.",
        ]);
      }
    } finally {
      setInstantiating(false);
    }
  };

  const handleGenerate = () => setInstanceName(generateName());

  const dismissError = (i: number) => {
    setErrorMessages((prev) => prev.filter((_, idx) => idx !== i));
  };

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
            <InstanceNameField
              instanceName={instanceName}
              onGenerate={handleGenerate}
              onChange={setInstanceName}
            />

            <RegionField
              selectedRegion={selectedRegion}
              availableRegions={availableRegions}
              onChange={setSelectedRegion}
            />

            <InstanceDetails />

            <InstanceTypeField
              selectedInstanceType={selectedInstanceType}
              instanceTypes={instanceTypes}
              onChange={setSelectedInstanceType}
            />

            <InstanceSizeField
              selectedInstanceSize={selectedInstanceSize}
              selectedInstanceType={selectedInstanceType}
              filteredInstanceTypes={filteredInstanceTypes}
              onChange={setSelectedInstanceSize}
            />

            <StorageDetails />

            <StorageSizeField
              storageSize={storageSize}
              onChange={setStorageSize}
            />

            <p className="py-4 bg-card font-text1 text-sm text-pagetext1 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-btnhover1" />
              Create a username and password for logging into your RabbitMQ
              Management UI.
            </p>

            <UsernameField username={username} onChange={setUsername} />

            <PasswordField password={password} onChange={setPassword} />

            <p className="pl-47 bg-card font-text1 text-xs text-pagetext1">
              Password must be at least 8 characters long and include one
              letter, one number, and one special character ( !@#$%^&* ) .
            </p>

            <div className="border-t border-headertext1 my-6"></div>

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
