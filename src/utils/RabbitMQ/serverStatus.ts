import axios from "axios";
import { storeToDynamoDB } from "../dynamoDBUtils";
import { waitUntilInstanceRunning, EC2Client } from "@aws-sdk/client-ec2";
import { encrypt } from "../encrypt";
import { getDefinitions } from "./backupDefinitions";
import { fetchInstance } from "../AWS/EC2/fetchInstance";
import eventEmitter from "../eventEmitter";
import { deleteEvent } from "../eventBackups";

export async function pollRabbitMQServerStatus(
  instanceId: string | undefined,
  instanceName: string,
  username: string,
  password: string,
  region: string,
) {
  const ec2Client = new EC2Client({ region });
  await waitUntilInstanceRunning(
    { client: ec2Client, maxWaitTime: 3000 },
    { InstanceIds: instanceId ? [instanceId] : undefined },
  );

  let instance = await fetchInstance(instanceName, ec2Client);
  while (!instance || !instance.PublicDnsName) {
    console.log("Instance not ready yet! Waiting for DNS...");
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Re-fetch the instance information
    instance = await fetchInstance(instanceName, ec2Client);
  }
  console.log("Instance is ready!");
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
          const backupDefinitions = await getDefinitions(
            instance.PublicDnsName,
            username,
            password,
          );
          if (backupDefinitions) {
            await storeToDynamoDB("rabbitory-instances-metadata", {
              instanceId,
              instanceName,
              encryptedUsername,
              encryptedPassword,
              backups: [backupDefinitions],
              alarms: {
                memory: [],
                storage: [],
              },
            });
            eventEmitter.emit("notification", {
              message: `${instanceName} has been created.`,
              type: "newInstance",
              status: "success",
              instanceName,
            });

            deleteEvent(instanceName, "newInstance");
          }
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
            "RabbitMQ is up, waiting for metadata to be available...",
          );
        }
      } else {
        eventEmitter.emit("notification", {
          message: `Error creating ${instanceName}.`,
          type: "newInstance",
          status: "error",
          instanceName,
        });

        deleteEvent(instanceName, "newInstance");
        console.log("Unexpected error:", error);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  console.log("Polling timed out; RabbitMQ server did not come up in time.");
}
