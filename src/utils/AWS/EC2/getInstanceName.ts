import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

export async function getInstanceName(instanceId: string, region: string): Promise<string | null> {
  const ec2Client = new EC2Client({ region });

  try {
    const command = new DescribeInstancesCommand({
      InstanceIds: [instanceId],
    });

    const response = await ec2Client.send(command);

    const instance = response.Reservations?.[0]?.Instances?.[0];
    if (!instance) {
      return null;
    }

    const name = instance.Tags?.find(tag => tag.Key === "Name")?.Value || null;
    console.log("Instance name:", name);
    return name;
  } catch (error) {
    console.error("Error fetching instance name:", error);
    return null;
  }
}
