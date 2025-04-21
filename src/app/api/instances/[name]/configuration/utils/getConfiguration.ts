import { EC2Client } from "@aws-sdk/client-ec2";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { runSSMCommands } from "@/utils/AWS/SSM/runSSMCommands";
import { GetConfigurationParams, Config } from "../types";
import { parseConfig } from "./utils";

export default async function getConfiguration({
  region,
  instanceName,
}: GetConfigurationParams): Promise<Config> {
  const ec2Client = new EC2Client({ region });

  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance || !instance.InstanceId) {
    throw new Error(`Instance not found: ${instanceName}`);
  }
  const instanceId = instance.InstanceId;

  // Run a command to fetch the configuration file.
  const fileContent = await runSSMCommands(
    instanceId,
    ["cat /etc/rabbitmq/rabbitmq.conf"],
    region
  );

  const config: Config = {};
  parseConfig(config, fileContent);

  return config;
}
