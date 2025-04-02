// utils/fetchInstance.ts
import {
  EC2Client,
  DescribeInstancesCommand,
  Instance,
} from "@aws-sdk/client-ec2";

export async function fetchInstance(
  instanceName: string,
  ec2Client: EC2Client
): Promise<Instance | null> {
  const describeParams = {
    Filters: [
      {
        Name: "tag:Name",
        Values: [instanceName],
      },
      {
        Name: "tag:Publisher",
        Values: ["Rabbitory"],
      },
    ],
  };

  try {
    const command = new DescribeInstancesCommand(describeParams);
    const response = await ec2Client.send(command);

    if (
      !response.Reservations ||
      response.Reservations.length === 0 ||
      !response.Reservations[0].Instances ||
      response.Reservations[0].Instances.length === 0
    ) {
      return null;
    }

    return response.Reservations[0].Instances[0];
  } catch (error) {
    console.error("Error fetching instance:", error);
    return null;
  }
}
