import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { parseCookie } from "cookie";
import { verifyAccessToken } from "@/services/token.service";
import { prisma } from "@/lib/prisma";
import { createMessage } from "@/services/message.service";

const httpServer = createServer();

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
      return next(new Error("Unauthorized: Invalid or expired token")); // 👈 Fixed hanging return null
    }

    // Attach user ID to socket instance
    socket.data.userId = payload.sub;


    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.userId as string;
  console.log(`User ${userId} connected with socket ID ${socket.id}`);

  // Automatically join user's private room for personal notifications
  socket.join(`user:${userId}`);

  // Securely join conversation room
  socket.on("conversation:join", async (conversationId: string) => {
    try {
      // Verify user belongs to this conversation before joining
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

      const room = `conversation:${conversationId}`;
      socket.join(room);
      console.log(`User ${userId} (${socket.id}) joined ${room}`);
    } catch (err) {
      console.error("Error joining conversation room:", err);
    }
  });

  socket.on("conversation:leave", (conversationId: string) => {
    const room = `conversation:${conversationId}`;
    socket.leave(room);
    console.log(`User ${userId} (${socket.id}) left ${room}`);
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

  socket.on(
    "message:send",
    async ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => {
      try {
        const userId = socket.data.userId;
  
        const message = await createMessage(
          conversationId,
          userId,
          {
            content,
          }
        );
  
        io
          .to(`conversation:${conversationId}`)
          .emit("message:new", message);
      } catch (error) {
        console.error(error);
  
        socket.emit("message:error", {
          message:
            error instanceof Error
              ? error.message
              : "Failed to send message",
        });
      }
    }
  );

  socket.on("disconnect", () => {
    console.log(`User ${userId} disconnected (${socket.id})`);
  });

});

httpServer.listen(4000, () => {
  console.log("Socket.IO server running on port 4000");
});