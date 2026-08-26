import type { Server } from "socket.io";
import { AuthedSocket } from "../types";

const onlineUsers = globalThis.__onlineUsers ?? new Map<string, number>();
globalThis.__onlineUsers = onlineUsers;

export function registerPresenceHandlers(io: Server, socket: AuthedSocket) {
  const userId = socket.data.userId;

  const previousCount = onlineUsers.get(userId) ?? 0;
  onlineUsers.set(userId, previousCount + 1);

  if (previousCount === 0) {
    io.emit("presence:online", { userId });
  }

  socket.on("presence:get", () => {
    socket.emit("presence:initial", { userIds: Array.from(onlineUsers.keys()) });
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
  });
}