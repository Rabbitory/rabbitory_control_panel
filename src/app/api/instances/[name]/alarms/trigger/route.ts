import { EC2Client } from "@aws-sdk/client-ec2";
import { NextRequest, NextResponse } from "next/server";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { sendNotification } from "@/utils/RabbitMQ/monitorMetrics";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");
  const { name: instanceName } = await params;
  const username = request.headers.get("x-rabbitmq-username");
  const password = request.headers.get("x-rabbitmq-password");

  if (!username || !password) {
    return NextResponse.json(
      { message: "Username and password are required" },
      { status: 400 }
    );
  }

  if (!region || !instanceName) {
    return NextResponse.json(
      { message: "Missing parameters" },
      { status: 400 }
    );
  }

  const ec2Client = new EC2Client({ region });

  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance || !instance.PublicDnsName) {
    return NextResponse.json(
      { message: `Instance is not found!` },
      { status: 404 }
    );
  }
  const publicDns = instance.PublicDnsName;

  const alarms = await request.json();
  console.log(alarms);

  const type = searchParams.get("type");
  if (!type) {
    return NextResponse.json(
      { message: "Missing parameters" },
      { status: 400 }
    );
  }

  try {
    sendNotification({
      alarmId: alarms.id,
      type: type,
      currentValue: 0,
      threshold: alarms.data.storageThreshold,
      instanceDns: publicDns,
    });
    return NextResponse.json({ message: "Trigger successfully" });
  } catch (error) {
    console.error("Error trigger alarms:", error);
    return NextResponse.json(
      { message: "Error trigger alarms" },
      { status: 500 }
    );
  }
}
