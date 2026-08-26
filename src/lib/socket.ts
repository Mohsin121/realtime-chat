// lib/socket.ts
import { io, Socket } from "socket.io-client";


export const socket: Socket = io({
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"],
});

export function connectSocket() {
  if (!socket.connected) {
    socket.connect();
  }
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}