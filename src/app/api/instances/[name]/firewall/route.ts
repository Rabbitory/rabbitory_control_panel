import { NextResponse } from "next/server";
import { getCurrentSecurityGroupRules } from "@/utils/AWS/Security-Groups/getCurrentSecurityGroupRules";
import { 
  convertToSecurityGroupRules, 
  convertToUIFirewallRules,
  getRulesToAddAndRemove
} from "@/utils/AWS/Security-Groups/conversionsForSG";


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
  console.log("\nOld rules:", currentSGRules);
  console.log("\nNew Rules:", newSGRules);
  console.log("\nRules to Add:", rulesToAdd);
  console.log("\nRules to Remove:", rulesToRemove);

  return NextResponse.json({ message: "Sent a rules response"});
}

