import { NextRequest, NextResponse } from "next/server";
import deleteInstance from "./utils/deleteInstance";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name: instanceName } = await params;
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");

  if (!region || !instanceName) {
    return NextResponse.json(
      { message: "Parameter(s) are missing" },
      { status: 400 }
    );
  }

  try {
    deleteInstance({ region, instanceName });

    return NextResponse.json(
      { message: `Initiated deletion for ${instanceName}` },
      { status: 202 }
    );
  } catch (error) {
    console.error("Error deleting instance:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: String(error) },
      { status: 500 }
    );
  }
}
