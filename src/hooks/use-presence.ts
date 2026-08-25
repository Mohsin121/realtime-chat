"use client";

import { useEffect, useState } from "react";

import { socket, connectSocket } from "@/lib/socket";

export function usePresence() {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    connectSocket();

    function handleInitialPresence(data: { userIds: string[] }) {
      setOnlineUserIds(new Set(data.userIds));
    }

    function handleUserOnline(data: { userId: string }) {
      setOnlineUserIds((current) => {
        const next = new Set(current);
        next.add(data.userId);
        return next;
      });
    }

    function handleUserOffline(data: { userId: string }) {
      setOnlineUserIds((current) => {
        const next = new Set(current);
        next.delete(data.userId);
        return next;
      });
    }

    socket.on("presence:initial", handleInitialPresence);
    socket.on("presence:online", handleUserOnline);
    socket.on("presence:offline", handleUserOffline);

    socket.emit("presence:get");

    return () => {
      socket.off("presence:initial", handleInitialPresence);
      socket.off("presence:online", handleUserOnline);
      socket.off("presence:offline", handleUserOffline);
    };
  }, []);

  const isOnline = (userId: string) => {
    return onlineUserIds.has(userId);
  };

  return {
    onlineUserIds,
    isOnline,
  };
}