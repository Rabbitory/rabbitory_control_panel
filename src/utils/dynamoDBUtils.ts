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
  type: string;
  data: data;
}

interface AlarmRecord {
  id: string;
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
  partitionKey: { [key: string]: string }
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
  partitionKey: { [key: string]: { S: string } }
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
  newBackup: BackupDefinition
) => {
  const client = new DynamoDBClient({ region: process.env.REGION });
  const docClient = DynamoDBDocumentClient.from(client);

  const params = {
    TableName: "rabbitory-instances-metadata",
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

const ensureAlarmsExists = async (instanceId: string) => {
  const client = new DynamoDBClient({ region: process.env.REGION });
  const docClient = DynamoDBDocumentClient.from(client);
  const params = {
    TableName: "RabbitoryInstancesMetadata",
    Key: { instanceId },
    UpdateExpression: "SET alarms = if_not_exists(alarms, :emptyMap)",
    ExpressionAttributeValues: {
      ":emptyMap": {},
    },
    ReturnValues: "UPDATED_NEW" as const,
  };

  await docClient.send(new UpdateCommand(params));
};

export const appendAlarmsSettings = async (
  instanceId: string,
  newAlarm: AlarmSettings
) => {
  await ensureAlarmsExists(instanceId);
  const client = new DynamoDBClient({ region: process.env.REGION });
  const docClient = DynamoDBDocumentClient.from(client);
  console.log(newAlarm.type, newAlarm.data);

  const newId = crypto.randomUUID();
  const newAlarmRecord = { id: newId, data: newAlarm.data };

  const params = {
    TableName: "RabbitoryInstancesMetadata",
    Key: { instanceId },
    UpdateExpression:
      "SET alarms.#alarmType = list_append(if_not_exists(alarms.#alarmType, :emptyList), :newAlarm)",
    ExpressionAttributeNames: {
      "#alarmType": newAlarm.type,
    },
    ExpressionAttributeValues: {
      ":emptyList": [],
      ":newAlarm": [newAlarmRecord],
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

export const deleteAlarmFromDynamoDB = async (
  instanceId: string,
  alarmType: string,
  alarmId: string
) => {
  const client = new DynamoDBClient({ region: process.env.REGION });
  const docClient = DynamoDBDocumentClient.from(client);

  const getParams = {
    TableName: "RabbitoryInstancesMetadata",
    Key: { instanceId },
  };

  const getCommand = new GetCommand(getParams);
  const getResponse = await docClient.send(getCommand);

  if (!getResponse.Item) {
    throw new Error(`Item with instanceId ${instanceId} not found.`);
  }

  const alarms: { [key: string]: AlarmRecord[] } =
    getResponse.Item.alarms || {};
  const alarmArray: AlarmRecord[] = alarms[alarmType] || [];

  const updatedAlarmArray = alarmArray.filter((alarm) => alarm.id !== alarmId);

  const updateParams = {
    TableName: "RabbitoryInstancesMetadata",
    Key: { instanceId },
    UpdateExpression: "SET alarms.#alarmType = :updatedList",
    ExpressionAttributeNames: {
      "#alarmType": alarmType,
    },
    ExpressionAttributeValues: {
      ":updatedList": updatedAlarmArray,
    },
    ReturnValues: "UPDATED_NEW" as const,
  };

  const updateCommand = new UpdateCommand(updateParams);
  const updateResponse = await docClient.send(updateCommand);
  console.log("Alarm deleted successfully!");
  return updateResponse;
};
