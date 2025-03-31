import { EC2Client } from "@aws-sdk/client-ec2";
import { NextResponse } from "next/server";
import { fetchFromDynamoDB } from "@/utils/dynamoDBUtils";
import { decrypt } from "@/utils/encrypt";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstace";

const ec2Client = new EC2Client({ region: process.env.REGION });

// Use NextRequest type and properly handle params
export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name: instanceName } = await params;
  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance || !instance.InstanceId) {
    return NextResponse.json(
      { message: `No instance found with name: ${instanceName}` },
      { status: 404 }
    );
  }
  try {
    const response = await fetchFromDynamoDB("RabbitoryInstancesMetadata", {
      instanceId: instance.InstanceId,
    });

    if (!response) {
      return NextResponse.json(
        { message: "Credentials are not ready yet! Try again later!" },
        { status: 503 }
      );
    }
    // Decrypt the credentials
    const encryptedUsername = response.Item?.encryptedUsername;
    const encryptedPassword = response.Item?.encryptedPassword;

    if (!encryptedUsername || !encryptedPassword) {
      return NextResponse.json(
        { message: "No credentials found for this instance" },
        { status: 404 }
      );
    }
    const username = decrypt(encryptedUsername);
    const password = decrypt(encryptedPassword);

    const endpointUrl = `amqp://${username}:${password}@${
      instance.PublicDnsName || instance.PublicIpAddress
    }:5672`;
    // Format the instance data
    const formattedInstance = {
      id: instance.InstanceId,
      name:
        instance.Tags?.find((tag) => tag.Key === "Name")?.Value || "No name",
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

    return NextResponse.json(formattedInstance);
  } catch (error) {
    console.error("Error fetching instance details:", error);
    return NextResponse.json(
      { message: "Error fetching instance details", error: String(error) },
      { status: 500 }
    );
  }
}
