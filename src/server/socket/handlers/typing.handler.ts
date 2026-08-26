import { AuthedSocket } from "../types";

export function registerTypingHandlers(socket: AuthedSocket) {
  const userId = socket.data.userId;

  socket.on("typing:start", ({ conversationId }: { conversationId: string }) => {
    socket.to(`conversation:${conversationId}`).emit("typing:display", { conversationId, userId });
  });

  socket.on("typing:stop", ({ conversationId }: { conversationId: string }) => {
    socket.to(`conversation:${conversationId}`).emit("typing:hide", { conversationId, userId });
  });
}