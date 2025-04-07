import { NextRequest, NextResponse } from "next/server";
import { saveWebhookUrl, getWebhookUrl } from "@/utils/Slack/webhookUtils";
import { promises as fs } from "fs";
import path from "path";

const appDataPath = path.join(process.cwd(), "src/utils/Slack/appData.json");

export async function POST(request: NextRequest) {
  const body = await request.json();
  const webhookUrl = body.webhookUrl;

  if (!webhookUrl)
    return new NextResponse("Must have a webhookUrl in the request body.", {
      status: 400,
    });

  try {
    await saveWebhookUrl(webhookUrl);
    return NextResponse.json({
      success: true,
      webhookUrl
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update webhook URL" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const webhookUrl = await getWebhookUrl();
    return NextResponse.json({ webhookUrl });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read webhook URL" },
      { status: 500 }
    );
  }
}
