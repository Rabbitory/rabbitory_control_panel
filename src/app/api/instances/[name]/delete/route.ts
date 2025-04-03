import { Instance, EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { NextRequest, NextResponse } from "next/server";
import { deleteBroker } from "@/utils/AWS/EC2/deleteBrokerInstance";
import { deleteFromDynamoDB } from "@/utils/dynamoDBUtils";
import { deleteSecurityGroup } from "@/utils/AWS/EC2/deleteSecurityGroup";

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

  await deleteBroker(instanceId, ec2Client);
  await deleteSecurityGroup(groupName, ec2Client);
  await deleteFromDynamoDB("RabbitoryInstancesMetadata", {
    instanceId: { S: instanceId },
  });
  return NextResponse.json(
    { message: `Successfully deleted instance: ${name}` },
    { status: 200 },
  );
}

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
