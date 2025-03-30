import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  DynamoDBDocumentClient,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

interface data {
  [key: string]: string;
}

export const storeToDynamoDB = async (
  tableName: string,
  data: data,
  region: string
) => {
  const client = new DynamoDBClient({ region: region });
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
    console.error("Error fetching item:", err);
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
