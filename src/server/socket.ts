import "dotenv/config";

import { Server } from "socket.io";
import { parseCookie } from "cookie";
import type { Server as HttpServer } from "node:http";

import { verifyAccessToken } from "@/services/token.service";
import { prisma } from "@/lib/prisma";
import type { Message } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __socketIO: Server | undefined;
  // eslint-disable-next-line no-var
  var __onlineUsers: Map<string, number> | undefined;
}

const onlineUsers = globalThis.__onlineUsers ?? new Map<string, number>();
globalThis.__onlineUsers = onlineUsers;

export function initializeSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      credentials: true,
    },
    transports: ["websocket"],
  });

  // Store on globalThis so every module instance
  // (Next.js bundler copy vs tsx/server.ts copy) sees the same server.
  globalThis.__socketIO = io;

  // ----------------------------------------------------
  // AUTHENTICATION
  // ----------------------------------------------------

  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;

      if (!cookieHeader) {
        return next(new Error("Unauthorized: Missing cookie header"));
      }

      const cookies = parseCookie(cookieHeader);
      const accessToken = cookies.accessToken;

      if (!accessToken) {
        return next(new Error("Unauthorized: Missing access token"));
      }

      const payload = verifyAccessToken(accessToken);

      if (!payload) {
        return next(new Error("Unauthorized: Invalid or expired token"));
      }

      socket.data.userId = payload.sub;

      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  // ----------------------------------------------------
  // CONNECTION
  // ----------------------------------------------------

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;

    console.log(`User ${userId} connected (${socket.id})`);

    socket.join(`user:${userId}`);

    const previousCount = onlineUsers.get(userId) ?? 0;
    onlineUsers.set(userId, previousCount + 1);

    if (previousCount === 0) {
      io.emit("presence:online", { userId });
    }

    socket.on("conversation:join", async (conversationId: string) => {
      try {
        const isMember = await prisma.conversationMember.findUnique({
          where: {
            conversationId_userId: {
              conversationId,
              userId,
            },
          },
        });

        if (!isMember) {
          socket.emit("error", "You are not a member of this conversation");
          return;
        }

        socket.join(`conversation:${conversationId}`);
      } catch (error) {
        console.error("Error joining conversation room:", error);
      }
    });

    socket.on("conversation:leave", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on(
      "typing:start",
      ({ conversationId }: { conversationId: string }) => {
        socket.to(`conversation:${conversationId}`).emit("typing:display", {
          conversationId,
          userId,
        });
      }
    );

    socket.on(
      "typing:stop",
      ({ conversationId }: { conversationId: string }) => {
        socket.to(`conversation:${conversationId}`).emit("typing:hide", {
          conversationId,
          userId,
        });
      }
    );

    socket.on("presence:get", () => {
      socket.emit("presence:initial", {
        userIds: Array.from(onlineUsers.keys()),
      });
    });

    socket.on("disconnect", () => {
      const currentCount = onlineUsers.get(userId) ?? 0;
      const newCount = currentCount - 1;

      if (newCount <= 0) {
        onlineUsers.delete(userId);
        io.emit("presence:offline", { userId });
      } else {
        onlineUsers.set(userId, newCount);
      }

      console.log(`User ${userId} disconnected (${socket.id})`);
    });
  });

  return io;
}

// ----------------------------------------------------
// SERVER → CLIENT MESSAGE EVENT
// ----------------------------------------------------

export function emitNewMessage(conversationId: string, message: Message) {
  // Read from globalThis, NOT a module-level variable —
  // this is the piece that was missing before.
  const io = globalThis.__socketIO;

  if (!io) {
    throw new Error("Socket.IO server has not been initialized");
  }

  io.to(`conversation:${conversationId}`).emit("message:new", message);
}