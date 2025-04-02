import {
  EC2Client,
  DescribeInstancesCommand,
  DeleteSecurityGroupCommand,
} from "@aws-sdk/client-ec2";

export const deleteSecurityGroup = async (instanceId: string, client: EC2Client): Promise<void> => {
  try {
    const describeCommand = new DescribeInstancesCommand({
      InstanceIds: [instanceId]
    });

    const response = await client.send(describeCommand);
    const securityGroups = response.Reservations?.[0]?.Instances?.[0]?.SecurityGroups;

    if (!securityGroups || securityGroups.length === 0) {
      return;
    }

    const securityGroup = securityGroups[0];

    const deleteCommand = new DeleteSecurityGroupCommand({
      GroupId: securityGroup.GroupId
    });

    await client.send(deleteCommand);

    console.log(`Successfully deleted security group for instance ${instanceId}`)
  } catch (err) {
    console.error(`Failed to delete security group for instance ${instanceId}\n${err}`);
  }
};
