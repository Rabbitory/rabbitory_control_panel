import { EC2Client, RebootInstancesCommand } from "@aws-sdk/client-ec2";

export async function rebootInstance(instanceId: string, region: string) {
  const client = new EC2Client({ region });

  try {
    await client.send(
      new RebootInstancesCommand({
        InstanceIds: [instanceId],
      }),
    );

    return true;
  } catch (error) {
    console.error("Error rebooting instance:", error);
    return false;
  }
}
