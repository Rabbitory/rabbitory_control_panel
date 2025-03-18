import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

export default async function getUbuntuAmiId(region = process.env.REGION) {
  const client = new SSMClient({ region });
  const parameterName =
    "/aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id";
  const command = new GetParameterCommand({ Name: parameterName });
  const result = await client.send(command);
  return result.Parameter?.Value;
}
