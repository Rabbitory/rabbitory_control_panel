import { EC2Client } from "@aws-sdk/client-ec2";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { NextRequest, NextResponse } from "next/server";
import { deleteBroker } from "@/utils/AWS/EC2/deleteBrokerInstance";
import { deleteFromDynamoDB } from "@/utils/dynamoDBUtils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");

  if (!region) {
    return NextResponse.json(
      { message: "Region parameter is missing" },
      { status: 400 },
    );
  }

  const ec2Client = new EC2Client({ region });

  const instance = await fetchInstance(name, ec2Client);
  const instanceId = instance?.InstanceId;
  if (instanceId === undefined) {
    return NextResponse.json(
      { message: `No instance found with name: ${name}` },
      { status: 404 },
    );
  }
  await deleteBroker(instanceId, ec2Client);
  await deleteFromDynamoDB("RabbitoryInstancesMetadata", {
    instanceId: { S: instanceId },
  });
  return NextResponse.json(
    { message: `Successfully deleted instance: ${name}` },
    { status: 200 },
  );
}
