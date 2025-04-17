import eventEmitter from "@/utils/eventEmitter";
import { deleteEvent } from "@/utils/eventBackups";
import { NextRequest, NextResponse } from "next/server";
import getBackups from "./utils/getBackups";
import addBackups from "./utils/addBackups";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");
  const { name: instanceName } = await params;
  if (!region) {
    return NextResponse.json(
      { message: "Missing region parameter" },
      { status: 400 }
    );
  }

  try {
    const definitions = await getBackups({ region, instanceName });

    return NextResponse.json(definitions);
  } catch (error) {
    console.error("Error fetching rabbitmq definitions:", error);
    return NextResponse.json(
      { message: "Error fetching rabbitmq definitions:", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const searchParams = request.nextUrl.searchParams;
  const { name: instanceName } = await params;
  const region = searchParams.get("region");

  const username = request.headers.get("x-rabbitmq-username");
  const password = request.headers.get("x-rabbitmq-password");

  if (!region || !username || !password) {
    return NextResponse.json(
      { message: "Missing parameter(s)" },
      { status: 400 }
    );
  }

  try {
    const backups = await addBackups({
      region,
      username,
      password,
      instanceName,
    });
    eventEmitter.emit("notification", {
      type: "backup",
      status: "success",
      instanceName: instanceName,
      message: "Backup definition added successfully",
      path: "definitions",
    });

    deleteEvent(instanceName, "backup");

    return NextResponse.json(backups);
  } catch (error) {
    eventEmitter.emit("notification", {
      type: "backup",
      status: "error",
      instanceName: instanceName,
      message: "Failed to add backup definition",
      path: "definitions",
    });

    deleteEvent(instanceName, "backup");
    console.error("Error fetching rabbitmq definitions:", error);
    return NextResponse.json(
      { message: "Error fetching rabbitmq definitions:", error: String(error) },
      { status: 500 }
    );
  }
}
