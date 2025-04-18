import { EC2Client } from "@aws-sdk/client-ec2";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { appendBackupDefinition } from "@/utils/dynamoDBUtils";
import { getDefinitions } from "@/utils/RabbitMQ/backupDefinitions";
import { AddBackupsParams } from "../types";

export default async function addBackups({
  region,
  username,
  password,
  instanceName,
}: AddBackupsParams) {
  const ec2Client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance || !instance.InstanceId || !instance.PublicDnsName) {
    throw new Error(`Instance not found: ${instanceName}`);
  }

  const definitions = await getDefinitions(
    instance.PublicDnsName,
    username,
    password,
    "manual"
  );
  if (!definitions) {
    throw new Error("No definitions found for this instance");
  }

  const response = await appendBackupDefinition(
    instance.InstanceId,
    definitions
  );

  return response.Attributes?.backups;
}
