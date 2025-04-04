import eventEmitter from "@/utils/eventEmitter";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      console.log("SSE client connected");
      const onEvent = (data: { type: string; payload: any }) => {
        const { type, payload } = data;
        console.log("Received event:", type, payload);
        const sseMessage = `event: ${data.type}\ndata: ${JSON.stringify(
          data.payload
        )}\n\n`;
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
