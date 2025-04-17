import { NextRequest, NextResponse } from "next/server";

import { getVersions } from "./service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");
  const { name: instanceName } = await params;

  const username = request.headers.get("x-rabbitmq-username");
  const password = request.headers.get("x-rabbitmq-password");
  if (!username || !password || !region) {
    return NextResponse.json(
      { message: "Missing parameters" },
      { status: 400 }
    );
  }

  try {
    const versions = await getVersions({
      instanceName,
      region,
      username,
      password,
    });
    return NextResponse.json(versions);
  } catch (error) {
    console.error("Error fetching versions:", error);
    return NextResponse.json(
      { message: "Error fetching versions", error: String(error) },
      { status: 500 }
    );
  }
}
