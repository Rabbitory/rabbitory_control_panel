import { NextRequest, NextResponse } from "next/server";
import { getCurrentSecurityGroupRules } from "@/utils/AWS/Security-Groups/getCurrentSecurityGroupRules";

import { convertToUIFirewallRules } from "@/utils/AWS/Security-Groups/conversionsForSG";
import eventEmitter from "@/utils/eventEmitter";
import { deleteEvent } from "@/utils/eventBackups";
import updateFireWallRules from "./utils/updateFireWallRules";

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
    const currentSGRules = await getCurrentSecurityGroupRules(
      instanceName,
      region
    );
    const uiFirewallRules = convertToUIFirewallRules(currentSGRules);
    return NextResponse.json(uiFirewallRules);
  } catch (error) {
    console.error("Error fetching firewall rules:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");
  const { name: instanceName } = await params;
  const { rules } = await request.json();

  if (!region) {
    return NextResponse.json(
      { message: "Missing region parameter" },
      { status: 400 }
    );
  }

  try {
    const updatedUiFirewallRules = await updateFireWallRules({
      region,
      rules,
      instanceName,
    });

    eventEmitter.emit("notification", {
      type: "firewall",
      status: "success",
      instanceName,
      message: `Firewall updated successfully!`,
    });

    deleteEvent(instanceName, "firewall");

    return NextResponse.json(updatedUiFirewallRules);
  } catch (error) {
    eventEmitter.emit("notification", {
      type: "firewall",
      status: "error",
      instanceName,
      message: `Firewall updated failed!`,
    });

    deleteEvent(instanceName, "firewall");
    console.error("Error updating ports:", error);
    return NextResponse.json(
      { error: `Failed to update security group and RabbitMQ ports: ${error}` },
      { status: 500 }
    );
  }
}
