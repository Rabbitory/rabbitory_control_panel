import { EC2Client } from "@aws-sdk/client-ec2";
import { NextRequest, NextResponse } from "next/server";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { appendAlarmsSettings, fetchFromDynamoDB } from "@/utils/dynamoDBUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");
  const { name: instanceName } = await params;

  if (!region) {
    return NextResponse.json(
      { message: "Missing region parameter" },
      { status: 400 },
    );
  }

  const client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, client);

  if (!instance || !instance.InstanceId) {
    return NextResponse.json(
      { message: `No instance found with name: ${instanceName}` },
      { status: 404 },
    );
  }

  try {
    const response = await fetchFromDynamoDB("RabbitoryInstancesMetadata", {
      instanceId: instance.InstanceId,
    });

    const alarms = response.Item?.alarms;

    return NextResponse.json(alarms || []);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching alarms settings" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");
  const { name: instanceName } = await params;

  if (!region) {
    return NextResponse.json(
      { message: "Missing region parameter" },
      { status: 400 },
    );
  }

  const client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, client);

  if (!instance || !instance.InstanceId) {
    return NextResponse.json(
      { message: `No instance found with name: ${instanceName}` },
      { status: 404 },
    );
  }

  const alarms = await request.json();

  try {
    const response = await appendAlarmsSettings(instance.InstanceId, alarms);
    console.log(response.Attributes?.alarms);
    return NextResponse.json(response.Attributes?.alarms);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error adding alarms settings" },
      { status: 500 },
    );
  }
}
