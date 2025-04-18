import { NextRequest, NextResponse } from "next/server";
import getAlarms from "./utils/getAlarms";
import addAndStartAlarms from "./utils/addAndStartAlarms";
import deleteAlarms from "./utils/deleteAlarms";

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

  try {
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

  try {
    await deleteAlarms({ region, type, alarmId, instanceName });
    return NextResponse.json({ message: "Alarm deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching alarms settings" },
      { status: 500 }
    );
  }
}
