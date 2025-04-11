"use client";

import Form from "next/form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import generateName from "@/utils/randomNameGenerator";
import axios from "axios";
import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { StorageDetails } from "@/app/components/StorageDetails";
import { InstanceDetails } from "@/app/components/InstanceDetails";
import ErrorBanner from "@/app/components/ErrorBanner";


type InstanceTypes = Record<string, string[]>;

export default function NewInstancePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [instanceName, setInstanceName] = useState("");
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
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

  const getFormData = (formData: FormData) => {
    return {
      name: formData.get("instanceName")?.toString().trim() ?? "",
      region: formData.get("region")?.toString() ?? "",
      type: formData.get("instanceType")?.toString() ?? "",
      size: formData.get("instanceSize")?.toString() ?? "",
      username: formData.get("username")?.toString().trim() ?? "",
      password: formData.get("password")?.toString() ?? "",
      storageSize: Number(formData.get("storageSize")),
    };
  };

  const validateName = (name: string) => {
    const errors: string[] = [];
    if (!/^[a-z0-9-_]{3,64}$/i.test(name)) {
      errors.push("Instance name must be 3–64 characters long and use only letters, numbers, hyphens, or underscores.");
    }
    return errors;
  };

  const validateRegion = (region: string) => {
    const errors: string[] = [];
    if (!region) {
      errors.push("Please select a region.");
    } else if (!availableRegions.includes(region)) {
      errors.push("Selected region is not valid.");
    }
    return errors;
  };

  const validateInstanceType = (type: string) => {
    const errors: string[] = [];
    if (!type) {
      errors.push("Please select an instance type.");
    } else if (!(type in instanceTypes)) {
      errors.push("Selected instance type is not valid.");
    }
    return errors;
  };

const validateSize = (size: string) => {
  const errors: string[] = [];
  if (!size) {
    errors.push("Please select an instance size.");
  } else if (!filteredInstanceTypes.includes(size)) {
    errors.push("Selected instance size is not valid.");
  }
  return errors;
};

const validateUsername = (username: string) => {
  const errors: string[] = [];
  if (!username) {
    errors.push("Username is required.");
  } else if (username.length < 6) {
    errors.push("Username must be at least 6 characters long.");
  }
  return errors;
};

const validatePassword = (password: string) => {
  const errors: string[] = [];
  if (!password) {
    errors.push("Password is required.");
  } else if (
    password.length < 8 ||
    !/[a-zA-Z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[!@#$%^&*]/.test(password)
  ) {
    errors.push("Password must be at least 8 characters long and include a letter, a number, and a special character.");
  }
  return errors;
};

  const validateStorageSize = (storageSize: number) => {
    const errors: string[] = [];
    if (isNaN(storageSize) || storageSize < 8 || storageSize > 16000) {
      errors.push("Storage size must be between 8 and 16000 GB.");
    }
    return errors;
  };

  const handleSubmit = async (formData: FormData) => {
    const errors: string[] = [];
    const data = getFormData(formData);

    errors.push(...validateName(data.name));
    errors.push(...validateRegion(data.region));
    errors.push(...validateInstanceType(data.type));
    errors.push(...validateSize(data.size));
    errors.push(...validateUsername(data.username));
    errors.push(...validatePassword(data.password));
    errors.push(...validateStorageSize(data.storageSize));

    if (errors.length > 0) {
      setErrorMessages(errors);
      setInstantiating(false);
      return;
    }

    try {
      await axios.post("/api/instances", {
        instanceName: data.name,
        region: data.region,
        instanceType: data.size,
        username: data.username,
        password: data.password,
        storageSize: data.storageSize,
      });
      router.push("/");
    } catch (error) {
      setErrorMessages([
        "Something went wrong while creating the instance. Please try again.",
      ]);
      setInstantiating(false);
      console.error("Error creating instance:", error);
    }
  };

  const dismissError = (indexToRemove: number) => {
    setErrorMessages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleGenerate = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setInstanceName(generateName());
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-card text-pagetext1 shadow-md mt-6">
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
                  className={`font-text1 text-btnhover1 w-9/16 p-2 border border-pagetext1 rounded-md text-sm`}
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
                disabled={instantiating}
                className="font-text1 w-3/4 p-2 border rounded-md text-sm"
              >
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
                className="font-heading1 text-md text-headertext1  w-1/4"
              >
                Instance Size:
              </label>
              <select
                id="instanceSize"
                name="instanceSize"
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
                className="font-heading1 text-md text-headertext1  w-1/4"
              >
                Storage Size (GB):
              </label>
              <input
                id="storageSize"
                name="storageSize"
                type="number"
                defaultValue={8}
                className="font-text1 w-3/4 p-2 border rounded-md text-sm"
              />
            </div>

            <p className="py-4 bg-card font-text1 text-sm text-p flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-btnhover1" />
              The following username and password will be for logging into your
              RabbitMQ Manger portal.
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
                className="font-text1 w-3/4 p-2 border rounded-md text-sm"
              />
            </div>

            <div className="border-t border-headertext1 my-6"></div>

            {/* Buttons */}
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
