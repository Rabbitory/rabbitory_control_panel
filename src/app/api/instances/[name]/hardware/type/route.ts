import { _InstanceType } from "@aws-sdk/client-ec2";
import { NextRequest, NextResponse } from "next/server";
import { modifyHardware } from "@/utils/AWS/EC2/modifyHardware";

interface HardwareRequest {
  instanceId: string;
  instanceType: _InstanceType;
  region: string;
  instanceName: string;
}

export async function PUT(request: NextRequest) {
  try {
    const { instanceId, instanceType, region, instanceName } =
      (await request.json()) as HardwareRequest;

    if (!instanceId || !instanceType || !region || !instanceName) {
      return new NextResponse("Missing id, type, region or name", {
        status: 400,
      });
    }

    if (!Object.values(_InstanceType).includes(instanceType)) {
      return new NextResponse("Invalid instance type", { status: 400 });
    }

    if (!/^[a-z]{2}-[a-z]+-[1-9]$/.test(region)) {
      return new NextResponse("Invalid region", { status: 400 });
    }

    modifyHardware(instanceId, instanceType, region, instanceName);

    return new NextResponse(
      `Initialized ${instanceId} updated to ${instanceType} successfully.`,
      { status: 202 },
    );
  } catch (error) {
    console.error("Error updating instance:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
