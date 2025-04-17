import { getVolumeSize } from "@/utils/AWS/EC2/getVolumeSize";
import { NextRequest, NextResponse } from "next/server";
import updateAndReboot from "./utils/updateAndReboot";

const isValidStorageSize = (size: number): boolean =>
  size >= 1 && size <= 16000;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const volumeId = searchParams.get("volumeId");
    const region = searchParams.get("region");

    if (!volumeId || !region) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    const size = await getVolumeSize(volumeId, region);

    return NextResponse.json({ size }, { status: 200 });
  } catch (error) {
    console.error("Error getting size:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { instanceId, volumeId, region, size, instanceName } =
      await request.json();

    if (!volumeId || !region || !size || !instanceName) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    if (!isValidStorageSize(size)) {
      return new NextResponse("Invalid storage size", { status: 400 });
    }

    updateAndReboot({ volumeId, instanceId, region, size, instanceName });

    return NextResponse.json(
      { message: `Expanding storage to ${size}` },
      { status: 202 }
    );
  } catch (error) {
    console.error("Error updating size:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
