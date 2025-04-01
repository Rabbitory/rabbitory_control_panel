import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

type data = Record<string, unknown>;
interface BackupDefinition {
  rabbitmq_version: string;
  timestamp: string;
  trigger: string;
  definitions: data;
}

interface AlarmSettings {
  alarmType: string;
  data: data;
}

export const storeToDynamoDB = async (tableName: string, data: data) => {
  const client = new DynamoDBClient({ region: process.env.REGION });
  const docClient = DynamoDBDocumentClient.from(client);

  try {
    const command = new PutCommand({
      TableName: tableName,
      Item: data,
    });

    const response = await docClient.send(command);
    console.log("data successfully written to DynamoDB");
    return response;
  } catch (err) {
    console.error("Error writing to DynamoDB:", err);
    throw new Error("Failed to store data to DynamoDB");
  }
};

export const fetchFromDynamoDB = async (
  tableName: string,
  partitionKey: { [key: string]: string },
) => {
  const client = new DynamoDBClient({ region: process.env.REGION });
  const docClient = DynamoDBDocumentClient.from(client);
  try {
    console.log("Attempting to fetch from DynamoDB...");
    const command = new GetCommand({
      TableName: tableName,
      Key: partitionKey,
    });
    const response = await docClient.send(command);
    console.log("Item fetched successfully!");
    return response;
  } catch (err) {
    console.error("Error fetching item, item not found", err);
    throw new Error("Failed to fetch data from DynamoDB");
  }
};

export const deleteFromDynamoDB = async (
  tableName: string,
  partitionKey: { [key: string]: { S: string } },
) => {
  const client = new DynamoDBClient({ region: process.env.REGION });

  try {
    console.log("Attempting to delete from DynamoDB...");
    const command = new DeleteItemCommand({
      TableName: tableName,
      Key: partitionKey,
    });

    const response = await client.send(command);
    console.log("Item deleted successfully:", response);
  } catch (err) {
    console.error("Error deleting item:", err);
  }
};

export const appendBackupDefinition = async (
  instanceId: string,
  newBackup: BackupDefinition,
) => {
  const client = new DynamoDBClient({ region: process.env.REGION });
  const docClient = DynamoDBDocumentClient.from(client);

  const params = {
    TableName: "RabbitoryInstancesMetadata",
    Key: { instanceId },
    UpdateExpression:
      "SET backups = list_append(:newBackup, if_not_exists(backups, :emptyList))",
    ExpressionAttributeValues: {
      ":emptyList": [],
      ":newBackup": [newBackup],
    },
    ReturnValues: "UPDATED_NEW" as const,
  };

  try {
    const command = new UpdateCommand(params);
    const response = await docClient.send(command);
    console.log("Backup appended successfully!");
    return response;
  } catch (err) {
    console.error("Error appending backup:", err);
    throw new Error("Failed to append backup to DynamoDB");
  }
};

export const appendAlarmsSettings = async (
  instanceId: string,
  newAlarm: AlarmSettings,
) => {
  const client = new DynamoDBClient({ region: process.env.REGION });
  const docClient = DynamoDBDocumentClient.from(client);

  const params = {
    TableName: "RabbitoryInstancesMetadata",
    Key: { instanceId },
    UpdateExpression:
      "SET alarms = list_append(:newAlarm, if_not_exists(alarms, :emptyList))",
    ExpressionAttributeValues: {
      ":emptyList": [],
      ":newAlarm": [newAlarm],
    },
    ReturnValues: "UPDATED_NEW" as const,
  };

  try {
    const command = new UpdateCommand(params);
    const response = await docClient.send(command);
    console.log("Alarm appended successfully!");
    return response;
  } catch (err) {
    console.error("Error appending alarm:", err);
    throw new Error("Failed to append alarm to DynamoDB");
  }
};
