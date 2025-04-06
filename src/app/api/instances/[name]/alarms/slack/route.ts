import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const webhookUrl = body.webhookUrl;

  console.log(webhookUrl);
  return new NextResponse(webhookUrl, { status: 200 });
}
