import type { Socket } from "socket.io";

export interface AuthedSocket extends Socket {
  data: { userId: string };
}