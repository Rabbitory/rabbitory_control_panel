import { Instance, EC2Client, } from "@aws-sdk/client-ec2";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { NextRequest, NextResponse } from "next/server";
import { deleteBroker } from "@/utils/AWS/EC2/deleteBrokerInstance";
import { deleteFromDynamoDB } from "@/utils/dynamoDBUtils";
import { deleteSecurityGroup } from "@/utils/AWS/EC2/deleteSecurityGroup";

const getGroupName = async (instance: Instance) => {
  const id = instance.InstanceId;
  const securityGroups = instance.SecurityGroups ? instance.SecurityGroups[0] : null;
  if (!securityGroups) {
    throw new Error(`No security groups found for instance ${id}`);
  }
  const groupId = securityGroups.GroupId;
  if (!groupId) {
    throw new Error(`No group ID found for security group of instance ${id}`);
  }

  return groupId;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");

  if (!region) {
    return NextResponse.json(
      { message: "Region parameter is missing" },
      { status: 400 },
    );
  }

  const ec2Client = new EC2Client({ region });

  const instance = await fetchInstance(name, ec2Client);
  if (!instance) {
    return NextResponse.json(
      { message: `No instance found with name: ${name}` },
      { status: 404 },
    );
  }

  const instanceId = instance?.InstanceId;
  if (instanceId === undefined) {
    return NextResponse.json(
      { message: `Error getting instance ID for instance: ${name}` },
      { status: 404 },
    );
  }

  const groupName = await getGroupName(instance);
  if (groupName === undefined) {
    return NextResponse.json(
      { message: `No security group found for instance: ${name}` },
      { status: 404 },
    );
  }

  // Return the response to the client immediately
  try {
    // Start the instance termination but don't block the response
    await deleteBroker(instanceId, ec2Client);

    // Send immediate response indicating the deletion process has started
    const response = NextResponse.json(
      { message: `Deletion of instance ${name} started. It will be shutting down soon.` },
      { status: 202 }, // 202 Accepted to indicate the request is accepted, but the deletion is ongoing
    );

    // Offload the background tasks to a promise chain that doesn't block the response
    Promise.resolve().then(() => {
      // Perform deletion of the security group and DynamoDB record asynchronously
      deleteSecurityGroup(groupName, ec2Client).catch(console.error);
      deleteFromDynamoDB("rabbitory-instances-metadata", {
        instanceId: { S: instanceId },
      }).catch(console.error);
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { message: `Error starting deletion for instance: ${name}, ${err}` },
      { status: 500 },
    );
  }
}