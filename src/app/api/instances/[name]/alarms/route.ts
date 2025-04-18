import { EC2Client } from "@aws-sdk/client-ec2";
import { NextRequest, NextResponse } from "next/server";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { Alarm } from "@/types/alarms";
import { startMetricsMonitoring } from "@/utils/RabbitMQ/monitorMetrics";
import { decrypt } from "@/utils/encrypt";
import { stopMetricsMonitoring } from "@/utils/RabbitMQ/monitorMetrics";
import {
  appendAlarmsSettings,
  deleteAlarmFromDynamoDB,
  fetchFromDynamoDB,
} from "@/utils/dynamoDBUtils";
import getAlarms from "./utils/getAlarms";
import addAndStartAlarms from "./utils/addAndStartAlarms";

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
    const alarms = await getAlarms({
      region,
      instanceName,
    });

    return NextResponse.json(alarms);
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
  const alarmData = await request.json();

  if (!region) {
    return NextResponse.json(
      { message: "Missing region parameter" },
      { status: 400 }
    );
  }

  // const client = new EC2Client({ region });
  // const instance = await fetchInstance(instanceName, client);

  // if (!instance || !instance.InstanceId) {
  //   return NextResponse.json(
  //     { message: `No instance found with name: ${instanceName}` },
  //     { status: 404 }
  //   );
  // }

  try {
    // const response = await appendAlarmsSettings(instance.InstanceId, alarmData);

    // const metadata = await fetchFromDynamoDB("rabbitory-instances-metadata", {
    //   instanceId: instance.InstanceId,
    // });

    // const encryptedUsername = metadata.Item?.encryptedUsername;
    // const encryptedPassword = metadata.Item?.encryptedPassword;
    // const publicDns = instance.PublicDnsName;
    // const type = alarmData.type;

    // if (!encryptedUsername || !encryptedPassword || !publicDns) {
    //   return NextResponse.json(
    //     { message: "RabbitMQ credentials not found" },
    //     { status: 500 }
    //   );
    // }

    // const username = decrypt(encryptedUsername);
    // const password = decrypt(encryptedPassword);
    // const alarms = response.Attributes?.alarms;
    // // we append the newest alarm, so order is maintained
    // const newAlarm: Alarm = alarms[type]?.slice(-1)[0];

    // await startMetricsMonitoring(
    //   instance.InstanceId,
    //   region,
    //   publicDns,
    //   username,
    //   password,
    //   newAlarm,
    //   alarmData.type
    // );
    const alarms = await addAndStartAlarms({
      region,
      alarmData,
      instanceName,
    });

    return NextResponse.json({
      message: "Alarm added and monitoring started",
      alarms,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error adding alarm and starting monitoring" },
      { status: 500 }
    );
  }
}

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
    stopMetricsMonitoring(alarmId);
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
