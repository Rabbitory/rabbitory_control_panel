import { PluginList, GetPluginsParams, TogglePluginsParams } from "./types";
import { EC2Client } from "@aws-sdk/client-ec2";
import { fetchWithRetry } from "@/utils/fetchWithRetry";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { runSSMCommands } from "@/utils/AWS/SSM/runSSMCommands";
export async function getPlugins({
  instanceName,
  region,
  username,
  password,
}: GetPluginsParams): Promise<PluginList> {
  const ec2Client = new EC2Client({ region });

  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance || !instance.PublicDnsName) {
    throw new Error(`No instance found with name: ${instanceName}`);
  }
  const publicDns = instance.PublicDnsName;
  const rabbitUrl = `http://${publicDns}:15672/api/nodes`;
  const response = await fetchWithRetry(rabbitUrl, {
    auth: {
      username,
      password,
    },
  });

  if (!response || !response.data || response.data.length === 0) {
    throw new Error("No response from RabbitMQ API");
  }

  return response.data[0].enabled_plugins || [];
}

export async function togglePlugins({
  region,
  pluginName,
  enabled,
  instanceName,
}: TogglePluginsParams): Promise<void> {
  const ec2Client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance || !instance.InstanceId) {
    throw new Error(`No instance found with name: ${instanceName}`);
  }
  const instanceId = instance.InstanceId;
  const commands: string[] = [];
  if (enabled) {
    commands.push(`rabbitmq-plugins enable ${pluginName}`);
  } else {
    commands.push(`rabbitmq-plugins disable ${pluginName}`);
  }

  commands.push("systemctl restart rabbitmq-server");

  await runSSMCommands(instanceId, commands, region);
}
