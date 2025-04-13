import { EC2Client } from "@aws-sdk/client-ec2";
import { NextRequest, NextResponse } from "next/server";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { runSSMCommands } from "@/utils/AWS/SSM/runSSMCommands";
import { validateConfiguration } from "@/utils/validateConfig";
import { deleteEvent } from "@/utils/eventBackups";
import eventEmitter from "@/utils/eventEmitter";
import parseConfig from "@/utils/parseConfig";

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

  const ec2Client = new EC2Client({ region });

  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance) {
    return NextResponse.json(
      { message: `No instance found with name: ${instanceName}` },
      { status: 404 }
    );
  }
  const instanceId = instance.InstanceId;

  try {
    // Run a command to fetch the configuration file.
    const fileContent = await runSSMCommands(
      instanceId!,
      ["cat /etc/rabbitmq/rabbitmq.conf"],
      region!
    );

    const config: Record<string, string> = {};
    parseConfig(config, fileContent);

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

  const ec2Client = new EC2Client({ region });

  const { configuration: newConfig } = (await request.json()) as {
    configuration: Record<string, string>;
  };

  const { valid, errors } = validateConfiguration(newConfig);
  if (!valid) {
    console.error("Invalid configuration:", errors);
    return NextResponse.json(
      { message: "Invalid configuration", errors },
      { status: 400 }
    );
  }

  const commands: string[] = [];
  for (const [key, value] of Object.entries(newConfig)) {
    if (value !== "") {
      commands.push(
        `sudo sed -i '/^${key}[[:space:]]*=.*/c\\${key} = ${value}' /etc/rabbitmq/rabbitmq.conf`
      );
    }
  }

  commands.push("sudo systemctl restart rabbitmq-server");
  commands.push("echo __CONFIG_START__");
  commands.push("cat /etc/rabbitmq/rabbitmq.conf");

  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance) {
    return NextResponse.json(
      { message: `No instance found with name: ${instanceName}` },
      { status: 404 }
    );
  }
  const instanceId = instance.InstanceId;
  try {
    const output = await runSSMCommands(instanceId!, commands, region!);

    eventEmitter.emit("notification", {
      type: "configuration",
      status: "success",
      instanceName: instanceName,

      message: "Configuration updated successfully",
    });
    deleteEvent(instanceName, "configuration");

    const parts = output.split("__CONFIG_START__");
    const configData = parts.length > 1 ? parts[1] : output;
    const config: Record<string, string> = {};
    parseConfig(config, configData);

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
