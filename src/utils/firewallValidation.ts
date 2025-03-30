const COMMON_RABBITMQ_PORTS = [
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
    if (COMMON_RABBITMQ_PORTS.some((commonPort) => commonPort.port === port)) {
      return port;
    } 
  }

  return null;
};