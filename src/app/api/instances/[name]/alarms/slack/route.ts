import { NextRequest, NextResponse } from "next/server";
import { saveWebhookUrl, getWebhookUrl } from "@/utils/Slack/webhookUtils";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const webhookUrl = body.webhookUrl;

  if (!("webhookUrl" in body))
    return new NextResponse("Must have a webhookUrl in the request body.", {
      status: 400,
    });

  try {
    await saveWebhookUrl(webhookUrl);
    return NextResponse.json({
      success: true,
      webhookUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update webhook URL: ${error}` },
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
      { error: `Failed to read webhook URL: ${error}` },
      { status: 500 }
    );
  }
}
