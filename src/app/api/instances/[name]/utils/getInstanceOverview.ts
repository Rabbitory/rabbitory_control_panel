import { EC2Client } from "@aws-sdk/client-ec2";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { fetchFromDynamoDB } from "@/utils/dynamoDBUtils";
import { decrypt } from "@/utils/encrypt";

interface GetInstanceOverviewParams {
  region: string;
  instanceName: string;
}
export default async function getInstanceOverview({
  region,
  instanceName,
}: GetInstanceOverviewParams) {
  const ec2Client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance || !instance.InstanceId) {
    throw new Error(`No instance found with name: ${instanceName}`);
  }

  const response = await fetchFromDynamoDB("rabbitory-instances-metadata", {
    instanceId: instance.InstanceId,
  });

  if (!response) {
    throw new Error("Credentials are not ready yet! Try again later!");
  }

  const encryptedUsername = response.Item?.encryptedUsername;
  const encryptedPassword = response.Item?.encryptedPassword;

  if (!encryptedUsername || !encryptedPassword) {
    throw new Error("No credentials found for this instance");
  }
  const username = decrypt(encryptedUsername);
  const password = decrypt(encryptedPassword);

  const endpointUrl = `amqp://${username}:${password}@${
    instance.PublicDnsName || instance.PublicIpAddress
  }:5672`;

  const formattedInstance = {
    id: instance.InstanceId,
    name: instance.Tags?.find((tag) => tag.Key === "Name")?.Value || "No name",
    type: instance.InstanceType,
    publicDns: instance.PublicDnsName || "N/A",
    launchTime: instance.LaunchTime,
    region: instance.Placement?.AvailabilityZone?.slice(0, -1),
    user: username,
    password: password,
    endpointUrl,
    port: 5672,
    state: instance.State?.Name,
    EBSVolumeId: instance.BlockDeviceMappings?.[0].Ebs?.VolumeId || "N/A",
  };

  return formattedInstance;
}
