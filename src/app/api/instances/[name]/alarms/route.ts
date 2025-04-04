import { EC2Client } from "@aws-sdk/client-ec2";
import { NextRequest, NextResponse } from "next/server";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { startMetricsMonitoring } from "@/utils/RabbitMQ/monitorMetrics";
import { decrypt } from "@/utils/encrypt";
import {
  appendAlarmsSettings,
  deleteAlarmFromDynamoDB,
  fetchFromDynamoDB,
} from "@/utils/dynamoDBUtils";

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

  const client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, client);

  if (!instance || !instance.InstanceId) {
    return NextResponse.json(
      { message: `No instance found with name: ${instanceName}` },
      { status: 404 }
    );
  }

  try {
    const response = await fetchFromDynamoDB("RabbitoryInstancesMetadata", {
      instanceId: instance.InstanceId,
    });

    const alarms = response.Item?.alarms;

    return NextResponse.json(alarms || {});
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching alarms settings" },
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

  const client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, client);

  if (!instance || !instance.InstanceId) {
    return NextResponse.json(
      { message: `No instance found with name: ${instanceName}` },
      { status: 404 }
    );
  }

  const newAlarm = await request.json();

  try {
    const response = await appendAlarmsSettings(instance.InstanceId, newAlarm);

    const metadata = await fetchFromDynamoDB("RabbitoryInstancesMetadata", {
      instanceId: instance.InstanceId,
    });

    const encryptedUsername = metadata.Item?.encryptedUsername;
    const encryptedPassword = metadata.Item?.encryptedPassword;
    const publicDns = instance.PublicDnsName;
    const type = newAlarm.type;

    if (!encryptedUsername || !encryptedPassword || !publicDns) {
      return NextResponse.json(
        { message: "RabbitMQ credentials not found" },
        { status: 500 }
      );
    }

    const username = decrypt(encryptedUsername);
    const password = decrypt(encryptedPassword);

    await startMetricsMonitoring(
      publicDns,
      username,
      password,
      newAlarm,
      newAlarm.type,
    );

    return NextResponse.json({
      message: "Alarm added and monitoring started",
      alarms: response.Attributes?.alarms
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error adding alarm and starting monitoring" },
      { status: 500 }
    );
  }
}

// import { startMetricsMonitoring } from '@/utils/RabbitMQ/monitorMetrics';
//
// export async function POST(
//   request: NextRequest,
//   { params }: { params: Promise<{ name: string }> }
// ) {
//   // ... existing code ...
//
//   try {
//     const response = await axios.get(rabbitmqUrl, {
//       auth: { username, password }
//     });
//
//     // Start the monitoring cron job
//     await startMetricsMonitoring(
//       publicDns,
//       username,
//       password,
// [alarms], // Pass the alarm settings
// type as 'memory' | 'storage'
//     );
//
//     return NextResponse.json({ message: "Monitoring started successfully" });
//   } catch (error) {
//     console.error("Error starting monitoring:", error);
//     return NextResponse.json(
//       { message: "Error starting monitoring" },
//       { status: 500 }
//     );
//   }
// }
// }

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");
  const type = searchParams.get("type");
  const alarmId = searchParams.get("id");
  const { name: instanceName } = await params;

  if (!region || !type || !alarmId) {
    return NextResponse.json({ message: "Missing parameter" }, { status: 400 });
  }

  const client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, client);

  if (!instance || !instance.InstanceId) {
    return NextResponse.json(
      { message: `No instance found with name: ${instanceName}` },
      { status: 404 }
    );
  }
  try {
    await deleteAlarmFromDynamoDB(instance.InstanceId, type, alarmId);
    return NextResponse.json({ message: "Alarm deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching alarms settings" },
      { status: 500 }
    );
  }
}
