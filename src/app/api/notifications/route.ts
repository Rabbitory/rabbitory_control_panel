import eventEmitter from "@/utils/eventEmitter";
import { NextResponse } from "next/server";
import { addEvent } from "@/utils/eventBackups";
import { Notification } from "@/types/notification";

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`: initial ping\n\n`));
      console.log("SSE client connected");
      const onEvent = (payload: Notification) => {
        const sseMessage = `data: ${JSON.stringify(payload)}\n\n`;
        controller.enqueue(encoder.encode(sseMessage));
      };

      eventEmitter.on("notification", onEvent);

      const heartbeatInterval = setInterval(() => {
        const pingMessage = `: ping\n\n`;
        controller.enqueue(encoder.encode(pingMessage));
      }, 30000); // every 30 seconds

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
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
  addEvent(event);

  return NextResponse.json({ status: "ok" });
}
