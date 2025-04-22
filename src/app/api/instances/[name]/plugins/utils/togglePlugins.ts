import { TogglePluginsParams } from "../types";
import { EC2Client } from "@aws-sdk/client-ec2";

import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { runSSMCommands } from "@/utils/AWS/SSM/runSSMCommands";

export default async function togglePlugins({
  region,
  updates,
  instanceName,
}: TogglePluginsParams): Promise<void> {
  const ec2Client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance || !instance.InstanceId) {
    throw new Error(`No instance found with name: ${instanceName}`);
  }
  const instanceId = instance.InstanceId;
  const commands = updates.map(
    ({ name, enabled }) =>
      `rabbitmq-plugins ${enabled ? "enable" : "disable"} ${name}`
  );

  commands.push("systemctl restart rabbitmq-server");

  await runSSMCommands(instanceId, commands, region);
}
