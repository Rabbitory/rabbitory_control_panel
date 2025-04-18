import {
  EC2Client,
  RebootInstancesCommand,
  waitUntilInstanceRunning,
} from "@aws-sdk/client-ec2";

export async function rebootInstance(instanceId: string, region: string) {
  const client = new EC2Client({ region });

  try {
    await client.send(
      new RebootInstancesCommand({
        InstanceIds: [instanceId],
      })
    );

    await waitUntilInstanceRunning(
      { client, maxWaitTime: 500 },
      { InstanceIds: [instanceId] }
    );

    return true;
  } catch (error) {
    console.error("Error rebooting instance:", error);
    throw new Error("Failed to reboot instance");
  }
}
