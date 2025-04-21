import { EC2Client } from "@aws-sdk/client-ec2";

import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { runSSMCommands } from "@/utils/AWS/SSM/runSSMCommands";
import { UpdateConfigurationParams, Config } from "../types";
import { parseConfig } from "./utils";

export default async function updateConfiguration({
  region,
  newConfig,
  instanceName,
}: UpdateConfigurationParams): Promise<Config> {
  const ec2Client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance) {
    throw new Error(`Instance not found: ${instanceName}`);
  }
  const instanceId = instance.InstanceId;

  const commands: string[] = [];
  for (const [key, value] of Object.entries(newConfig)) {
    if (value !== "") {
      commands.push(
        `sudo sed -i '/^${key}[[:space:]]*=.*/c\\${key} = ${value}' /etc/rabbitmq/rabbitmq.conf`
      );
    }
  }

  commands.push("sudo systemctl restart rabbitmq-server");
  commands.push("echo __CONFIG_START__");
  commands.push("cat /etc/rabbitmq/rabbitmq.conf");

  const output = await runSSMCommands(instanceId!, commands, region);
  const parts = output.split("__CONFIG_START__");
  const configData = parts.length > 1 ? parts[1] : output;
  const config: Config = {};
  parseConfig(config, configData);
  return config;
}
