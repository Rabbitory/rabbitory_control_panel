import { NextRequest, NextResponse } from "next/server";
import { getCurrentSecurityGroupRules } from "@/utils/AWS/Security-Groups/getCurrentSecurityGroupRules";
import { updateInstanceSGRules } from "@/utils/AWS/Security-Groups/updateInstanceSGRules";
import { updateRabbitmqPorts } from "@/utils/RabbitMQ/updateRabbitmqPorts";
import { 
  convertToSecurityGroupRules, 
  convertToUIFirewallRules,
  getSGRulesToAddAndRemove,
  getRabbitmqPortsToAddAndRemove
} from "@/utils/AWS/Security-Groups/conversionsForSG";


export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ name: string }> }
) {
  
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");
  const { name: instanceName } = await params;

  if (!region) {
    return NextResponse.json(
      { message: "Missing region parameter" },
      { status: 400 },
    );
  }

  try {
    // update all these functions to take a region parameter
    const currentSGRules = await getCurrentSecurityGroupRules(instanceName);
    const uiFirewallRules = convertToUIFirewallRules(currentSGRules);
    return NextResponse.json(uiFirewallRules);
  } catch (error) {
    console.error("Error fetching firewall rules:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}


export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ name: string }> }
) {

  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");
  const { name: instanceName } = await params;
  const { rules } = await request.json();

  if (!region) {
    return NextResponse.json(
      { message: "Missing region parameter" },
      { status: 400 },
    );
  }

  try {
    const currentSGRules = await getCurrentSecurityGroupRules(instanceName);
    const newSGRules = convertToSecurityGroupRules(rules);
    const { rulesToAdd, rulesToRemove } = getSGRulesToAddAndRemove(currentSGRules, newSGRules);
    await updateInstanceSGRules(instanceName, rulesToAdd, rulesToRemove);
    
    const { portsToAdd, portsToRemove } = getRabbitmqPortsToAddAndRemove(rulesToAdd, rulesToRemove);
    await updateRabbitmqPorts(instanceName, 'us-east-1', portsToAdd, portsToRemove);

    // re-fetch new AWS Security Group rule
    // convert these fetched rules to sg rules and send to in NextResponse
    return NextResponse.json({ message: "Successfully updated security group and RabbitMQ ports" });
  } catch (error) {
    console.error('Error updating ports:', error);
    return NextResponse.json({ error: `Failed to update security group and RabbitMQ ports: ${error}` }, { status: 500 });
  }
}

