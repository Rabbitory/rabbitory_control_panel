import { getVolumeSize } from "@/utils/AWS/EC2/getVolumeSize";
import { NextRequest, NextResponse } from "next/server";
import { updateVolumeSize } from "@/utils/AWS/EC2/updateVolumeSize";
import { rebootInstance } from "@/utils/AWS/EC2/rebootInstance";

const isValidStorageSize = (size: number) => size >= 1 && size <= 16000;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const volumeId = searchParams.get("volumeId");
    const region = searchParams.get("region");

    if (!volumeId || !region) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    const size = await getVolumeSize(volumeId, region);

    // Will have server side events with notifications eventually

    return NextResponse.json({ size }, { status: 200 });
  } catch (error) {
    console.error("Error getting size:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { instanceId, volumeId, region, size } = await request.json();

    if (!volumeId || !region || !size) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    if (!size || !isValidStorageSize(size)) {
      return new NextResponse("Invalid storage size", { status: 400 });
    }

    await updateVolumeSize(volumeId, region, size);
    await rebootInstance(instanceId, region);

    return NextResponse.json(
      { message: "Storage size expanded. Wait for reboot." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating size:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
