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
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    async function fetchRules() {
      setIsFetching(true);
      try {
        const { data } = await axios.get(`/api/instances/${instance?.name}/firewall?region=${instance?.region}`);
        setRules(data);
      } catch (error) {
        console.error("Error fetching rules:", error);
      } finally {
        setIsFetching(false);
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card rounded-md shadow-md mt-6 text-pagetext1">
      <h1 className="font-heading1 text-headertext1 text-2xl mb-10">Firewall Settings</h1>
  
      {isFetching && (
        <div className="text-black-700 p-3 rounded mb-4 text-center">
          <p>Fetching firewall rules...</p>
        </div>
      )}

      {errors.length > 0 && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {errors.map((error, i) => (
            <p key={i}>Error: {error}</p>
          ))}
        </div>
      )}
  
      <form onSubmit={(e) => e.preventDefault()}>
        <p className="font-text1 mb-6 text-sm">
          Enter source ip, with a netmask, and which ports should be opened for that source ip. Please note IPv6 is currently not supported.
          Ports not listed in the table below will be blocked. HTTPS needs to be open to allow access to the RabbitMQ Management Interface
        </p>
        <div className="space-y-4">
          {rules.map((rule, index) => (
            <div key={index} className="p-4 border rounded-md">
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
                    onChange={(e) => handleSourceIpChange(index, e.target.value)} // Update the value as the user types
                    onBlur={() => handleSourceIpBlur(rule.sourceIp)} // Validate when the user leaves the input
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
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="5671, 8080"
                      value={rule.customPorts}  // Bind to the rule's otherPorts field
                      onChange={(e) => handleCustomPortsChange(index, e.target.value)}
                      className="font-text1 w-full h-9 text-xs p-2 border rounded"
                    />
  
                    {/* Drop Button */}
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
          ))}
        </div>
  
        <div className="flex justify-between mt-4">
          <button
            onClick={addRule}
            className="font-heading1 bg-mainbg1 text-headertext1 px-4 py-2 rounded-sm hover:bg-mainbghover cursor-pointer"
          >
            + Add Additional Rule
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
      </form>
    </div>
  );
}
