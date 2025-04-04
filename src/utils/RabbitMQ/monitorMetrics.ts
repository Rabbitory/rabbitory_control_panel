import axios from 'axios';
import cron from 'node-cron';

interface AlarmThresholds {
  timeThreshold: number;
  storageThreshold: number;
  reminderInterval: number;
}

export async function startMetricsMonitoring(
  publicDns: string,
  username: string,
  password: string,
  alarm: { id: string; data: AlarmThresholds },
  type: 'memory' | 'storage'
) {
  const rabbitmqUrl = `http://${publicDns}:15672/api/nodes`;
  const reminderInterval = alarm.data.reminderInterval;

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

  return task;
}

export async function sendNotification(data: {
  alarmId: string;
  type: string;
  currentValue: number;
  threshold: number;
  instanceDns: string;
}) {
  try {
    await axios.post(
      'https://hooks.slack.com/services/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',
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
