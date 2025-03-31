import { NextResponse } from "next/server";
import { getCurrentSecurityGroupRules } from "@/utils/AWS/Security-Groups/getCurrentSecurityGroupRules";
import { 
  convertToSecurityGroupRules, 
  convertToUIFirewallRules,
  getRulesToAddAndRemove
} from "@/utils/AWS/Security-Groups/conversionsForSG";
import { updateInstanceSGRules } from "@/utils/AWS/Security-Groups/updateInstanceSGRules";


export async function GET( _request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;

  try {
    const currentSGRules = await getCurrentSecurityGroupRules(name);
    const uiFirewallRules = convertToUIFirewallRules(currentSGRules);
    return NextResponse.json(uiFirewallRules);
  } catch (error) {
    console.error("Error fetching firewall rules:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}


export async function PUT(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const { rules } = await request.json();
  const currentSGRules = await getCurrentSecurityGroupRules(name);
  const newSGRules = convertToSecurityGroupRules(rules);

  const { rulesToAdd, rulesToRemove } = getRulesToAddAndRemove(currentSGRules, newSGRules);

  // update ec2 security group
  await updateInstanceSGRules(name, rulesToAdd, rulesToRemove);

  // update rabbitmq ports



  return NextResponse.json({ message: "Sent a rules response"});
}

