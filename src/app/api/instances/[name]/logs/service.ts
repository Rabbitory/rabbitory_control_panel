import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { runSSMCommands } from "@/utils/AWS/SSM/runSSMCommands";
import { EC2Client } from "@aws-sdk/client-ec2";
import { GetLogsParams } from "./types";

export async function getLogs({
  region,
  instanceName,
}: GetLogsParams): Promise<string> {
  const ec2Client = new EC2Client({ region });

  const instance = await fetchInstance(instanceName, ec2Client);

  if (!instance || !instance.InstanceId) {
    throw new Error(`No instance found with name: ${instanceName}`);
  }

  const instanceId = instance.InstanceId;
  const commands = ["journalctl -u rabbitmq-server.service -n 1000 --no-pager"];

  const logs = await runSSMCommands(instanceId, commands, region);
  return logs;
}
