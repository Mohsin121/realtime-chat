import { parseCookie } from "cookie";
import type { Socket } from "socket.io";
import { verifyAccessToken } from "@/services/token.service";

export function authMiddleware(socket: Socket, next: (err?: Error) => void) {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) return next(new Error("Unauthorized: Missing cookie header"));

    const cookies = parseCookie(cookieHeader);
    const accessToken = cookies.accessToken;
    if (!accessToken) return next(new Error("Unauthorized: Missing access token"));

    const payload = verifyAccessToken(accessToken);
    if (!payload) return next(new Error("Unauthorized: Invalid or expired token"));

    socket.data.userId = payload.sub;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
}