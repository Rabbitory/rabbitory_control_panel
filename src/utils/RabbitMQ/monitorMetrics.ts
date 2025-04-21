import axios from "axios";
import cron from "node-cron";
import { ScheduledTask } from "node-cron";
import { AlarmThresholds } from "@/types/alarms";
import { sendSlackMessage } from "../Slack/webhookUtils";
import { runSSMCommands } from "../AWS/SSM/runSSMCommands";

const getTotalDiskUsage = async (instanceId: string, region: string) => {
  try {
    const result = await runSSMCommands(
      instanceId,
      ["df -h / | tail -1 | awk '{print $5}' | sed 's/%//'"],
      region
    );
    return parseFloat(result.trim());
  } catch (error) {
    console.error("Error checking disk usage:", error);
    throw error;
  }
};

const monitoringTasks = new Map<string, ScheduledTask>();

export async function startMetricsMonitoring(
  instanceId: string,
  region: string,
  publicDns: string,
  username: string,
  password: string,
  alarm: { id: string; data: AlarmThresholds },
  type: "memory" | "storage"
): Promise<void> {
  const rabbitmqUrl = `http://${publicDns}:15672/api/nodes`;
  const reminderInterval = alarm.data.reminderInterval;

  const task = cron.schedule(`*/${reminderInterval} * * * *`, async () => {
    try {
      const response = await axios.get(rabbitmqUrl, {
        auth: { username, password },
      });

      const node = response.data[0];

      if (type === "memory") {
        const memUsagePercent = (node.mem_used / node.mem_limit) * 100;
        if (memUsagePercent > alarm.data.memoryThreshold) {
          // if (memUsagePercent) {
          await sendNotification({
            alarmId: alarm.id,
            type: "memory",
            currentValue: memUsagePercent,
            threshold: alarm.data.memoryThreshold,
            instanceDns: publicDns,
          });
        }
      } else if (type === "storage") {
        const diskUsagePercent = await getTotalDiskUsage(instanceId, region);

        if (diskUsagePercent > alarm.data.storageThreshold) {
          await sendNotification({
            alarmId: alarm.id,
            type: "storage",
            currentValue: diskUsagePercent,
            threshold: alarm.data.storageThreshold,
            instanceDns: publicDns,
          });
        }
      }
    } catch (error) {
      console.error("Error monitoring metrics:", error);
    }
  });

  monitoringTasks.set(alarm.id, task);
}

export function stopMetricsMonitoring(alarmId: string): void {
  try {
    console.log(`Attempting to stop monitoring for alarm ${alarmId}`);
    const task = monitoringTasks.get(alarmId);
    if (task) {
      console.log(`Found task for alarm ${alarmId}, stopping...`);
      task.stop();
      monitoringTasks.delete(alarmId);
      console.log(`Successfully stopped and removed task for alarm ${alarmId}`);
    } else {
      console.log(`No task found for alarm ${alarmId}`);
    }
    console.log(
      "Current monitoring tasks:",
      Array.from(monitoringTasks.keys())
    );
  } catch (error) {
    console.error("Error stopping metrics monitoring:", error);
  }
}

export async function sendNotification(data: {
  alarmId: string;
  type: string;
  currentValue: number;
  threshold: number | undefined;
  instanceDns: string;
}) {
  try {
    const message = [
      `Alarm triggered for ${data.instanceDns}`,
      `Type: ${data.type}`,
      `Current value: ${data.currentValue.toFixed(2)}%`,
      `Threshold: ${data.threshold}%`,
      `Alarm ID: ${data.alarmId}`,
    ].join("\n");
    await sendSlackMessage(message);
    console.log("Alarm triggered:", data);
  } catch (error) {
    console.error("Failed to send notification:", error);
    throw new Error(
      `Failed to send notification: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
