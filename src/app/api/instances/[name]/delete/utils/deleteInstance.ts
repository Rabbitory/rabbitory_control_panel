import { EC2Client } from "@aws-sdk/client-ec2";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { getGroupName } from "./utils";
import { deleteBroker } from "@/utils/AWS/EC2/deleteBrokerInstance";
import { deleteFromDynamoDB } from "@/utils/dynamoDBUtils";
import { deleteSecurityGroup } from "@/utils/AWS/EC2/deleteSecurityGroup";
import eventEmitter from "@/utils/eventEmitter";
import { deleteEvent } from "@/utils/eventBackups";

interface DeleteInstanceParams {
  region: string;
  instanceName: string;
}

export default async function deleteInstance({
  region,
  instanceName,
}: DeleteInstanceParams): Promise<void> {
  const ec2Client = new EC2Client({ region });

  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance || !instance.InstanceId) {
    throw new Error(`Instance not found: ${instanceName}`);
  }

  const groupName = getGroupName(instance);
  if (groupName === undefined) {
    throw new Error(`No security group found for instance: ${instanceName}`);
  }
  const instanceId = instance.InstanceId;
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
