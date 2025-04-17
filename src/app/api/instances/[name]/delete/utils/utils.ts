import { Instance } from "@aws-sdk/client-ec2";

export function getGroupName(instance: Instance): string {
  const id = instance.InstanceId;
  const securityGroups = instance.SecurityGroups
    ? instance.SecurityGroups[0]
    : null;
  if (!securityGroups || !securityGroups.GroupId) {
    throw new Error(`No security groups found for instance ${id}`);
  }
  const groupId = securityGroups.GroupId;

  return groupId;
}
