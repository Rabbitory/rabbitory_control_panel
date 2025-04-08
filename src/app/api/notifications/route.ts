// app/api/socket/route.ts

import { NextResponse } from "next/server";
import { Server as IOServer } from "socket.io";

// Force the runtime to Node.js so we can use the built-in server and access raw sockets.
export const runtime = "nodejs";

export async function GET() {
  const res = NextResponse.next();

  // If the socket is not available, we cannot set up Socket.IO.
  if (!res.socket) {
    return new NextResponse("Socket not available", { status: 500 });
  }

  // Check if Socket.IO is already attached
  if (res.socket.server.io) {
    console.log("Socket.IO server already running");
    return new NextResponse("Socket.IO server already running");
  }

  // Initialize a new Socket.IO instance on the underlying HTTP server.
  const io = new IOServer(res.socket.server);
  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Example event handling: when a client sends a message, broadcast it.
    socket.on("message", (msg) => {
      console.log("Received message:", msg);
      socket.broadcast.emit("message", msg);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  console.log("Socket.IO server started");
  return new NextResponse("Socket.IO server started");
}
