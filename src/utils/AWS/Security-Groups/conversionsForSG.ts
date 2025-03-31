import { IpPermission } from "@aws-sdk/client-ec2";
import { FirewallRule, SecurityGroupRule } from "@/types/firewall";
import { COMMON_PORTS } from "@/utils/firewallConstants";

const PORT_PROTOCOL_MAP: Record<number, string> = COMMON_PORTS.reduce((acc, { port, name }) => {
  acc[port] = name;
  return acc;
}, {} as Record<number, string>);

export function convertIpPermissionsToSecurityGroupRules(ipPermissions: IpPermission[]): SecurityGroupRule[] {
  if (!ipPermissions) {
    throw new Error("IpPermissions is undefined or empty.");
  }

  const hiddenPorts = [80, 22, 15672]; // Ports to hide

  return ipPermissions
    .filter(permission => 
      !(permission?.FromPort && permission?.ToPort && hiddenPorts.includes(permission.FromPort))
    ) // Exclude hidden ports
    .map((permission) => {
      if (permission?.FromPort === undefined || permission?.ToPort === undefined) {
        throw new Error("Missing required fields: FromPort or ToPort.");
      }

      const IpProtocol = permission?.IpProtocol ?? "tcp";

      if (IpProtocol === undefined) {
        throw new Error("Missing required field: IpProtocol.");
      }

      const IpRanges = (permission?.IpRanges || []).map((range) => {
        if (!range.CidrIp) {
          throw new Error("CidrIp is required in IpRange.");
        }
        return {
          CidrIp: range.CidrIp,
          Description: range.Description,
        };
      });

      return {
        IpProtocol,
        FromPort: permission.FromPort,
        ToPort: permission.ToPort,
        IpRanges,
      };
    });
}

export function convertToSecurityGroupRules(firewallRules: FirewallRule[]): SecurityGroupRule[] {
  const securityGroupRules: SecurityGroupRule[] = [];

  for (const rule of firewallRules) {
    const { description, commonPorts, customPorts } = rule;
    let { sourceIp } = rule;

    if (sourceIp === '') {
      sourceIp = '0.0.0.0/0';
    }

    const commonPortNumbers = commonPorts
      .map(protocol => {
        const portEntry = COMMON_PORTS.find(({ name }) => name === protocol);
        return portEntry ? portEntry.port : null;
      })
      .filter((port): port is number => port !== null); // Remove null values

    const customPortNumbers = customPorts
      .split(",")
      .map((port) => port.trim())
      .filter((port) => port !== "" && !isNaN(Number(port)))
      .map(Number);

    const allPorts = [...commonPortNumbers, ...customPortNumbers];

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

export function convertToUIFirewallRules(securityGroupRules: SecurityGroupRule[]): FirewallRule[] {
  const firewallMap: Record<
    string,
    { description: string; commonPorts: string[]; customPorts: string[] }
  > = {};

  for (const rule of securityGroupRules) {
    const sourceIp = rule.IpRanges[0].CidrIp;
    const description = rule.IpRanges[0].Description || "";
    const port = rule.FromPort;

    if (!firewallMap[sourceIp]) {
      firewallMap[sourceIp] = { description, commonPorts: [], customPorts: [] };
    }

    if (PORT_PROTOCOL_MAP[port]) {
      firewallMap[sourceIp].commonPorts.push(PORT_PROTOCOL_MAP[port]);
    } else {
      firewallMap[sourceIp].customPorts.push(port.toString());
    }
  }

  return Object.entries(firewallMap).map(([sourceIp, { description, commonPorts, customPorts }]) => ({
    sourceIp,
    description,
    commonPorts,
    customPorts: customPorts.join(", "), 
  }));
}

export function getRulesToAddAndRemove(
  oldRules: SecurityGroupRule[], 
  newRules: SecurityGroupRule[]
) {
  const isSameRule = (rule1: SecurityGroupRule, rule2: SecurityGroupRule) => {
    return (
      rule1.IpProtocol === rule2.IpProtocol &&
      rule1.FromPort === rule2.FromPort &&
      rule1.ToPort === rule2.ToPort &&
      rule1.IpRanges.length === rule2.IpRanges.length &&
      rule1.IpRanges.every((range, index) => 
        range.CidrIp === rule2.IpRanges[index].CidrIp &&
        (range.Description ?? "") === (rule2.IpRanges[index].Description ?? "")
      )
    );
  };

  const rulesToAdd = newRules.filter(newRule => 
    !oldRules.some(oldRule => isSameRule(newRule, oldRule))
  );

  const rulesToRemove = oldRules.filter(oldRule => 
    !newRules.some(newRule => isSameRule(oldRule, newRule))
  );

  return {
    rulesToAdd,
    rulesToRemove
  };
}