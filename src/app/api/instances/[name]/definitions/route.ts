import { EC2Client } from "@aws-sdk/client-ec2";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import eventEmitter from "@/utils/eventEmitter";
import {
  appendBackupDefinition,
  fetchFromDynamoDB,
} from "@/utils/dynamoDBUtils";
import { getDefinitions } from "@/utils/RabbitMQ/backupDefinitions";
import { NextRequest, NextResponse } from "next/server";

// Use NextRequest type and properly handle params
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");
  if (!region) {
    return NextResponse.json(
      { message: "Missing region parameter" },
      { status: 400 },
    );
  }
  const { name: instanceName } = await params;
  const ec2Client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, ec2Client);
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

    if (!response) {
      return NextResponse.json(
        { message: "Credentials are not ready yet! Try again later!" },
        { status: 503 },
      );
    }
    const definitions = response.Item?.backups;
    if (!definitions) {
      return NextResponse.json(
        { message: "No definitions found for this instance" },
        { status: 404 },
      );
    }

    return NextResponse.json(definitions);
  } catch (error) {
    console.error("Error fetching rabbitmq definitions:", error);
    return NextResponse.json(
      { message: "Error fetching rabbitmq definitions:", error: String(error) },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const searchParams = request.nextUrl.searchParams;
  const { name: instanceName } = await params;
  const region = searchParams.get("region");

  const username = request.headers.get("x-rabbitmq-username");
  const password = request.headers.get("x-rabbitmq-password");

  if (!username || !password) {
    return NextResponse.json(
      { message: "Username and password are required" },
      { status: 400 },
    );
  }
  if (!region) {
    return NextResponse.json(
      { message: "Missing region parameter" },
      { status: 400 },
    );
  }
  const ec2Client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance || !instance.InstanceId) {
    return NextResponse.json(
      { message: `No instance found with name: ${instanceName}` },
      { status: 404 },
    );
  }
  if (!instance.PublicDnsName) {
    return NextResponse.json(
      { message: "Instance not ready yet! Try again later!" },
      { status: 404 },
    );
  }

  try {
    const definitions = await getDefinitions(
      instance.PublicDnsName,
      username,
      password,
      "manual",
    );
    if (!definitions) {
      return NextResponse.json(
        { message: "No definitions found for this instance" },
        { status: 404 },
      );
    }

    const response = await appendBackupDefinition(
      instance.InstanceId,
      definitions,
    );
    eventEmitter.emit("notifications", {
      type: "backup",
      status: "success",
      instanceName: instanceName,
      message: "Backup definition added successfully",
    });
    return NextResponse.json(response.Attributes?.backups);
  } catch (error) {
    console.error("Error fetching rabbitmq definitions:", error);
    return NextResponse.json(
      { message: "Error fetching rabbitmq definitions:", error: String(error) },
      { status: 500 },
    );
  }
}
