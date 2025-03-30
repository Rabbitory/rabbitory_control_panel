import {
  EC2Client,
  StopInstancesCommand,
  waitUntilInstanceStopped,
  ModifyInstanceAttributeCommand,
  StartInstancesCommand,
  waitUntilInstanceRunning,
  _InstanceType,
} from "@aws-sdk/client-ec2";
import { NextRequest, NextResponse } from "next/server";

interface HardwareRequest {
  instanceId: string;
  instanceType: _InstanceType;
  region: string;
}

export async function PUT(request: NextRequest) {
  try {
    const { instanceId, instanceType, region } =
      (await request.json()) as HardwareRequest;

    if (!instanceId || !instanceType || !region) {
      return new NextResponse("Missing id, type or region", {
        status: 400,
      });
    }

    if (!Object.values(_InstanceType).includes(instanceType)) {
      return new NextResponse("Invalid instance type", { status: 400 });
    }

    if (!/^[a-z]{2}-[a-z]+-[1-9]$/.test(region)) {
      return new NextResponse("Invalid region", { status: 400 });
    }

    const client = new EC2Client({ region });

    // Will have server side events with notifications eventually

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

    return new NextResponse(
      `Instance ${instanceId} updated to type ${instanceType} successfully.`,
    );
  } catch (error) {
    console.error("Error updating instance:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
