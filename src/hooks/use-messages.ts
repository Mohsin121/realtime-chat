// hooks/use-messages.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { socket, connectSocket } from "@/lib/socket";
import { Message } from "@/shared/types/message";
import { markConversationAsRead } from "@/api/conversation";

export function useMessages(conversationId: string, initialMessages: Message[] = []) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);

 
  // Socket room joining & incoming message listener
  useEffect(() => {
    if (!conversationId) return;

    connectSocket();

    function handleNewMessage(message: Message) {
      if (message.conversationId !== conversationId) return;

      setMessages((current) => {
        // Prevent duplicate append
        if (current.some((m) => m.id === message.id)) return current;
        // Replace matching temp optimistic message if present
        const hasTemp = current.some((m) => m.id.startsWith("temp-"));
        if (hasTemp) {
          return current.map((m) => (m.id.startsWith("temp-") ? message : m));
        }
        return [...current, message];
      });

      setIsSending(false);

      markConversationAsRead(conversationId).catch((error) => {
        console.error("Failed to mark conversation as read:", error);
      });
    }

    function handleMessageError(payload: { conversationId: string; message: string }) {
      if (payload.conversationId === conversationId) {
        setIsSending(false);
        // Remove failed temp message
        setMessages((current) => current.filter((m) => !m.id.startsWith("temp-")));
        console.error("Message send failed:", payload.message);
      }
    }

    socket.emit("conversation:join", conversationId);
    socket.on("message:new", handleNewMessage);
    socket.on("message:error", handleMessageError);

    return () => {
      socket.emit("conversation:leave", conversationId);
      socket.off("message:new", handleNewMessage);
      socket.off("message:error", handleMessageError);
    };
  }, [conversationId]);

  // Send message function with optimistic local update
  const send = useCallback(
    (content: string, currentUser?: { id: string; name?: string; avatar?: string }) => {
      if (!conversationId) return;

      const trimmedContent = content.trim();
      if (!trimmedContent || isSending) return;

      setIsSending(true);
      const now = new Date().toISOString();
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId: currentUser?.id ?? "current-user",       
        content: trimmedContent,
        createdAt: new Date().toISOString(),
        type: "TEXT",
        updatedAt: now,
        sender: {
          id: currentUser?.id ?? "current-user",
          name: currentUser?.name ?? "You",
          avatar: currentUser?.avatar ?? "",
        },
      };

      // Optimistically append locally
      setMessages((prev) => [...prev, optimisticMessage]);

      socket.emit("message:send", {
        conversationId,
        content: trimmedContent,
      });
    },
    [conversationId, isSending]
  );

  return {
    messages,
    isSending,
    send,
  };
}