import { EC2Client } from "@aws-sdk/client-ec2";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { fetchFromDynamoDB } from "@/utils/dynamoDBUtils";
import { GetBackupsParams } from "../../backups/types";

export default async function getBackups({
  region,
  instanceName,
}: GetBackupsParams) {
  const client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, client);

  if (!instance || !instance.InstanceId) {
    throw new Error(`Instance not found: ${instanceName}`);
  }

  const response = await fetchFromDynamoDB("rabbitory-instances-metadata", {
    instanceId: instance.InstanceId,
  });

  return response.Item?.alarms;
}
