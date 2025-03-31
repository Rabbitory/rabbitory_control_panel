import { IAMClient, GetInstanceProfileCommand } from "@aws-sdk/client-iam";
// Change region as needed
export default async function getInstanceProfileByName(
  instanceProfileName: string,
  region: string | undefined,
) {
  const iamClient = new IAMClient({ region });
  try {
    const command = new GetInstanceProfileCommand({
      InstanceProfileName: instanceProfileName,
    });
    const response = await iamClient.send(command);
    console.log("Instance Profile: " + instanceProfileName + " found.");
    return response.InstanceProfile?.InstanceProfileName;
  } catch (error) {
    console.error("Error fetching instance profile:", error);
    return undefined;
  }
}
