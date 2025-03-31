import { 
  EC2Client, 
  AuthorizeSecurityGroupIngressCommand, 
  RevokeSecurityGroupIngressCommand,
} from "@aws-sdk/client-ec2";
import { SecurityGroupRule } from "../../../types/firewall";
import { fetchInstance } from "../EC2/fetchInstance";


// Define AWS region
const ec2Client = new EC2Client({ region: "us-east-1" }); // Change to your region

// Function to update security group rules
// export async function updateInstanceSGRules(instanceId: string, newRules: SecurityGroupRule[]) {
//   const securityGroupId = await getSecurityGroupId(instanceId);
//   if (!securityGroupId) {
//     console.error("No security group found for instance:", instanceId);
//     return;
//   }

//   try {
//     // Step 1: Add the new rules first
//     await ec2Client.send(new AuthorizeSecurityGroupIngressCommand({
//       GroupId: securityGroupId,
//       IpPermissions: newRules,
//     }));

//     console.log("New security group rules added successfully.");

//     // Step 2: Revoke old rules only after adding new ones
//     await ec2Client.send(new RevokeSecurityGroupIngressCommand({
//       GroupId: securityGroupId,
//       IpPermissions: [], // Empty array revokes all rules
//     }));

//     console.log("All old security group rules revoked.");
//   } catch (error) {
//     console.error("Error updating security group rules:", error);
//   }
// }


export async function updateInstanceSGRules(instanceName: string, newRules: SecurityGroupRule[]) {
  const instance = await fetchInstance(instanceName, ec2Client);

  if (!instance) {
    console.error(`No instance found with the name: ${instanceName}`);
    return;
  }

  // Retrieve the security group ID from the first security group in the instance
  const securityGroupId = instance.SecurityGroups?.[0]?.GroupId;

  if (!securityGroupId) {
    console.error(`No security group found for instance: ${instanceName}`);
    return;
  }

  try {
    // Step 1: Add the new rules first
    await ec2Client.send(new AuthorizeSecurityGroupIngressCommand({
      GroupId: securityGroupId,
      IpPermissions: newRules,
    }));

    console.log("New security group rules added successfully.");

    // Step 2: Revoke old rules only after adding new ones
    await ec2Client.send(new RevokeSecurityGroupIngressCommand({
      GroupId: securityGroupId,
      IpPermissions: [], // Empty array revokes all rules
    }));

    console.log("All old security group rules revoked.");
  } catch (error) {
    console.error("Error updating security group rules:", error);
  }
}
