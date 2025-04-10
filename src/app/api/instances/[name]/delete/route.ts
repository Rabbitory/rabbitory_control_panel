import { Instance, EC2Client } from "@aws-sdk/client-ec2";
import { NextRequest, NextResponse } from "next/server";
import { deleteBroker } from "@/utils/AWS/EC2/deleteBrokerInstance";
import { deleteFromDynamoDB } from "@/utils/dynamoDBUtils";
import { deleteSecurityGroup } from "@/utils/AWS/EC2/deleteSecurityGroup";
import eventEmitter from "@/utils/eventEmitter";
import { deleteEvent } from "@/utils/eventBackups";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";

async function deleteInstance(
  instanceId: string,
  groupName: string,
  ec2Client: EC2Client,
  instanceName: string
) {
  try {
    await deleteBroker(instanceId, ec2Client);
    await deleteSecurityGroup(groupName, ec2Client);
    await deleteFromDynamoDB("rabbitory-instances-metadata", {
      instanceId: { S: instanceId },
    });

    eventEmitter.emit("notification", {
      message: `${instanceName} has been deleted`,
      type: "deleteInstance",
      status: "success",
      instanceName,
    });

    deleteEvent(instanceName, "deleteInstance");
  } catch (error) {
    console.error(error);
    eventEmitter.emit("notification", {
      message: `${instanceName} could not be deleted`,
      type: "deleteInstance",
      status: "error",
      instanceName,
    });
    deleteEvent(instanceName, "deleteInstance");
  }
}

export async function POST(request: NextRequest) {
  const { instanceId, instanceName, region } = await request.json();

  if (!region || !instanceId || !instanceName) {
    return NextResponse.json(
      { message: "Region parameter is missing" },
      { status: 400 }
    );
  }

  const ec2Client = new EC2Client({ region });

  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance) {
    return NextResponse.json(
      { message: `Instance not found: ${instanceName}` },
      { status: 404 }
    );
  }

  const groupName = await getGroupName(instance);
  if (groupName === undefined) {
    return NextResponse.json(
      { message: `No security group found for instance: ${instanceName}` },
      { status: 404 }
    );
  }

  deleteInstance(instanceId, groupName, ec2Client, instanceName);

  return NextResponse.json(
    { message: `Initiated deletion for ${instanceName}` },
    { status: 202 }
  );
}

const getGroupName = async (instance: Instance) => {
  const id = instance.InstanceId;
  const securityGroups = instance.SecurityGroups
    ? instance.SecurityGroups[0]
    : null;
  if (!securityGroups) {
    throw new Error(`No security groups found for instance ${id}`);
  }
  const groupId = securityGroups.GroupId;
  if (!groupId) {
    throw new Error(`No group ID found for security group of instance ${id}`);
  }

  return groupId;
};
