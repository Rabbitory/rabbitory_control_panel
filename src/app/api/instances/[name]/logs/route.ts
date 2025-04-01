import { EC2Client } from "@aws-sdk/client-ec2";
import { NextResponse, NextRequest } from "next/server";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstace";
import { runSSMCommands } from "@/utils/AWS/SSM/runSSMCommands";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");
  const { name: instanceName } = await params;

  console.log('API called with:', { instanceName, region });

  if (!region) {
    return NextResponse.json(
      { message: "Missing region parameter" },
      { status: 400 }
    );
  }

  const ec2Client = new EC2Client({ region });

  const instance = await fetchInstance(instanceName, ec2Client);
  console.log('Raw instance data:', instance);

  if (!instance) {
    return NextResponse.json(
      { message: `No instance found with name: ${instanceName}` },
      { status: 404 }
    );
  }

  // Handle deeply nested arrays and ensure we get a string
  let instanceId = instance.InstanceId;
  while (Array.isArray(instanceId)) {
    instanceId = instanceId[0];
  }

  console.log('Processed instanceId:', instanceId);

  if (!instanceId || typeof instanceId !== 'string') {
    return NextResponse.json(
      { message: "Invalid or missing instance ID" },
      { status: 400 }
    );
  }

  // Check instance state before attempting to run SSM commands
  if (instance.State?.Name !== 'running') {
    return NextResponse.json(
      {
        message: `Cannot fetch logs: Instance is ${instance.State?.Name}. Instance must be running to fetch logs.`
      },
      { status: 400 }
    );
  }


  try {
    const commands = [
      "journalctl -u rabbitmq-server.service -n 1000 --no-pager"
    ];

    const logs = await runSSMCommands(
      instanceId,
      commands,
      region
    );

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching logs:", error);

    const errorMessage = error instanceof Error
      ? `Failed to fetch logs: ${error.message}`
      : "Failed to fetch logs: Unknown error";

    return NextResponse.json(
      { message: errorMessage, error: String(error) },
      { status: 500 }
    );
  }
}
````
