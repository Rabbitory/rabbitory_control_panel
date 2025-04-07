import { NextRequest, NextResponse } from "next/server";
import { sendSlackMessage } from "@/utils/Slack/webhookUtils";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const text = body.text;

  if (!text) {
    return new NextResponse("Must have a text in the request body.", {
      status: 400,
    });
  }

  try {
    await sendSlackMessage(text);
    return NextResponse.json({ success: true, text });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send test message" },
      { status: 500 }
    );
  }
}
