import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { parseCookie } from "cookie";
import { verifyAccessToken } from "@/services/token.service";
import { prisma } from "@/lib/prisma";
import { createMessage } from "@/services/message.service";

const httpServer = createServer();
const onlineUsers = new Map<string, number>();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

// Authentication Middleware
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

io.on("connection", (socket) => {
  const userId = socket.data.userId as string;
  console.log(`User ${userId} connected (${socket.id})`);

  // 1. Join personal channel for user-level notifications (Sidebar, Unread badges)
  socket.join(`user:${userId}`);

  const previousCount = onlineUsers.get(userId) ?? 0;

onlineUsers.set(userId, previousCount + 1);

if (previousCount === 0) {
  io.emit("presence:online", {
    userId,
  });
}

  // 2. Join specific conversation room when viewing
  socket.on("conversation:join", async (conversationId: string) => {
    try {
      const isMember = await prisma.conversationMember.findUnique({
        where: {
          conversationId_userId: { conversationId, userId },
        },
      });

      if (!isMember) {
        socket.emit("error", "You are not a member of this conversation");
        return;
      }

      socket.join(`conversation:${conversationId}`);
    } catch (err) {
      console.error("Error joining conversation room:", err);
    }
  });

  socket.on("conversation:leave", (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
  });

  socket.on("typing:start", ({ conversationId }: { conversationId: string }) => {
    socket.to(`conversation:${conversationId}`).emit("typing:display", {
      conversationId,
      userId,
    });
  });

  socket.on("typing:stop", ({ conversationId }: { conversationId: string }) => {
    socket.to(`conversation:${conversationId}`).emit("typing:hide", {
      conversationId,
      userId,
    });
  });

  // 3. Handle sending messages

socket.on("message:send", async ({ conversationId, content }) => {
  try {
    const message = await createMessage(conversationId, userId, { content });

    // 1. Broadcast to active chat room
    io.to(`conversation:${conversationId}`).emit("message:new", message);

    // 2. Fetch ALL members (including sender)
    const members = await prisma.conversationMember.findMany({
      where: { conversationId },
      select: { userId: true, lastReadAt: true },
    });

    // 3. Emit sidebar updates to everyone
    for (const member of members) {
      const isSender = member.userId === userId;

      let unreadCount = 0;

      if (!isSender) {
        unreadCount = await prisma.message.count({
          where: {
            conversationId,
            createdAt: member.lastReadAt
              ? { gt: member.lastReadAt }
              : undefined,
          },
        });
      }

      io.to(`user:${member.userId}`).emit("conversation:updated", {
        conversationId,
        lastMessage: message,
        unreadCount,
      });
    }
  } catch (error) {
    console.error("Failed to send message:", error);
    socket.emit("message:error", {
      conversationId,
      message: error instanceof Error ? error.message : "Failed to send message",
    });
  }
});

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

    io.emit("presence:offline", {
      userId,
    });
  } else {
    onlineUsers.set(userId, newCount);
  }

  console.log(`User ${userId} disconnected (${socket.id})`);
});
});

httpServer.listen(4000, () => {
  console.log("Socket.IO server running on port 4000");
});