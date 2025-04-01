import {
  SendCommandCommand,
  GetCommandInvocationCommand,
} from "@aws-sdk/client-ssm";
import { getSSMClient } from "./ssmClient";

export async function runSSMCommands(
  instanceId: string,
  commands: string[],
  region: string
): Promise<string> {
  
  const ssmClient = getSSMClient(region);
  const sendCmd = new SendCommandCommand({
    InstanceIds: [instanceId],
    DocumentName: "AWS-RunShellScript",
    Parameters: { commands },
  });
  const response = await ssmClient.send(sendCmd);
  const commandId = response.Command?.CommandId;
  if (!commandId) {
    throw new Error("Error sending command: no command ID returned.");
  }

  // Poll for the command invocation status until it's no longer "InProgress"
  let invocationRes;
  let status = "InProgress";
  while (status === "InProgress") {
    await new Promise((resolve) => setTimeout(resolve, 500));
    invocationRes = await ssmClient.send(
      new GetCommandInvocationCommand({
        CommandId: commandId,
        InstanceId: instanceId,
      })
    );
    status = invocationRes.Status || "InProgress";
  }

  if (status !== "Success" || !invocationRes?.StandardOutputContent) {
    throw new Error(
      `Command failed with status: ${status} - ${JSON.stringify(invocationRes, null, 2)}`
    );
  }

  return invocationRes.StandardOutputContent;
}
