import { EC2Client } from "@aws-sdk/client-ec2";

export interface DeleteInstanceParams {
  instanceId: string;
  groupName: string;
  ec2Client: EC2Client;
  instanceName: string;
}
