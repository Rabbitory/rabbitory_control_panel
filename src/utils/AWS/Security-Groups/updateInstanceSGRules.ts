import { 
  EC2Client, 
  AuthorizeSecurityGroupIngressCommand, 
  RevokeSecurityGroupIngressCommand,
} from "@aws-sdk/client-ec2";
import { SecurityGroupRule } from "../../../types/firewall";
import { fetchInstance } from "../EC2/fetchInstance";



const getSecurityGroupId = async (instanceName: string, ec2Client: EC2Client): Promise<string> => {
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
  region: string,
  rulesToAdd: SecurityGroupRule[],
  rulesToRemove: SecurityGroupRule[]
): Promise<void> => {

  const ec2Client = new EC2Client({ region });

  try {
    const securityGroupId = await getSecurityGroupId(instanceName, ec2Client);

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
