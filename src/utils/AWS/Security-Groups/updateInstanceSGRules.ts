import { 
  EC2Client, 
  AuthorizeSecurityGroupIngressCommand, 
  RevokeSecurityGroupIngressCommand,
} from "@aws-sdk/client-ec2";
import { SecurityGroupRule } from "../../../types/firewall";
import { fetchInstance } from "../EC2/fetchInstance";

const ec2Client = new EC2Client({ region: "us-east-1" }); // Change to your region

const getSecurityGroupId = async (instanceName: string): Promise<string> => {
  try {
    const instance = await fetchInstance(instanceName, ec2Client);

    if (!instance) {
      throw new Error(`No instance found with the name: ${instanceName}`);
    }

    const securityGroupId = instance.SecurityGroups?.[0]?.GroupId;

    if (!securityGroupId) {
      throw new Error(`No security group found for instance: ${instanceName}`);
    }

    return securityGroupId;
  } catch (error) {
    throw error;
  }
}

export const updateInstanceSGRules = async (
  instanceName: string,
  rulesToAdd: SecurityGroupRule[],
  rulesToRemove: SecurityGroupRule[]
) => {

  try {
    const securityGroupId = await getSecurityGroupId(instanceName);

    if (rulesToRemove.length > 0) {
      await ec2Client.send(new RevokeSecurityGroupIngressCommand({
        GroupId: securityGroupId,
        IpPermissions: rulesToRemove,
      }));
    }

    if (rulesToAdd.length > 0) {
      await ec2Client.send(new AuthorizeSecurityGroupIngressCommand({
        GroupId: securityGroupId,
        IpPermissions: rulesToAdd,
      }));
    }
  } catch (error) {
    console.error("Error updating security group rules:", error);
  }
}
