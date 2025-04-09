import { getVolumeSize } from "@/utils/AWS/EC2/getVolumeSize";
import { NextRequest, NextResponse } from "next/server";
import { updateVolumeSize } from "@/utils/AWS/EC2/updateVolumeSize";
import { rebootInstance } from "@/utils/AWS/EC2/rebootInstance";
import eventEmitter from "@/utils/eventEmitter";
import { deleteEvent } from "@/utils/eventBackups";

const updateAndReboot = async (
  volumeId: string,
  instanceId: string,
  region: string,
  size: number,
  instanceName: string,
) => {
  try {
    console.log(instanceName);
    await updateVolumeSize(volumeId, region, size);
    await rebootInstance(instanceId, region);

    eventEmitter.emit("notification", {
      message: `${instanceName} now has ${size} GB of storage.`,
      type: "storage",
      status: "success",
      instanceName,
    });

    deleteEvent(instanceName, "storage");

    return {
      success: `${instanceName} now has ${size} GB of storage.`,
    };
  } catch (error) {
    console.error("Error updating volume size:", error);
    eventEmitter.emit("notification", {
      message: `Failed to update ${instanceName} storage.`,
      type: "storage",
      status: "error",
      instanceName,
    });
    deleteEvent(instanceName, "storage");
    return {
      error: `Failed to update ${instanceName} storage.`,
    };
  }
};

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
    const { instanceId, volumeId, region, size, instanceName } =
      await request.json();

    if (!volumeId || !region || !size || !instanceName) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    if (!size || !isValidStorageSize(size)) {
      return new NextResponse("Invalid storage size", { status: 400 });
    }

    updateAndReboot(volumeId, instanceId, region, size, instanceName);

    return NextResponse.json(
      { message: `Expanding storage to ${size}` },
      { status: 202 },
    );
  } catch (error) {
    console.error("Error updating size:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
