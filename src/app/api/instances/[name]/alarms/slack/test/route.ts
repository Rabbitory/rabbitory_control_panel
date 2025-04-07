import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import axios from "axios";

const appDataPath = path.join(process.cwd(), "src/utils/Slack/appData.json");

export async function POST(request: NextRequest) {
  const body = await request.json();
  const text = body.text;

  if (!text) {
    return new NextResponse("Must have a text in the request body.", {
      status: 400,
    });
  }

  const fileData = await fs.readFile(appDataPath, "utf8");
  const appData = JSON.parse(fileData);
  const webhookUrl = appData.webhookUrl;

  await axios.post(webhookUrl, {
    text,
  });

  return new NextResponse(JSON.stringify({ success: true, text }), {
    status: 200,
  });
}
