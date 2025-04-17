import {
  EC2Client,
  DescribeInstancesCommand,
  DescribeInstancesCommandOutput,
  _InstanceType,
} from "@aws-sdk/client-ec2";

import { getEC2Regions } from "@/utils/AWS/EC2/getEC2Regions";

import type { InstanceWithRegion } from "./types";

export async function listInstances() {
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

export function formattedInstances(instances: InstanceWithRegion[]) {
  return instances
    .map((instance) => {
      if (!instance || !instance.Tags) {
        console.error("Instance or tags not found");
        return null;
      }
      const name = instance.Tags.find((tag) => tag.Key === "Name")?.Value || "";
      return {
        name,
        id: instance.InstanceId,
        region: instance.region,
        state: instance.State?.Name,
      };
    })
    .filter(Boolean);
}
