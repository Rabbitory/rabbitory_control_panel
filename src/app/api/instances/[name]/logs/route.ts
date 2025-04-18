import { NextResponse, NextRequest } from "next/server";
import getLogs from "./utils/getLogs";

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
    const logs = await getLogs({
      region,
      instanceName,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching logs:", error);

    const errorMessage =
      error instanceof Error
        ? `Failed to fetch logs: ${error.message}`
        : "Failed to fetch logs: Unknown error";

    return NextResponse.json(
      { message: errorMessage, error: String(error) },
      { status: 500 }
    );
  }
}
