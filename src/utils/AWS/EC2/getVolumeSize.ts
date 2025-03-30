import { EC2Client, DescribeVolumesCommand } from "@aws-sdk/client-ec2";

export async function getVolumeSize(id: string, region: string) {
  const client = new EC2Client({ region });

  try {
    const command = new DescribeVolumesCommand({ VolumeIds: [id] });
    const response = await client.send(command);

    if (response.Volumes && response.Volumes.length > 0) {
      return response.Volumes[0].Size;
    } else {
      console.log("No volumes found.");
    }
  } catch (error) {
    console.error("Error fetching volume details:", error);
  }
}
