import { FirewallRule } from "@/types/firewall";

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

export const isValidIp = (ip: string): string | null => {
  const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip) ? null : "Invalid IP address format.";
};

export const isValidPort = (port: number, existingPorts: number[]): string | null => {
  if (isNaN(port) || port < 1 || port > 65535) {
    return "Port number must be between 1 and 65535.";
  }

  const isCommonPort = COMMON_RABBITMQ_PORTS.some((commonPort) => commonPort.port === port);
  if (isCommonPort) {
    return `Port ${port} is already listed as a common port.`;
  }

  if (existingPorts.includes(port)) {
    return `Port ${port} is already added.`;
  }

  return null;
};


export const validateFirewallRule = (rule: FirewallRule): string[] => {
  const errors: string[] = [];

  if (!rule.description.trim()) {
    errors.push("Description is required.");
  }

  const ipError = isValidIp(rule.sourceIp);
  if (ipError) errors.push(ipError);

  rule.otherPorts.forEach((port) => {
    const portError = isValidPort(port, rule.otherPorts);
    if (portError) errors.push(portError);
  });

  return errors;
};
