import { UpdateAndRebootParams } from "../types";
import { updateVolumeSize } from "@/utils/AWS/EC2/updateVolumeSize";
import { rebootInstance } from "@/utils/AWS/EC2/rebootInstance";
import eventEmitter from "@/utils/eventEmitter";
import { deleteEvent } from "@/utils/eventBackups";

export default async function updateAndReboot({
  volumeId,
  instanceId,
  region,
  size,
  instanceName,
}: UpdateAndRebootParams): Promise<void> {
  try {
    await updateVolumeSize(volumeId, region, size);
    await rebootInstance(instanceId, region);

    eventEmitter.emit("notification", {
      message: `${instanceName} now has ${size} GB of storage.`,
      type: "storage",
      status: "success",
      instanceName,
    });

    deleteEvent(instanceName, "storage");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error updating volume size:", error.message);
    }

    eventEmitter.emit("notification", {
      message: `Failed to update ${instanceName} storage. You must wait at least 6 hours before attempting to update again.`,
      type: "storage",
      status: "error",
      instanceName,
    });
    deleteEvent(instanceName, "storage");
  }
}
