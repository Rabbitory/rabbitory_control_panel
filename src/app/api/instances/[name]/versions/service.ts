import { EC2Client } from "@aws-sdk/client-ec2";
import axios from "axios";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { GetVersionsParams, Versions } from "./types";

export async function getVersions({
  instanceName,
  region,
  username,
  password,
}: GetVersionsParams): Promise<Versions> {
  const ec2Client = new EC2Client({ region });

  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance || !instance.PublicDnsName) {
    throw new Error(`No instance found with name: ${instanceName}`);
  }
  const publicDns = instance.PublicDnsName;
  const rabbitUrl = `http://${publicDns}:15672/api/overview`;
  const response = await axios.get(rabbitUrl, {
    auth: {
      username,
      password,
    },
  });

  return response.data;
}
