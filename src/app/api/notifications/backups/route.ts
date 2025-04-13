import { NextResponse } from "next/server";
import { getEvents } from "@/utils/eventBackups";

export async function GET() {
  const events = getEvents();
  return NextResponse.json(events);
}
