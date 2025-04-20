import { PluginList, GetPluginsParams } from "../types";
import { EC2Client } from "@aws-sdk/client-ec2";
import { fetchWithRetry } from "@/utils/fetchWithRetry";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";

export default async function getPlugins({
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
