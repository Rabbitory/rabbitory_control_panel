import { NextResponse } from "next/server";
import { getCurrentSecurityGroupRules } from "@/utils/AWS/Security-Groups/getCurrentSecurityGroupRules";
import { 
  convertToSecurityGroupRules, 
  convertToUIFirewallRules,
  getSGRulesToAddAndRemove,
  convertToRabbitmqPorts
} from "@/utils/AWS/Security-Groups/conversionsForSG";
import { updateInstanceSGRules } from "@/utils/AWS/Security-Groups/updateInstanceSGRules";
import { updateRabbitmqPorts } from "@/utils/RabbitMQ/updateRabbitmqPorts";


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

  try {
    const currentSGRules = await getCurrentSecurityGroupRules(name);
    const newSGRules = convertToSecurityGroupRules(rules);

    const { rulesToAdd, rulesToRemove } = getSGRulesToAddAndRemove(currentSGRules, newSGRules);

    // Update EC2 security group
    await updateInstanceSGRules(name, rulesToAdd, rulesToRemove);

    // Update RabbitMQ ports
    const rabbitmqPortsToAdd = convertToRabbitmqPorts(rulesToAdd);
    const rabbitmqPortsToRemove = convertToRabbitmqPorts(rulesToRemove);
    await updateRabbitmqPorts(name, 'us-east-1', rabbitmqPortsToAdd, rabbitmqPortsToRemove);

    return NextResponse.json({ message: "Successfully updated security group and RabbitMQ ports" });

  } catch (error) {
    console.error('Error updating ports:', error);
    return NextResponse.json({ error: `Failed to update security group and RabbitMQ ports: ${error}` }, { status: 500 });
  }
}

