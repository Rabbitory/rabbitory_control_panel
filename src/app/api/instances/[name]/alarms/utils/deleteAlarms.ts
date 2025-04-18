import { EC2Client } from "@aws-sdk/client-ec2";

import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { stopMetricsMonitoring } from "@/utils/RabbitMQ/monitorMetrics";
import { deleteAlarmFromDynamoDB } from "@/utils/dynamoDBUtils";
import { DeleteAlarmsParams } from "../types";

export default async function deleteAlarms({
  region,
  type,
  alarmId,
  instanceName,
}: DeleteAlarmsParams) {
  const client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, client);

  if (!instance || !instance.InstanceId) {
    throw new Error(`Instance not found: ${instanceName}`);
  }

  stopMetricsMonitoring(alarmId);
  await deleteAlarmFromDynamoDB(instance.InstanceId, type, alarmId);
}
