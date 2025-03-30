import { EC2Client, ModifyVolumeCommand } from "@aws-sdk/client-ec2";

export async function updateVolumeSize(
  volumeId: string,
  region: string,
  size: number,
) {
  const client = new EC2Client({ region });

  try {
    await client.send(
      new ModifyVolumeCommand({
        VolumeId: volumeId,
        Size: size,
      }),
    );

    return true;
  } catch (error) {
    console.error("Error updating volume:", error);
    return false;
  }
}
