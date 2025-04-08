import eventEmitter from "@/utils/eventEmitter";
import { NextResponse } from "next/server";
import { eventBackups } from "@/utils/eventBackups";

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      console.log("SSE client connected");
      const onEvent = (payload: any) => {
        const sseMessage = `data: ${JSON.stringify(payload)}\n\n`;
        controller.enqueue(encoder.encode(sseMessage));
      };

      eventEmitter.on("notification", onEvent);

      // Remove listener when the connection is closed to avoid memory leaks
      request.signal.addEventListener("abort", () => {
        eventEmitter.off("notification", onEvent);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const event = body;

  // Emit the event with the message

  return NextResponse.json({ status: "ok" });
}
