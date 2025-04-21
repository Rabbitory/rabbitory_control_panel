import { EC2Client } from "@aws-sdk/client-ec2";

import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { Alarm } from "@/types/alarms";
import { startMetricsMonitoring } from "@/utils/RabbitMQ/monitorMetrics";
import { decrypt } from "@/utils/encrypt";
import { appendAlarmsSettings, fetchFromDynamoDB } from "@/utils/dynamoDBUtils";
import { AddAndStartAlarmsParams } from "../types";

export default async function addAndStartAlarms({
  region,
  alarmData,
  instanceName,
}: AddAndStartAlarmsParams) {
  const client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, client);

  if (!instance || !instance.InstanceId) {
    throw new Error(`Instance not found: ${instanceName}`);
  }

  const response = await appendAlarmsSettings(instance.InstanceId, alarmData);

  const metadata = await fetchFromDynamoDB("rabbitory-instances-metadata", {
    instanceId: instance.InstanceId,
  });

  const encryptedUsername = metadata.Item?.encryptedUsername;
  const encryptedPassword = metadata.Item?.encryptedPassword;
  const publicDns = instance.PublicDnsName;
  const type = alarmData.type;

  if (!encryptedUsername || !encryptedPassword || !publicDns) {
    throw new Error("RabbitMQ credentials not found");
  }

  const username = decrypt(encryptedUsername);
  const password = decrypt(encryptedPassword);
  const alarms = response.Attributes?.alarms;
  // we append the newest alarm, so order is maintained
  const newAlarm: Alarm = alarms[type]?.slice(-1)[0];

  await startMetricsMonitoring(
    instance.InstanceId,
    region,
    publicDns,
    username,
    password,
    newAlarm,
    alarmData.type
  );

  return response.Attributes?.alarms;
}
