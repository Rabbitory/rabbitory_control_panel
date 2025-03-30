import axios from "axios";
import { storeToDynamoDB } from "../dynamoDBUtils";
import {
  waitUntilInstanceRunning,
  EC2Client,
  DescribeInstancesCommand,
} from "@aws-sdk/client-ec2";
import { encrypt, decrypt } from "../encrypt";

export async function pollRabbitMQServerStatus(
  instanceId: string | undefined,
  instanceName: string,
  username: string,
  password: string,
  region: string
) {
  const ec2Client = new EC2Client({ region });
  await waitUntilInstanceRunning(
    { client: ec2Client, maxWaitTime: 3000 },
    { InstanceIds: instanceId ? [instanceId] : undefined }
  );

  const describeParams = {
    InstanceIds: instanceId ? [instanceId] : undefined,
  };
  const describeCommand = new DescribeInstancesCommand(describeParams);
  const response = await ec2Client.send(describeCommand);

  if (
    !response.Reservations ||
    response.Reservations.length === 0 ||
    !response.Reservations[0].Instances ||
    response.Reservations[0].Instances.length === 0
  ) {
    console.error("No instance information found.");
    return;
  }

  const instance = response.Reservations[0].Instances[0];
  const rabbitUrl = `http://${instance.PublicDnsName}:15672/api/health/checks/port-listener/15672`;
  const interval = 5000;
  const timeout = 120000;
  const startTime = Date.now();
  let loggedNotReady = false;
  while (Date.now() - startTime < timeout) {
    try {
      const response = await axios.get(rabbitUrl, {
        auth: {
          username,
          password,
        },
      });
      if (
        response.data &&
        response.data.status === "ok" &&
        instanceId !== undefined
      ) {
        console.log("RabbitMQ is up; storing metadata in DynamoDB...");

        const encryptedUsername = encrypt(username);
        const encryptedPassword = encrypt(password);

        if (encryptedUsername && encryptedPassword) {
          await storeToDynamoDB(
            "RabbitoryInstancesMetadata",
            { instanceId, instanceName, encryptedUsername, encryptedPassword },
            region
          );
        }
        return; // Stop polling once the server is up and metadata stored.
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNREFUSED") {
          if (!loggedNotReady) {
            console.log("RabbitMQ not ready yet... ECONNREFUSED");
            loggedNotReady = true;
          }
        } else {
          console.log(
            "RabbitMQ is up, waiting for metadata to be available..."
          );
        }
      } else {
        console.log("Unexpected error:", error);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  console.log("Polling timed out; RabbitMQ server did not come up in time.");
}
