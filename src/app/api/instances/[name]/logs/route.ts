import { EC2Client } from "@aws-sdk/client-ec2";
import { NextResponse } from "next/server";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstace";
import { runSSMCommands } from "@/utils/AWS/SSM/runSSMCommands";

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
  const instanceId = instance.InstanceId;

  try {
    // Run commands to fetch RabbitMQ logs
    const commands = [
      "journalctl -u rabbitmq-server.service -n 1000 --no-pager"  // Last 1000 lines
    ];

    const logs = await runSSMCommands(
      instanceId!,
      commands,
      process.env.REGION!
    );

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { message: "Error fetching logs", error: String(error) },
      { status: 500 }
    );
  }
}
