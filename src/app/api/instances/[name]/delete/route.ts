import { EC2Client } from "@aws-sdk/client-ec2";
import { NextRequest, NextResponse } from "next/server";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import deleteInstance from "./utils/deleteInstance";
import { getGroupName } from "./utils/utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name: instanceName } = await params;
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");

  if (!region || !instanceName) {
    return NextResponse.json(
      { message: "Parameter(s) are missing" },
      { status: 400 }
    );
  }

  const ec2Client = new EC2Client({ region });

  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance || !instance.InstanceId) {
    return NextResponse.json(
      { message: `Instance not found: ${instanceName}` },
      { status: 404 }
    );
  }

  const groupName = getGroupName(instance);
  if (groupName === undefined) {
    return NextResponse.json(
      { message: `No security group found for instance: ${instanceName}` },
      { status: 404 }
    );
  }
  const instanceId = instance.InstanceId;
  deleteInstance({ instanceId, groupName, ec2Client, instanceName });

  return NextResponse.json(
    { message: `Initiated deletion for ${instanceName}` },
    { status: 202 }
  );
}
