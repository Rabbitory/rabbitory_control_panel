'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import React from "react";
import { useInstanceContext } from "../InstanceContext";
import { FirewallRule } from "@/types/firewall";
import { Info } from "lucide-react";
import { isValidDescription, isValidSourceIp, isInRangeCustomPort } from "@/utils/firewallValidation";
import { COMMON_PORTS } from "@/utils/firewallConstants";
import { Trash2 } from "lucide-react";


export default function FirewallPage() {
  const { instance } = useInstanceContext();
  const [rules, setRules] = useState<FirewallRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    async function fetchRules() {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`/api/instances/${instance?.name}/firewall?region=${instance?.region}`);
        setRules(data);
      } catch (error) {
        console.error("Error fetching rules:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRules();
  }, [instance?.name, instance?.region]);

  const resetError = (errorMessage: string) => {
    setErrors((prevErrors) => prevErrors.filter((error) => error !== errorMessage));
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
  
      const inputError = `Description must be 255 characters or fewer, and cannot contain the following characters: ^, ", ', %, &, <, >, |, \``;
      resetError(inputError);
  
      if (!isValidDescription(value)) {
        addError(inputError);
      }
  
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
    const inputError = "Invalid Source IP format.";

    if (value.trim() === "") return;

    if (!isValidSourceIp(value)) {
      addError(inputError);
    }
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
  
    // Validate if the ports are within range
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

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const { data } = await axios.put(
        `/api/instances/${instance?.name}/firewall?region=${instance?.region}`,
         { rules }
        );

      console.log(data.message);
      console.log(rules);
      alert("Firewall rules updated successfully!");
    } catch (error) {
      console.error("Error saving rules:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`/api/instances/${instance?.name}/firewall?region=${instance?.region}`);
      setRules(data);
      setErrors([]);
    } catch (error) {
      console.error("Error resetting rules:", error);
    } finally {
      setIsLoading(false);
    }
  };  

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card rounded-md shadow-md mt-6 text-pagetext1">
      <h1 className="font-heading1 text-headertext1 text-2xl mb-10">Firewall Settings</h1>
      <p className="font-text1 text-sm text-pagetext1 mb-6">
        Configuring firewall rules allows you to manage access to both your AWS EC2 instance and the RabbitMQ server. Adjusting these settings updates AWS security groups and configures the necessary plugins and ports on the RabbitMQ server.
      </p>
      <p className="font-text1 text-sm text-pagetext1 mb-6">
        The Common Ports section offers a list of protocols that can be enabled with a click, while the Custom Ports section allows specifying additional ports as a comma-separated list. Please note that only IPv4 is supported for the Source IP at this time.
      </p>
      <p className="font-text1 text-sm text-pagetext1 mb-6">
        For more details on supported protocols, refer to the{" "}
        <a
          href="https://www.rabbitmq.com/docs/protocols"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-pagetext1 hover:text-headertext1"
        >
          RabbitMQ Supported Protocols
        </a>.
      </p>
  
      {errors.length > 0 && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {errors.map((error, i) => (
            <p key={i}>Error: {error}</p>
          ))}
        </div>
      )}
  
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse py-2 px-3 border-[0.5] border-gray-700 rounded-md">
                  <div className="font-text1 grid grid-cols-12 gap-4 items-start">
                    <div className="col-span-2 bg-gray-600 h-6 rounded-sm" />
                    <div className="col-span-2 bg-gray-600 h-6 rounded-sm" />
                    <div className="col-span-4 bg-gray-600 h-6 rounded-sm" />
                    <div className="col-span-3 bg-gray-600 h-6 rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            rules.map((rule, index) => (
              <div key={index} className="py-2 px-3 border-[0.5] border-gray-700 rounded-md">
                <div className="font-text1 grid grid-cols-12 gap-4 items-start">
  
                  {/* Description */}
                  <div className="col-span-2">
                    <label className="block text-xs text-headertext1 mb-1">Description</label>
                    <input
                      type="text"
                      value={rule.description}
                      onChange={(e) => handleDescriptionChange(index, e.target.value)}
                      className="font-text1 w-full h-9 text-xs p-2 border rounded"
                    />
                  </div>
  
                  {/* Source IP */}
                  <div className="col-span-2">
                    <label className="block text-xs text-headertext1 mb-1">Source IP</label>
                    <input
                      type="text"
                      placeholder="0.0.0.0/0"
                      value={rule.sourceIp}
                      onChange={(e) => handleSourceIpChange(index, e.target.value)}
                      onBlur={() => handleSourceIpBlur(rule.sourceIp)}
                      className="font-text1 w-full h-9 text-xs p-2 border rounded"
                    />
                  </div>
  
                  {/* Common Ports */}
                  <div className="col-span-4">
                    <label className="text-xs text-headertext1 mb-1 flex items-center">
                      Common Ports
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_PORTS.map(({ name, port, desc }) => (
                        <div key={name} className="flex items-center space-x-2 relative group">
                          <input
                            type="checkbox"
                            checked={rule.commonPorts.includes(name)}
                            onChange={() => handlePortToggle(index, name)}
                            className="font-text1 bg-checkmark h-3 w-3"
                          />
                          <span className="text-xs">{name}</span>
  
                          {/* Tooltip Icon */}
                          <Info className="h-4 w-4 text-gray-500 cursor-pointer group-hover:text-gray-700" />
  
                          {/* Tooltip Box */}
                          <div className="absolute left-0 bottom-full mb-2 hidden w-64 p-2 bg-navbar1 text-navbartext1 text-xs rounded-md shadow-md group-hover:block">
                            <strong>Port {port}:</strong> {desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
  
                  {/* Custom Ports */}
                  <div className="col-span-3">
                    <label className="block text-xs text-headertext1 mb-1">Custom Ports</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder="5671, 8080"
                        value={rule.customPorts}
                        onChange={(e) => handleCustomPortsChange(index, e.target.value)}
                        className="font-text1 flex-grow h-9 text-xs p-2 border rounded"
                      />
  
                      {/* Drop Button */}
                      <div className="pl-2">
                        <button 
                          onClick={() => removeRule(index)} 
                          className="font-heading1 text-pagetext1 text-xs h-9 px-2 rounded hover:text-btnhover1 cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
  
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
              disabled={errors.length > 0 || isSaving}
              className="font-heading1 bg-btn1 text-mainbg1 font-semibold px-4 py-2 rounded-sm hover:bg-btnhover1 cursor-pointer flex items-center justify-center hover:shadow-[0_0_10px_#87d9da] transition-all duration-200"
            >
              {isSaving ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin border-2 border-t-2 border-white w-4 h-4 rounded-full mr-2"></div>
                  Saving...
                </span>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
  
}
