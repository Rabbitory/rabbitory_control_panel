import {
  EC2Client,
  DescribeInstancesCommand,
  DescribeInstancesCommandOutput,
  // Instance,
} from "@aws-sdk/client-ec2";
import { NextRequest, NextResponse } from "next/server";
import { pollRabbitMQServerStatus } from "@/utils/RabbitMQ/serverStatus";
import createInstance from "@/utils/AWS/EC2/createBrokerInstance";
import { listInstances, formattedInstances } from "./service";
import { getEC2Regions } from "@/utils/AWS/EC2/getEC2Regions";
import eventEmitter from "@/utils/eventEmitter";
import { deleteEvent } from "@/utils/eventBackups";

export const GET = async () => {
  try {
    const instances = await listInstances();

    const formatted = formattedInstances(instances);

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching instances:", error);
    return NextResponse.json(
      { message: "Error fetching instances" },
      { status: 500 }
    );
  }
};

export const POST = async (request: NextRequest) => {
  const {
    region,
    instanceName,
    instanceType,
    username,
    password,
    storageSize,
  } = await request.json();

  if (
    !region ||
    !instanceName ||
    !instanceType ||
    !username ||
    !password ||
    !storageSize
  ) {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 }
    );
  }

  const createInstanceResult = await createInstance(
    region,
    instanceName,
    instanceType,
    username,
    password,
    storageSize
  );

  if (!createInstanceResult) {
    eventEmitter.emit("notification", {
      message: `Error creating ${instanceName}.`,
      type: "newInstance",
      status: "error",
      instanceName,
    });

    deleteEvent(instanceName, "newInstance");
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
  return NextResponse.json(
    {
      name: instanceName,
      id: instanceId,
    },
    { status: 202 }
  );
};
