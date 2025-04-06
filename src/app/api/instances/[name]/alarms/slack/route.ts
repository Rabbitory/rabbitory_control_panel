import { NextRequest, NextResponse } from "next/server";
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
    let appData = {};
    try {
      const fileData = await fs.readFile(appDataPath, "utf8");
      appData = JSON.parse(fileData);
    } catch (error) {
      console.log(error);
      console.log("Creating new appData file");
    }

    appData = { webhookUrl };

    await fs.writeFile(appDataPath, JSON.stringify(appData), "utf8");

    return new NextResponse(JSON.stringify({ success: true, webhookUrl }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating appData.json:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to update webhook URL" }),
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    let appData = {};
    try {
      const fileData = await fs.readFile(appDataPath, "utf8");
      appData = JSON.parse(fileData);
    } catch (error) {
      console.log(error);
      return new NextResponse(JSON.stringify({ webhookUrl: "" }), {
        status: 200,
      });
    }

    return new NextResponse(JSON.stringify(appData), { status: 200 });
  } catch (error) {
    console.error("Error reading appData.json:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to read webhook URL" }),
      {
        status: 500,
      },
    );
  }
}
