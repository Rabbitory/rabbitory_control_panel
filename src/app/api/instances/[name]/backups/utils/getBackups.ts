import { EC2Client } from "@aws-sdk/client-ec2";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";

import { fetchFromDynamoDB } from "@/utils/dynamoDBUtils";
import { GetBackupsParams } from "../types";
export default async function getBackups({
  region,
  instanceName,
}: GetBackupsParams) {
  const ec2Client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance || !instance.InstanceId) {
    throw new Error(`Instance not found: ${instanceName}`);
  }

  const response = await fetchFromDynamoDB("rabbitory-instances-metadata", {
    instanceId: instance.InstanceId,
  });

  if (!response) {
    throw new Error("Credentials are not ready yet! Try again later!");
  }
  const definitions = response.Item?.backups;
  if (!definitions) {
    throw new Error("No definitions found for this instance");
  }

  return definitions;
}
