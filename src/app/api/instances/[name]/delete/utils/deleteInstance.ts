import { deleteBroker } from "@/utils/AWS/EC2/deleteBrokerInstance";
import { deleteFromDynamoDB } from "@/utils/dynamoDBUtils";
import { deleteSecurityGroup } from "@/utils/AWS/EC2/deleteSecurityGroup";
import eventEmitter from "@/utils/eventEmitter";
import { deleteEvent } from "@/utils/eventBackups";
import { DeleteInstanceParams } from "../types";

export default async function deleteInstance({
  instanceId,
  groupName,
  ec2Client,
  instanceName,
}: DeleteInstanceParams): Promise<void> {
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
