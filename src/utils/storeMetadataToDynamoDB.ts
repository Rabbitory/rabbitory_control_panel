import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient, } from "@aws-sdk/lib-dynamodb";
import * as argon2 from "argon2";

interface metadataType {
  instanceId: string,
  instanceName: string,
  username: string,
  password: string,
}

const encrypt = async (data: string): Promise<string | null> => {
  try {
    return await argon2.hash(data);
  } catch (err) {
    console.error("Error encrypting data:", err);
    return null;
  }
}

export const storeMetadataToDynamoDB = async (metadata: metadataType, region: string) => {
  const client = new DynamoDBClient({ region: region });
  const docClient = DynamoDBDocumentClient.from(client);

  const hashedUsername = await encrypt(metadata.username);
  const hashedPassword = await encrypt(metadata.password);

  if (hashedUsername && hashedPassword) {
    const securemetadata = {
      ...metadata,
      username: hashedUsername,
      password: hashedPassword
    };

    try {
      const command = new PutCommand({
        TableName: "RabbitoryInstancesMetadata",
        Item: securemetadata
      })

      const response = await docClient.send(command);
      console.log("Metadata successfully written to DynamoDB")
      return response;
    } catch (err) {
      console.error("Error writing to DynamoDB:", err);
      throw new Error("Failed to store metadata to DynamoDB");
    }
  } else {
    console.error("Encryption failed. Metadata not stored to DynamoDB");
    throw new Error("Encryption error occurred");
  }
}


