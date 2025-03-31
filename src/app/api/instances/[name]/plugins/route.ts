import { EC2Client } from "@aws-sdk/client-ec2";
import { NextRequest, NextResponse } from "next/server";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstace";
import { runSSMCommands } from "@/utils/AWS/SSM/runSSMCommands";
import axios from "axios";

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

  const ec2Client = new EC2Client({ region });

  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance) {
    return NextResponse.json(
      { message: `No instance found with name: ${instanceName}` },
      { status: 404 },
    );
  }
  const publicDns = instance.PublicDnsName;

  if (!publicDns) {
    return NextResponse.json(
      { message: "Instance not ready yet! Try again later!" },
      { status: 404 },
    );
  }

  //TODO: need to get username and password from dynamodb
  const username = "blackfries";
  const password = "blackfries";
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

  const ec2Client = new EC2Client({ region });

  const { name, enabled } = (await request.json()) as {
    name: string;
    enabled: boolean;
  };

  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance) {
    return NextResponse.json(
      { message: `No instance found with name: ${instanceName}` },
      { status: 404 },
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
      { status: 500 },
    );
  }
}
