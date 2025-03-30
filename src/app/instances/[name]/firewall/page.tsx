'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import React from "react";
import { FirewallRule } from "@/types/firewall";
import { Info } from "lucide-react";
import { isValidIp, isValidPort, validateFirewallRule } from "@/utils/firewallValidation";


interface Params {
  name: string;
}
interface FirewallPageProps {
  params: Promise<Params>;
}

const COMMON_PORTS = [
  { name: "AMQP", port: 5672, desc: "Used for messaging between applications." },
  { name: "AMQPS", port: 5671, desc: "Secure version of AMQP." },
  { name: "MQTT", port: 1883, desc: "Lightweight messaging protocol for IoT." },
  { name: "MQTTS", port: 8883, desc: "Secure version of MQTT." },
  { name: "STOMP", port: 61614, desc: "Protocol for simple message queuing." },
  { name: "STOMPS", port: 61613, desc: "Text-oriented messaging protocol." },
  { name: "HTTPS", port: 443, desc: "Required for RabbitMQ Management UI." },
  { name: "STREAM", port: 5552, desc: "Data streaming protocol." },
  { name: "STREAM_SSL", port: 5551, desc: "SSL-secured streaming." },
];

export default function FirewallPage({ params }: FirewallPageProps) {
  const { name } = React.use(params);
  const [rules, setRules] = useState<FirewallRule[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    async function fetchRules() {
      setIsFetching(true);
      try {
        const { data } = await axios.get(`/api/instances/${name}/firewall`);
        setRules(data);
      } catch (error) {
        console.error("Error fetching rules:", error);
      } finally {
        setIsFetching(false);
      }
    }
    fetchRules();
  }, [name]);

  const handleInputChange = <K extends keyof FirewallRule>(
    index: number,
    field: K,
    value: FirewallRule[K]
  ) => {
    setRules((prevRules) => {
      const updatedRules = [...prevRules];
      updatedRules[index] = { ...updatedRules[index], [field]: value };
      return updatedRules;
    });
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
  
  

  const handleOtherPortsChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedRules = [...rules];
    const parsePorts = (portsString: string) => {
      return portsString
        .split(",")
        .map((port) => parseInt(port.trim(), 10))
        .filter((port) => !isNaN(port));
    };
    const value = event.target.value;
    const parsedPorts = value ? parsePorts(value) : [];
    updatedRules[index].otherPorts = parsedPorts;
    setRules(updatedRules);
  };

  const addRule = () => {
    setRules([
      ...rules,
      { description: "", sourceIp: "", commonPorts: [], otherPorts: [] },
    ]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_rule, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post(`/api/instances/${name}/firewall`, { rules });
      alert("Firewall rules updated successfully!");
    } catch (error) {
      console.error("Error saving rules:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">Firewall Settings</h2>
  
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
        <div className="space-y-4">
          {rules.map((rule, index) => (
            <div key={index} className="p-4 border rounded-md">
              <div className="grid grid-cols-12 gap-4 items-start">
  
                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Description</label>
                  <input
                    type="text"
                    value={rule.description}
                    onChange={(e) => handleInputChange(index, "description", e.target.value)}
                    className="w-full h-9 text-sm p-2 border rounded"
                  />
                </div>
  
                {/* Source IP */}
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Source IP</label>
                  <input
                    type="text"
                    value={rule.sourceIp}
                    onChange={(e) => handleInputChange(index, "sourceIp", e.target.value)}
                    className="w-full h-9 text-sm p-2 border rounded"
                  />
                </div>
  
                {/* Common Ports */}
                <div className="col-span-4">
                  <label className="text-xs text-gray-600 mb-1 flex items-center">
                    Common Ports
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_PORTS.map(({ name, port, desc }) => (
                      <div key={name} className="flex items-center space-x-2 relative group">
                        <input
                          type="checkbox"
                          checked={rule.commonPorts.includes(name)}
                          onChange={() => handlePortToggle(index, name)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">{name}</span>
  
                        {/* Tooltip Icon */}
                        <Info className="h-4 w-4 text-gray-500 cursor-pointer group-hover:text-gray-700" />
  
                        {/* Tooltip Box */}
                        <div className="absolute left-0 bottom-full mb-2 hidden w-64 p-2 bg-black text-white text-xs rounded-md shadow-md group-hover:block">
                          <strong>Port {port}:</strong> {desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
  
                {/* Other Ports */}
                <div className="col-span-3">
                  <label className="block text-xs text-gray-600 mb-1">Other Ports</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="5671, 5672"
                      value={rule.otherPorts.join(", ")}
                      onChange={(e) => handleOtherPortsChange(index, e)}
                      className="w-full h-9 text-sm p-2 border rounded"
                    />
  
                    {/* Drop Button */}
                    <button 
                      onClick={() => removeRule(index)} 
                      className="bg-gray-300 text-gray-800 h-9 px-3 rounded hover:opacity-80 cursor-pointer"
                    >
                      Drop
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
  
        {/* Add Additional Rule Button */}
        <div className="flex justify-between mt-4">
          <button
            onClick={addRule}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:opacity-80 cursor-pointer"
          >
            Add Additional Rule
          </button>
  
          {/* Save Button */}
          <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded hover:opacity-80 cursor-pointer">
            Save
          </button>
        </div>
      </form>
    </div>
  );  
}
