import { EC2Client, TerminateInstancesCommand, waitUntilInstanceTerminated } from "@aws-sdk/client-ec2";
import { NextResponse } from "next/server";

export const deleteBroker = async (id: string, client: EC2Client) => {
  const terminateParams = {
    InstanceIds: [id]
  }

  try {
    const command = new TerminateInstancesCommand(terminateParams);
    await client.send(command);
    // Wait for instance to be terminated first
    await waitUntilInstanceTerminated(
      { client: client, maxWaitTime: 240 },
      { InstanceIds: [id] }
    );

    console.log(`Successfully deleted instance: ${id}`);
    return NextResponse.json(
      { message: `Successfully deleted instance: ${id}` },
      { status: 200 }
    )
  } catch (err) {
    console.log(`Error deleting instance '${id}':`, err);
    return NextResponse.json(
      { message: `Error deleting instance '${id}:'`, err },
      { status: 500 }
    )
  }
}
