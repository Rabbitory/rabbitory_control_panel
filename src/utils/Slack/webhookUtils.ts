import { promises as fs } from 'fs';
import { appDataPath } from './constants';
import axios from 'axios';

export async function getWebhookUrl(): Promise<string> {
  try {
    const fileData = await fs.readFile(appDataPath, "utf8");
    const appData = JSON.parse(fileData);
    return appData.webhookUrl;
  } catch (error) {
    console.error("Error reading webhook URL:", error);
    return "";
  }
}

// make sure this checks for the file first,
// creates file if doesn't exist
// clears file and rewrites if it does
export async function saveWebhookUrl(webhookUrl: string): Promise<void> {
  try {
    const appData = { webhookUrl };
    await fs.writeFile(appDataPath, JSON.stringify(appData), "utf8");
  } catch (error) {
    console.error("Error saving webhook URL:", error);
    throw new Error("Failed to save webhook URL");
  }
}

export async function sendSlackMessage(text: string): Promise<void> {
  const webhookUrl = await getWebhookUrl();
  if (!webhookUrl) {
    throw new Error('Webhook URL not configured');
  }

  await axios.post(
    webhookUrl,
    { text },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}
