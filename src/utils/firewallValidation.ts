import { COMMON_PORTS } from "./firewallConstants";

export const isValidDescription = (description: string): boolean => {
  if (!description) return true;

  const validCharsRegex = /^[a-zA-Z0-9 ._\-:/()#,@\[\]+=;{}!$*]+$/;
  if (description.length > 255 || !validCharsRegex.test(description)) {
    return false;
  }

  return true;
};

export const isValidSourceIp = (ip: string): boolean => {
  const cidrRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(3[0-2]|[12]?[0-9])$/;
  return cidrRegex.test(ip);
};

export const formatCustomPorts = (portsInput: string): number[] => {
  return portsInput
    .split(",")
    .map((port) => parseInt(port.trim(), 10))
    .filter((port) => !isNaN(port));
}

export const isInRangeCustomPort = (portsInput: string): boolean => {
  if (!portsInput.trim()) return true;
  const portsArray = formatCustomPorts(portsInput);

  for (let i = 0; i < portsArray.length; i += 1) {
    const port = portsArray[i];
    if (isNaN(port) || port < 1 || port > 65535) return false;
  }

  return true;
};

export const isInCommonPortsCustomPort = (portsInput: string): number | null => {
  if (!portsInput.trim()) return null;
  const portsArray = formatCustomPorts(portsInput);

  for (let i = 0; i < portsArray.length; i += 1) {
    const port = portsArray[i];
    if (COMMON_PORTS.some((commonPort) => commonPort.port === port)) {
      return port;
    } 
  }

  return null;
};