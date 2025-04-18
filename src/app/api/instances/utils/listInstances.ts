import {
  EC2Client,
  DescribeInstancesCommand,
  DescribeInstancesCommandOutput,
} from "@aws-sdk/client-ec2";

import { getEC2Regions } from "@/utils/AWS/EC2/getEC2Regions";

import type { InstanceWithRegion } from "../types";

export default async function listInstances(): Promise<InstanceWithRegion[]> {
  const params = {
    Filters: [
      {
        Name: "tag:Publisher",
        Values: ["Rabbitory"],
      },
      {
        Name: "instance-state-name",
        Values: ["pending", "running", "stopping", "stopped", "shutting-down"],
      },
    ],
  };

  const regions = await getEC2Regions();
  if (!regions || regions.length === 0) {
    throw new Error("No regions found");
  }

  const command = new DescribeInstancesCommand(params);

  const instancePromises: Promise<InstanceWithRegion[]>[] = regions.map(
    async (region) => {
      const ec2Client = new EC2Client({ region });
      try {
        const response = (await ec2Client.send(
          command
        )) as DescribeInstancesCommandOutput;

        const regionInstances: InstanceWithRegion[] =
          response.Reservations?.flatMap(
            (reservation) =>
              reservation.Instances?.map((instance) => ({
                ...instance,
                region: region!,
              })) ?? []
          ) ?? [];

        return regionInstances;
      } catch (error) {
        console.error(`Error querying region ${region}:`, error);
        return [];
      }
    }
  );

  const instances: InstanceWithRegion[] = (
    await Promise.all(instancePromises)
  ).flat();

  return instances;
}
