import {
  ServiceQuotasClient,
  GetServiceQuotaCommand,
} from "@aws-sdk/client-service-quotas";

const serviceCode = "ec2";
const quotaCode = "L-1216C47A";

const params = {
  ServiceCode: serviceCode,
  QuotaCode: quotaCode,
};

const command = new GetServiceQuotaCommand(params);

export async function getVCPULimit(region: string) {
  const client = new ServiceQuotasClient({ region });

  try {
    const data = await client.send(command);

    if (data.Quota && data.Quota.Value !== undefined) {
      const VCPULimit = data.Quota.Value;
      return VCPULimit;
    } else {
      console.log("Could not retrieve the quota value from the response.");
    }
  } catch (error) {
    console.error("Error getting service quota:", error);
  }
}
