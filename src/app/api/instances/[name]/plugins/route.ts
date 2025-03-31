import { EC2Client } from "@aws-sdk/client-ec2";
import { NextResponse } from "next/server";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstace";
import { runSSMCommands } from "@/utils/AWS/SSM/runSSMCommands";
import axios from "axios";

const ec2Client = new EC2Client({ region: process.env.REGION });

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name: instanceName } = await params;

  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance) {
    return NextResponse.json(
      { message: `No instance found with name: ${instanceName}` },
      { status: 404 }
    );
  }
  const publicDns = instance.PublicDnsName;

  if (!publicDns) {
    return NextResponse.json(
      { message: "Instance not ready yet! Try again later!" },
      { status: 404 }
    );
  }

  const username = request.headers.get("x-rabbitmq-username");
  const password = request.headers.get("x-rabbitmq-password");
  if (!username || !password) {
    return NextResponse.json(
      { message: "Username and password are required" },
      { status: 400 }
    );
  }

  try {
    const rabbitUrl = `http://${publicDns}:15672/api/nodes`;
    const response = await axios.get(rabbitUrl, {
      auth: {
        username,
        password,
      },
    });
    return NextResponse.json(response.data[0].enabled_plugins);
  } catch (error) {
    console.error("Error fetching plugins:", error);
    return NextResponse.json(
      { message: "Error fetching plugins", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name: instanceName } = await params;

  const { name, enabled } = (await request.json()) as {
    name: string;
    enabled: boolean;
  };

  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance) {
    return NextResponse.json(
      { message: `No instance found with name: ${instanceName}` },
      { status: 404 }
    );
  }
  const instanceId = instance.InstanceId;

  const commands: string[] = [];
  if (enabled) {
    commands.push(`rabbitmq-plugins enable ${name}`);
  } else {
    commands.push(`rabbitmq-plugins disable ${name}`);
  }

  commands.push("systemctl restart rabbitmq-server");

  try {
    await runSSMCommands(instanceId!, commands, process.env.REGION!);
    return NextResponse.json({
      message: "Plugin update successful",
    });
  } catch (error) {
    console.error("Error updating plugins:", error);
    return NextResponse.json(
      { message: "Error updating plugins", error: String(error) },
      { status: 500 }
    );
  }
}
