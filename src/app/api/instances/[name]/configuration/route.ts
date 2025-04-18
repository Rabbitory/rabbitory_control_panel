import { NextRequest, NextResponse } from "next/server";
import { validateConfiguration } from "@/utils/validateConfigBackend";
import { deleteEvent } from "@/utils/eventBackups";
import eventEmitter from "@/utils/eventEmitter";
import getConfiguration from "./utils/getConfiguration";
import { Config } from "./types";
import updateConfiguration from "./utils/updateConfiguration";

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
    const config = await getConfiguration({ region, instanceName });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching configuration:", error);
    return NextResponse.json(
      { message: "Error fetching configuration", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
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

  const { configuration: newConfig } = (await request.json()) as {
    configuration: Config;
  };

  const { valid, errors } = validateConfiguration(newConfig);
  if (!valid) {
    console.error("Invalid configuration:", errors);
    return NextResponse.json(
      { message: "Invalid configuration", errors },
      { status: 400 }
    );
  }

  try {
    const config = await updateConfiguration({
      region,
      newConfig,
      instanceName,
    });

    eventEmitter.emit("notification", {
      type: "configuration",
      status: "success",
      instanceName: instanceName,

      message: "Configuration updated successfully",
    });
    deleteEvent(instanceName, "configuration");

    return NextResponse.json(config);
  } catch (error) {
    eventEmitter.emit("notification", {
      type: "configuration",
      status: "error",
      instanceName: instanceName,

      message: "Failed to update configuration",
    });
    deleteEvent(instanceName, "configuration");
    console.error("Error updating configuration:", error);
    return NextResponse.json(
      { message: "Error updating configuration", error: String(error) },
      { status: 500 }
    );
  }
}
