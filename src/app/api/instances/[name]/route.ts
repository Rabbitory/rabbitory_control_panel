import { NextRequest, NextResponse } from "next/server";
import getInstanceOverview from "./utils/getInstanceOverview";

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
    const formattedInstance = await getInstanceOverview({
      region,
      instanceName,
    });

    return NextResponse.json(formattedInstance);
  } catch (error) {
    console.error("Error fetching instance details:", error);
    return NextResponse.json(
      { message: "Error fetching instance details", error: String(error) },
      { status: 500 }
    );
  }
}
