import { NextRequest, NextResponse } from "next/server";

// import { getPlugins, togglePlugins } from "./service";
import getPlugins from "./utils/getPlugins";
import togglePlugins from "./utils/togglePlugins";
import eventEmitter from "@/utils/eventEmitter";
import { deleteEvent } from "@/utils/eventBackups";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");
  const { name: instanceName } = await params;

  const username = request.headers.get("x-rabbitmq-username");
  const password = request.headers.get("x-rabbitmq-password");

  if (!region || !username || !password) {
    return NextResponse.json(
      { message: "Missing parameters" },
      { status: 400 },
    );
  }

  try {
    const plugins = await getPlugins({
      instanceName,
      region,
      username,
      password,
    });

    return NextResponse.json(plugins);
  } catch (error) {
    console.error("Error fetching plugins:", error);
    return NextResponse.json(
      { message: "Error fetching plugins", error: String(error) },
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

  const { name, enabled } = (await request.json()) as {
    name: string;
    enabled: boolean;
  };

  try {
    await togglePlugins({
      region,
      pluginName: name,
      enabled,
      instanceName,
    });

    eventEmitter.emit("notification", {
      type: "plugin",
      status: "success",
      instanceName,
      message: `${enabled ? "Enabled" : "Disabled"} ${name} on ${instanceName}`,
    });

    deleteEvent(instanceName, "plugin");
    return NextResponse.json({
      message: "Plugin update successful",
    });
  } catch (error) {
    eventEmitter.emit("notification", {
      type: "plugin",
      status: "error",
      instanceName: instanceName,
      message: "Error updating plugin",
    });

    deleteEvent(instanceName, "plugin");
    console.error("Error updating plugins:", error);
    return NextResponse.json(
      { message: "Error updating plugins", error: String(error) },
      { status: 500 },
    );
  }
}
