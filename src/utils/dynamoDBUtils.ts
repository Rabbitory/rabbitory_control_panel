import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

interface data {
  [key: string]: string;
}

export const storeToDynamoDB = async (
  tableName: string,
  data: data,
  region: string,
) => {
  const client = new DynamoDBClient({ region });
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
