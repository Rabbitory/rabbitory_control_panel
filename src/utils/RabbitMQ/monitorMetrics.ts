import axios from 'axios';
import cron from 'node-cron';
import { ScheduledTask } from 'node-cron';
import { fetchFromDynamoDB } from '../dynamoDBUtils';
import { decrypt } from '../encrypt';

interface AlarmThresholds {
  timeThreshold: number;
  storageThreshold: number;
  reminderInterval: number;
}

interface Alarm {
  id: string;
  data: AlarmThresholds;
}

interface AlarmList {
  [key: string]: Alarm[];
}

const monitoringTasks = new Map<string, ScheduledTask>();

export async function startMetricsMonitoring(
  publicDns: string,
  username: string,
  password: string,
  alarm: { id: string; data: AlarmThresholds },
  type: 'memory' | 'storage'
): Promise<void> {
  const rabbitmqUrl = `http://${publicDns}:15672/api/nodes`;
  const reminderInterval = alarm.data.reminderInterval;

  // Stop existing task if there is one
  stopMetricsMonitoring(alarm.id);
  const task = cron.schedule(`*/${reminderInterval} * * * *`, async () => {
    try {
      const response = await axios.get(rabbitmqUrl, {
        auth: { username, password }
      });

      const node = response.data[0];

      if (type === 'memory') {
        const memUsagePercent = (node.mem_used / node.mem_limit) * 100;
        // if (memUsagePercent > alarm.data.storageThreshold) {
        if (memUsagePercent) {
          await sendNotification({
            alarmId: alarm.id,
            type: 'memory',
            currentValue: memUsagePercent,
            threshold: alarm.data.storageThreshold,
            instanceDns: publicDns
          });
        }
      } else if (type === 'storage') {
        const diskFreePercent = (node.disk_free / node.disk_free_limit) * 100;
        if (diskFreePercent < alarm.data.storageThreshold) {
          await sendNotification({
            alarmId: alarm.id,
            type: 'storage',
            currentValue: diskFreePercent,
            threshold: alarm.data.storageThreshold,
            instanceDns: publicDns
          });
        }
      }
    } catch (error) {
      console.error('Error monitoring metrics:', error);
    }
  });

  monitoringTasks.set(alarm.id, task);
}

export function stopMetricsMonitoring(alarmId: string): void {
  try {
    const task = monitoringTasks.get(alarmId);
    if (task) {
      task.stop();
      monitoringTasks.delete(alarmId);
    }
  } catch (error) {
    console.error('Error stopping metrics monitoring:', error);
  }
}

export async function initializeAllMonitoring(): Promise<void> {
  try {
    const response = await fetchFromDynamoDB("RabbitoryInstancesMetadata", {});
    if (!response.Item) return;

    const instance = response.Item;
    const alarms = instance.alarms || {};

    const username = decrypt(instance.encryptedUsername);
    const password = decrypt(instance.encryptedPassword);
    const alarmEntries: [string, Alarm[]][] = Object.entries(alarms);

    // Start monitoring for each alarm type
    for (const [alarmType, alarmList] of alarmEntries) {
      for (const alarm of alarmList) {
        await startMetricsMonitoring(
          instance.publicDns,
          username,
          password,
          alarm,
          alarmType as 'memory' | 'storage'
        );
      }
    }
  } catch (error) {
    console.error('Error initializing monitoring:', error);
  }
}

export async function sendNotification(data: {
  alarmId: string;
  type: string;
  currentValue: number;
  threshold: number;
  instanceDns: string;
}) {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error('SLACK_WEBHOOK_URL is not defined');
    }

    await axios.post(
      webhookUrl,
      {
        text: `Alarm triggered for ${data.instanceDns}\nType: ${data.type}\nCurrent value: ${data.currentValue}\nThreshold: ${data.threshold}\nAlarm ID: ${data.alarmId}`
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Alarm triggered:', data);
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw new Error(`Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
