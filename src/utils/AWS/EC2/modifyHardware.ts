import {
  EC2Client,
  StopInstancesCommand,
  waitUntilInstanceStopped,
  ModifyInstanceAttributeCommand,
  StartInstancesCommand,
  waitUntilInstanceRunning,
  _InstanceType,
} from "@aws-sdk/client-ec2";
import eventEmitter from "@/utils/eventEmitter";
import { deleteEvent } from "@/utils/eventBackups";

export async function modifyHardware(
  instanceId: string,
  instanceType: _InstanceType,
  region: string,
  instanceName: string,
) {
  const client = new EC2Client({ region });

  try {
    await client.send(new StopInstancesCommand({ InstanceIds: [instanceId] }));

    await waitUntilInstanceStopped(
      { client, maxWaitTime: 300 },
      { InstanceIds: [instanceId] },
    );

    await client.send(
      new ModifyInstanceAttributeCommand({
        InstanceId: instanceId,
        InstanceType: { Value: instanceType },
      }),
    );

    await client.send(new StartInstancesCommand({ InstanceIds: [instanceId] }));

    await waitUntilInstanceRunning(
      { client, maxWaitTime: 300 },
      { InstanceIds: [instanceId] },
    );

    eventEmitter.emit("notification", {
      message: `Instance ${instanceId} successfully updated to ${instanceType}.`,
      type: "instanceType",
      status: "success",
      instanceName,
    });

    deleteEvent(instanceName, "instanceType");

    return {
      success: `Instance ${instanceId} successfully updated to ${instanceType}.`,
    };
  } catch (error) {
    console.error(error);
    return {
      error: `Failed to update instance ${instanceId} to ${instanceType}.`,
    };
  }
}
