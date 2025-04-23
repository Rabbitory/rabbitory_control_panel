import { NextRequest, NextResponse } from "next/server";
import { getEC2InstanceTypes } from "@/utils/AWS/EC2/getEC2InstanceTypes";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const architecture =
      (searchParams.get("architecture") as "all" | "amd64" | "arm64") || "all";
    const instanceTypes = await getEC2InstanceTypes(architecture);
    return NextResponse.json({ instanceTypes });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
