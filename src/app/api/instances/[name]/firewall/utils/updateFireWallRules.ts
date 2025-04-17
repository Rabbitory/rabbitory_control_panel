import { getCurrentSecurityGroupRules } from "@/utils/AWS/Security-Groups/getCurrentSecurityGroupRules";
import { updateInstanceSGRules } from "@/utils/AWS/Security-Groups/updateInstanceSGRules";
import { updateRabbitmqPorts } from "@/utils/RabbitMQ/updateRabbitmqPorts";
import {
  convertToSecurityGroupRules,
  convertToUIFirewallRules,
  getSGRulesToAddAndRemove,
  getRabbitmqPortsToAddAndRemove,
} from "@/utils/AWS/Security-Groups/conversionsForSG";
import { UpdateFireWallRulesParams } from "../types";
import { FirewallRule } from "@/types/firewall";

export default async function updateFireWallRules({
  region,
  rules,
  instanceName,
}: UpdateFireWallRulesParams): Promise<FirewallRule[]> {
  const currentSGRules = await getCurrentSecurityGroupRules(
    instanceName,
    region
  );
  const newSGRules = convertToSecurityGroupRules(rules);
  const { rulesToAdd, rulesToRemove } = getSGRulesToAddAndRemove(
    currentSGRules,
    newSGRules
  );
  await updateInstanceSGRules(instanceName, region, rulesToAdd, rulesToRemove);

  const { portsToAdd, portsToRemove } = getRabbitmqPortsToAddAndRemove(
    rulesToAdd,
    rulesToRemove
  );
  await updateRabbitmqPorts(instanceName, region, portsToAdd, portsToRemove);

  const updatedSGRules = await getCurrentSecurityGroupRules(
    instanceName,
    region
  );
  const updatedUiFirewallRules = convertToUIFirewallRules(updatedSGRules);

  return updatedUiFirewallRules;
}
