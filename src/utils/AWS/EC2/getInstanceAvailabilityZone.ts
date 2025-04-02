import { EC2Client } from "@aws-sdk/client-ec2";
import { fetchInstance } from "../EC2/fetchInstance";

export async function getInstanceAvailabilityZone(instanceName: string): Promise<string> {
  // NEEDS FIXED - WAITING FOR UPDATED REGION PASSING
  const client = new EC2Client({region: process.env.REGION || 'us-east-1'});

  try {
    const instance = await fetchInstance(instanceName, client);

    if (!instance) {
      throw new Error(`Instance with name '${instanceName}' not found.`);
    }

    const availabilityZone = instance.Placement?.AvailabilityZone;

    if (!availabilityZone) {
      throw new Error(`Availability zone for instance '${instanceName}' is not available.`);
    }

    if (/[a-zA-Z]/.test(availabilityZone[availabilityZone.length - 1])) {
      return availabilityZone.slice(0, -1);
    }
    
    return availabilityZone;
  } catch (error) {
    console.error(`Error retrieving availability zone for instance '${instanceName}':`, error);
    throw error;
  }
}