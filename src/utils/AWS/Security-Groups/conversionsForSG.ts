import { IpPermission } from "@aws-sdk/client-ec2"; // Assuming you are importing this from AWS SDK
import { FirewallRule, SecurityGroupRule } from "@/types/firewall";

const PORT_SERVICE_MAP: Record<number, string> = {
  5672: "AMQP",
  1883: "MQTT",
  8883: "MQTTS",
  61613: "STOMP",
  61614: "STOMPS",
  443: "HTTPS",
  15674: "STOMP_WS",
  15675: "STOMP_SSL",
  15692: "STREAM",
  15693: "STREAM_SSL",
  5671: "AMQPS",
};

export function convertIpPermissionsToSecurityGroupRules(ipPermissions: IpPermission[]): SecurityGroupRule[] {
  if (!ipPermissions) {
    throw new Error("IpPermissions is undefined or empty.");
  }

  const sgRules = ipPermissions.map((permission) => {
    if (permission?.FromPort === undefined || permission?.ToPort === undefined) {
      throw new Error("Missing required fields: FromPort or ToPort.");
    }

    // If IpProtocol is missing, default to "tcp"
    const IpProtocol = permission?.IpProtocol ?? "tcp";

    // Check if IpProtocol is undefined, and throw error if necessary
    if (IpProtocol === undefined) {
      throw new Error("Missing required field: IpProtocol.");
    }

    // Ensure IpRanges have valid CidrIp (string)
    const IpRanges = (permission?.IpRanges || []).map((range) => {
      if (!range.CidrIp) {
        throw new Error("CidrIp is required in IpRange.");
      }
      return {
        CidrIp: range.CidrIp, // Make sure CidrIp is a string
        Description: range.Description, // Optional field
      };
    });

    return {
      IpProtocol,
      FromPort: permission?.FromPort,
      ToPort: permission?.ToPort,
      IpRanges,
    };
  });

  return sgRules;
}

export function convertToSecurityGroupRules(firewallRules: FirewallRule[]): SecurityGroupRule[] {
  const securityGroupRules: SecurityGroupRule[] = [];

  for (const rule of firewallRules) {
    const { sourceIp, description, commonPorts, customPorts } = rule;
    const customPortArray = customPorts
        .split(",")
        .map((port) => port.trim())
        .filter((port) => !isNaN(Number(port)));

    const allPorts = [
      ...commonPorts.map((service) =>
        Object.keys(PORT_SERVICE_MAP).find((port) => PORT_SERVICE_MAP[Number(port)] === service)
      ).map(Number), // Convert service names back to port numbers
      ...customPortArray.map(Number), // Convert custom ports to numbers
    ].filter((port) => !isNaN(port)); // Remove any undefined or invalid ports

    for (const port of allPorts) {
      securityGroupRules.push({
        IpProtocol: "tcp",
        FromPort: port,
        ToPort: port,
        IpRanges: [{ CidrIp: sourceIp, Description: description }],
      });
    }
  }

  return securityGroupRules;
}

// export function convertToUIFirewallRules(securityGroupRules: SecurityGroupRule[]): FirewallRule[] {
//   const firewallMap: Record<
//     string,
//     { description: string; commonPorts: string[]; customPorts: number[] }
//   > = {};

//   for (const rule of securityGroupRules) {
//     const sourceIp = rule.IpRanges[0].CidrIp;
//     const description = rule.IpRanges[0].Description || "";
//     const port = rule.FromPort;

//     if (!firewallMap[sourceIp]) {
//       firewallMap[sourceIp] = { description, commonPorts: [], customPorts: [] };
//     }

//     if (PORT_SERVICE_MAP[port]) {
//       firewallMap[sourceIp].commonPorts.push(PORT_SERVICE_MAP[port]);
//     } else {
//       firewallMap[sourceIp].customPorts.push(port);
//     }
//   }

//   return Object.entries(firewallMap).map(([sourceIp, { description, commonPorts, customPorts }]) => ({
//     sourceIp,
//     description,
//     commonPorts,
//     customPorts: customPorts.join(", "),
//   }));
// }

export function convertToUIFirewallRules(securityGroupRules: SecurityGroupRule[]): FirewallRule[] {
  const firewallMap: Record<
    string,
    { description: string; commonPorts: string[]; customPorts: string[] }
  > = {};

  const hiddenPorts = [80, 22, 15672]; // Ports to hide

  for (const rule of securityGroupRules) {
    const sourceIp = rule.IpRanges[0].CidrIp;
    const description = rule.IpRanges[0].Description || "";
    const port = rule.FromPort;

    if (!firewallMap[sourceIp]) {
      firewallMap[sourceIp] = { description, commonPorts: [], customPorts: [] };
    }

    if (PORT_SERVICE_MAP[port]) {
      firewallMap[sourceIp].commonPorts.push(PORT_SERVICE_MAP[port]);
    } else {
      if (!hiddenPorts.includes(port)) {
        firewallMap[sourceIp].customPorts.push(port.toString());
      }
    }
  }


  return Object.entries(firewallMap).map(([sourceIp, { description, commonPorts, customPorts }]) => ({
    sourceIp,
    description,
    commonPorts,
    customPorts: customPorts.join(", "), 
  }));
}

