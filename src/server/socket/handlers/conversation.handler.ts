import type { Server } from "socket.io";
import { prisma } from "@/lib/prisma";
import { AuthedSocket } from "../types";

export function registerConversationHandlers(io: Server, socket: AuthedSocket) {
  const userId = socket.data.userId;

  socket.on("conversation:join", async (conversationId: string) => {
    try {
      const isMember = await prisma.conversationMember.findUnique({
        where: { conversationId_userId: { conversationId, userId } },
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
}