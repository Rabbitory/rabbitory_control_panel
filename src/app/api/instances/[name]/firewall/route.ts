import { NextResponse } from "next/server";
import { getInstanceSGRules } from "@/utils/AWS/Security-Groups/getInstanceSGRules";
import { getInstanceAvailabilityZone } from "@/utils/AWS/EC2/getInstanceAvailabilityZone";
import { 
  // convertToSecurityGroupRules, 
  convertToUIFirewallRules,
  convertIpPermissionsToSecurityGroupRules
} from "@/utils/AWS/Security-Groups/conversionsForSG";
import { IpPermission } from "@aws-sdk/client-ec2";

export async function GET( _request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;

  try {
    const instanceName = name;
    const region = await getInstanceAvailabilityZone(instanceName); // FIX - IF REGION PASSING CHANGES
    const instanceSGRules = await getInstanceSGRules(instanceName, region);
    if (!instanceSGRules?.IpPermissions) {
      throw new Error("IpPermissions for security group not found.");
    }

    const ipPermissions: IpPermission[] = instanceSGRules.IpPermissions
    const sgRules = convertIpPermissionsToSecurityGroupRules(ipPermissions);    
    const uiFirewallRules = convertToUIFirewallRules(sgRules);
    return NextResponse.json(uiFirewallRules);
  } catch (error) {
    console.error("Error fetching firewall rules:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}


// export async function POST(req: Request, { params }: { params: Promise<{ name: string }> }) {
//   const { name } = await params;

//   // add back in hidden ports: 80, 22, 15672 (don't allow user to toggle off through ui)

// }

