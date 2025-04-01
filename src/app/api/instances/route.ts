import {
  EC2Client,
  DescribeInstancesCommand,
  DescribeInstancesCommandOutput,
  Instance,
} from "@aws-sdk/client-ec2";
import { NextRequest, NextResponse } from "next/server";
import { pollRabbitMQServerStatus } from "@/utils/RabbitMQ/serverStatus";
import createInstance from "@/utils/AWS/EC2/createBrokerInstance";
import { getEC2Regions } from "@/utils/AWS/EC2/getEC2Regions";

// Define an interface that extends the AWS Instance with a non-optional region.
export interface InstanceWithRegion extends Instance {
  region: string;
}

export const GET = async () => {
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
    return new NextResponse("No regions found", { status: 404 });
  }

  const command = new DescribeInstancesCommand(params);

  // Build promises that return a list of Region-annotated instances.
  const instancePromises: Promise<InstanceWithRegion[]>[] = regions.map(
    async (region) => {
      const ec2Client = new EC2Client({ region });
      try {
        const response = (await ec2Client.send(
          command
        )) as DescribeInstancesCommandOutput;

        // Create a new array with the region attached for each instance.
        const regionInstances: InstanceWithRegion[] =
          response.Reservations?.flatMap(
            (reservation) =>
              reservation.Instances?.map((instance) => ({
                ...instance,
                region: region!, // Assert that region is defined.
              })) ?? []
          ) ?? [];

        return regionInstances;
      } catch (error) {
        console.error(`Error querying region ${region}:`, error);
        return [];
      }
    }
  );

  // Flatten the array of arrays into a single array of instances.
  const instances: InstanceWithRegion[] = (
    await Promise.all(instancePromises)
  ).flat();

  // if (instances.length === 0) {
  //   return new NextResponse("No instances found", { status: 404 });
  // }

  const formattedInstances = instances
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
      };
    })
    .filter(Boolean);

  return NextResponse.json(formattedInstances);
};

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  if (!body) {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 }
    );
  }

  const {
    region,
    instanceName,
    instanceType,
    username,
    password,
    storageSize,
  } = body;

  const createInstanceResult = await createInstance(
    region,
    instanceName,
    instanceType,
    username,
    password,
    storageSize
  );

  if (!createInstanceResult) {
    return NextResponse.json(
      { message: "Error creating instance" },
      { status: 500 }
    );
  }

  const { instanceId } = createInstanceResult;

  pollRabbitMQServerStatus(
    instanceId,
    instanceName,
    username,
    password,
    region
  );
  return NextResponse.json({
    name: instanceName,
    id: instanceId,
  });
};
