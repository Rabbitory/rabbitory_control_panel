import { NextRequest, NextResponse } from "next/server";

// import { getPlugins, togglePlugins } from "./service";
import getPlugins from "./utils/getPlugins";
import togglePlugins from "./utils/togglePlugins";
import eventEmitter from "@/utils/eventEmitter";
import { deleteEvent } from "@/utils/eventBackups";
import { PluginUpdate } from "./types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");
  const { name: instanceName } = await params;

  const username = request.headers.get("x-rabbitmq-username");
  const password = request.headers.get("x-rabbitmq-password");

  if (!region || !username || !password) {
    return NextResponse.json(
      { message: "Missing parameters" },
      { status: 400 }
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
    return NextResponse.json(
      {
        message: `Error fetching plugins\n${
          error instanceof Error ? error.message : String(error)
        }`,
      },
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

  try {
    const { updates } = (await request.json()) as {
      updates?: PluginUpdate[];
    };

    if (!Array.isArray(updates) || updates.length === 0) {
      throw new Error("No updates provided");
    }

    await togglePlugins({
      region,
      updates,
      instanceName,
    });

    eventEmitter.emit("notification", {
      type: "plugin",
      status: "success",
      instanceName: instanceName,
      message: `Updated ${updates.length} plugin(s) on instance ${instanceName}`,
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
      message: `Error updating plugins on instance ${instanceName}`,
    });

    deleteEvent(instanceName, "plugin");

    return NextResponse.json(
      {
        message: `Error updating plugins\n${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 }
    );
  }
}
