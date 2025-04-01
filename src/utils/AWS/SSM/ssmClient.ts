import { SSMClient } from "@aws-sdk/client-ssm";

const ssmClients: Record<string, SSMClient> = {};

export function getSSMClient(region: string): SSMClient {
  if (!ssmClients[region]) {
    ssmClients[region] = new SSMClient({ region });
  }
  return ssmClients[region];
}