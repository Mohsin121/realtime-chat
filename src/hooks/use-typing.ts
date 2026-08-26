"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { socket, connectSocket } from "@/lib/socket";

interface TypingUser {
  userId: string;
}

export function useTyping(
  conversationId: string,
  currentUserId: string
) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  const stopTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    connectSocket();

    function handleTypingDisplay(data: {
      conversationId: string;
      userId: string;
    }) {
      if (data.conversationId !== conversationId) return;
      if (data.userId === currentUserId) return;

      setTypingUsers((current) => {
        if (current.some((user) => user.userId === data.userId)) {
          return current;
        }

        return [...current, { userId: data.userId }];
      });
    }

    function handleTypingHide(data: {
      conversationId: string;
      userId: string;
    }) {
      if (data.conversationId !== conversationId) return;

      setTypingUsers((current) =>
        current.filter((user) => user.userId !== data.userId)
      );
    }

    socket.on("typing:display", handleTypingDisplay);
    socket.on("typing:hide", handleTypingHide);

    return () => {
      socket.off("typing:display", handleTypingDisplay);
      socket.off("typing:hide", handleTypingHide);

      // Clear our local timer
      if (stopTypingTimer.current) {
        clearTimeout(stopTypingTimer.current);
        stopTypingTimer.current = null;
      }

      // Tell server we stopped typing when leaving conversation
      socket.emit("typing:stop", {
        conversationId,
      });
    };
  }, [conversationId, currentUserId]);

  const startTyping = () => {
    if (!conversationId) return;

    socket.emit("typing:start", {
      conversationId,
    });

    // Reset the previous timer
    if (stopTypingTimer.current) {
      clearTimeout(stopTypingTimer.current);
    }

    // Automatically stop after 800ms without another keystroke
    stopTypingTimer.current = setTimeout(() => {
      socket.emit("typing:stop", {
        conversationId,
      });

      stopTypingTimer.current = null;
    }, 1000);
  };

  const stopTyping = () => {
    if (!conversationId) return;

    // Cancel automatic stop timer
    if (stopTypingTimer.current) {
      clearTimeout(stopTypingTimer.current);
      stopTypingTimer.current = null;
    }

    // Stop immediately
    socket.emit("typing:stop", {
      conversationId,
    });
  };
 
  return {
    typingUsers,
    isTyping: typingUsers.length > 0,
    startTyping,
    stopTyping,
  };
}