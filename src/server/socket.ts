import "dotenv/config";
import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
import type { Message } from "@prisma/client";

import { authMiddleware } from "./socket/middleware/auth.middleware";
import { registerPresenceHandlers } from "./socket/handlers/presence.handler";
import { registerConversationHandlers } from "./socket/handlers/conversation.handler";
import { registerTypingHandlers } from "./socket/handlers/typing.handler";
import type { AuthedSocket } from "./socket/types";

declare global {
  var __socketIO: Server | undefined;
  var __onlineUsers: Map<string, number> | undefined;
}

export function initializeSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      credentials: true,
    },
    transports: ["websocket"],
  });

  globalThis.__socketIO = io;

  io.use(authMiddleware);

  io.on("connection", (socket) => {
    const authedSocket = socket as AuthedSocket;
    console.log(`User ${authedSocket.data.userId} connected (${socket.id})`);

    socket.join(`user:${authedSocket.data.userId}`);

    registerPresenceHandlers(io, authedSocket);
    registerConversationHandlers(io, authedSocket);
    registerTypingHandlers(authedSocket);

    socket.on("disconnect", () => {
      console.log(`User ${authedSocket.data.userId} disconnected (${socket.id})`);
    });
  });

  return io;
}

export function emitNewMessage(conversationId: string, message: Message) {
  const io = globalThis.__socketIO;
  if (!io) {
    throw new Error("Socket.IO server has not been initialized");
  }
  io.to(`conversation:${conversationId}`).emit("message:new", message);
}