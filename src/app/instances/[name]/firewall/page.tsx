"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import React from "react";
import { useInstanceContext } from "../InstanceContext";
import { FirewallRule } from "@/types/firewall";
import ErrorBanner from "@/app/instances/components/ErrorBanner";
import {
  isValidDescription,
  isValidSourceIp,
  isInRangeCustomPort,
} from "@/utils/firewallValidation";
import { COMMON_PORTS } from "@/utils/firewallConstants";
import FirewallDescription from "./components/FirewallDescription";
import LoadingSkeleton from "./components/LoadingSkeleton";
import FirewallRuleDescription from "./components/FirewallRuleDescription";
import FirewallRuleSourceIp from "./components/FirewallRuleSourceIp";
import FirewallRuleCommonPorts from "./components/FirewallRuleCommonPorts";
import FirewallRuleCustomPort from "./components/FirewallRuleCustomPorts";

import { useNotificationsContext } from "@/app/NotificationContext";
import SubmissionSpinner from "../../components/SubmissionSpinner";

export default function FirewallPage() {
  const { instance } = useInstanceContext();
  const { addNotification, formPending } = useNotificationsContext();
  const [rules, setRules] = useState<FirewallRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const configSectionRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function fetchRules() {
      setIsLoading(true);
      try {
        const { data } = await axios.get(
          `/api/instances/${instance?.name}/firewall?region=${instance?.region}`
        );

        setRules(data);
      } catch (error) {
        console.error("Error fetching rules:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRules();
  }, [instance?.name, instance?.region]);

  useEffect(() => {
    if (errors.length > 0) {
      configSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [errors]);

  const resetError = (errorMessage: string) => {
    setErrors((prevErrors) =>
      prevErrors.filter((error) => error !== errorMessage)
    );
  };

  const addError = (errorMessage: string) => {
    setErrors((prevErrors) => {
      if (!prevErrors.includes(errorMessage)) {
        return [...prevErrors, errorMessage];
      }
      return prevErrors;
    });
  };

  const handleDescriptionChange = (index: number, value: string) => {
    setRules((prevRules) => {
      const updatedRules = [...prevRules];
      updatedRules[index] = { ...updatedRules[index], description: value };

      const error = validateDescription(value);
      resetError(
        `Description must be 255 characters or fewer, and cannot contain the following characters: ^, ", ', %, &, <, >, |, \``
      );

      if (error) addError(error);
      return updatedRules;
    });
  };

  const handleSourceIpChange = (index: number, value: string) => {
    setRules((prevRules) => {
      const updatedRules = [...prevRules];
      updatedRules[index] = { ...updatedRules[index], sourceIp: value };
      return updatedRules;
    });

    resetError("Invalid Source IP format.");
  };

  const handleSourceIpBlur = (value: string) => {
    const error = validateSourceIp(value);
    resetError("Invalid Source IP format.");
    if (error) addError(error);
  };

  const handleCustomPortsChange = (index: number, value: string) => {
    setRules((prevRules) => {
      const updatedRules = [...prevRules];

      updatedRules[index] = { ...updatedRules[index], customPorts: value };

      return updatedRules;
    });

    const portRangeError = "Ports must be between 1 and 65535.";
    const portRepeatedError = "Port is already listed as a common port.";

    resetError(portRangeError);
    resetError(portRepeatedError);

    if (!isInRangeCustomPort(value)) {
      addError(portRangeError);
    }
  };

  const handlePortToggle = (index: number, port: string) => {
    setRules((prevRules) => {
      return prevRules.map((rule, i) => {
        if (i !== index) {
          return rule;
        }

        const isPortIncluded = rule.commonPorts.includes(port);
        let updatedPorts: string[];

        if (isPortIncluded) {
          updatedPorts = rule.commonPorts.filter((p) => p !== port);
        } else {
          updatedPorts = [...rule.commonPorts, port];
        }

        return { ...rule, commonPorts: updatedPorts };
      });
    });
  };

  const addRule = () => {
    setRules([
      ...rules,
      { description: "", sourceIp: "", commonPorts: [], customPorts: "" },
    ]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_rule, i) => i !== index));
  };

  const validateDescription = (description: string): string | null => {
    const inputError = `Description must be 255 characters or fewer, and cannot contain the following characters: ^, ", ', %, &, <, >, |, \``;
    if (!isValidDescription(description)) {
      return inputError;
    }
    return null;
  };

  const validateSourceIp = (sourceIp: string): string | null => {
    const inputError =
      "Invalid Source IP format. Use CIDR block notation, e.g. '192.168.0.0/24' or '10.0.0.1/32'.";

    if (sourceIp.trim() !== "" && !isValidSourceIp(sourceIp)) {
      return inputError;
    }

    return null;
  };

  const validateCustomPorts = (
    customPorts: string,
    commonPorts: string[]
  ): string[] => {
    const errors: string[] = [];

    const portList = customPorts
      .split(",")
      .map((port) => port.trim())
      .filter((port) => port !== "");

    const nonNumericPorts = portList.filter((port) => !/^\d+$/.test(port));

    if (nonNumericPorts.length > 0) {
      errors.push("Custom ports must be a comma-separated list of numbers.");
      return errors;
    }

    if (!isInRangeCustomPort(customPorts)) {
      errors.push("Ports must be between 1 and 65535.");
    }

    const repeated = findCommonAndCustomPortOverlap(customPorts, commonPorts);
    if (repeated.length > 0) {
      errors.push("Port is already listed as a common port.");
    }

    return errors;
  };

  const findCommonAndCustomPortOverlap = (
    customPorts: string,
    commonPorts: string[]
  ): string[] => {
    const customList = customPorts
      .split(",")
      .map((port) => port.trim())
      .filter((port) => port !== "");

    const commonPortNumbers = COMMON_PORTS.filter(({ name }) =>
      commonPorts.includes(name)
    ).map((p) => p.port.toString());
    return customList.filter((port) => commonPortNumbers.includes(port));
  };

  const handleSave = async () => {
    if (!instance || !instance.name) return;

    const validationErrors: string[] = [];

    rules.forEach((rule) => {
      const descError = validateDescription(rule.description);
      const sourceIpError = validateSourceIp(rule.sourceIp);
      const customPortErrors = validateCustomPorts(
        rule.customPorts,
        rule.commonPorts
      );

      if (descError) validationErrors.push(descError);
      if (sourceIpError) validationErrors.push(sourceIpError);
      validationErrors.push(...customPortErrors);
    });

    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      return;
    }

    try {
      addNotification({
        type: "firewall",
        status: "pending",
        instanceName: instance.name,
        path: "firewall",
        message: `Saving firewall rules for ${instance.name}`,
      });
      const { data } = await axios.put(
        `/api/instances/${instance?.name}/firewall?region=${instance?.region}`,
        { rules }
      );

      setRules(data);
    } catch (error) {
      console.error("Error saving rules:", error);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `/api/instances/${instance?.name}/firewall?region=${instance?.region}`
      );
      setRules(data);
      setErrors([]);
    } catch (error) {
      console.error("Error resetting rules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto p-6 bg-card rounded-md shadow-md mt-8 text-pagetext1"
      ref={configSectionRef}
    >
      <FirewallDescription />

      {errors.length > 0 && (
        <div className="mb-6 space-y-2">
          {errors.map((error, i) => (
            <ErrorBanner
              key={i}
              message={error}
              onClose={() => resetError(error)}
            />
          ))}
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            rules.map((rule, index) => (
              <div
                key={index}
                className="py-2 px-3 border-[0.5] border-gray-700 rounded-md"
              >
                <div className="font-text1 grid grid-cols-12 gap-4 items-start">
                  <FirewallRuleDescription
                    rule={rule}
                    index={index}
                    onChange={handleDescriptionChange}
                  />

                  <FirewallRuleSourceIp
                    rule={rule}
                    index={index}
                    onChange={handleSourceIpChange}
                    onBlur={handleSourceIpBlur}
                  />

                  <FirewallRuleCommonPorts
                    rule={rule}
                    index={index}
                    onChange={handlePortToggle}
                  />

                  <FirewallRuleCustomPort
                    rule={rule}
                    index={index}
                    onChange={handleCustomPortsChange}
                    removeRule={removeRule}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="font-heading1 text-sm flex justify-between mt-4">
          <button
            onClick={addRule}
            className="px-4 py-2 bg-card border-1 border-btn1 text-btn1 rounded-sm text-center text-sm hover:shadow-[0_0_8px_#87d9da] transition-all duration-200 hover:bg-card"
          >
            + Add Additional Rule
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="px-4 py-2 bg-card border-1 border-btn1 text-btn1 rounded-sm text-center text-sm hover:shadow-[0_0_8px_#87d9da] transition-all duration-200 hover:bg-card"
            >
              Reset
            </button>

            <button
              onClick={handleSave}
              disabled={errors.length > 0 || formPending()}
              className="font-heading1 bg-btn1 text-mainbg1 font-semibold px-4 py-2 rounded-sm hover:bg-btnhover1 cursor-pointer flex items-center justify-center hover:shadow-[0_0_10px_#87d9da] transition-all duration-200"
            >
              {formPending() ? (
                <span className="flex items-center gap-2">
                  <SubmissionSpinner />
                  Saving ...
                </span>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
