import { NextRequest, NextResponse } from "next/server";

import triggerAlarms from "./utils/triggerAlarms";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");
  const type = searchParams.get("type");
  const { name: instanceName } = await params;
  const username = request.headers.get("x-rabbitmq-username");
  const password = request.headers.get("x-rabbitmq-password");
  const alarms = await request.json();

  if (!region || !type || !instanceName || !username || !password) {
    return NextResponse.json(
      { message: "Missing parameters" },
      { status: 400 }
    );
  }

  try {
    await triggerAlarms({
      region,
      alarms,
      type,
      instanceName,
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
