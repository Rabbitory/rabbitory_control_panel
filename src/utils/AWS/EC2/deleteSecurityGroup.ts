import {
  EC2Client,
  DeleteSecurityGroupCommand,
} from "@aws-sdk/client-ec2";

export const deleteSecurityGroup = async (groupId: string, client: EC2Client): Promise<void> => {
  try {
    const deleteCommand = new DeleteSecurityGroupCommand({
      GroupId: groupId,
    });
    await client.send(deleteCommand);
    console.log(`Successfully deleted security group ${groupId}`);
  } catch (err) {
    console.error(`Failed to delete security group ${groupId}:`, err);
    throw err;
  }
};
