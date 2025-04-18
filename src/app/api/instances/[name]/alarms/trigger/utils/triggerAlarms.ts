import { EC2Client } from "@aws-sdk/client-ec2";

import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { sendNotification } from "@/utils/RabbitMQ/monitorMetrics";
import { TriggerAlarmsParams } from "../types";

export default async function triggerAlarms({
  region,
  alarms,
  type,
  instanceName,
}: TriggerAlarmsParams) {
  const ec2Client = new EC2Client({ region });

  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance || !instance.PublicDnsName) {
    throw new Error(`Instance not found: ${instanceName}`);
  }
  const publicDns = instance.PublicDnsName;
  const threshold =
    type === "storage"
      ? alarms.data.storageThreshold
      : alarms.data.memoryThreshold;
  sendNotification({
    alarmId: alarms.id,
    type: type,
    currentValue: 0,
    threshold,
    instanceDns: publicDns,
  });
}
