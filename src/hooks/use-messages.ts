"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { Message } from "@/shared/types/message";
import { getConversationMessages } from "@/api/message";
import { markConversationAsRead } from "@/api/conversation";

export function useMessages(conversationId: string, initialMessages: Message[] = []) {
    const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load existing messages
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    async function loadMessages() {
      try {
        setIsLoading(true);
        const response = await getConversationMessages(conversationId!);
        setMessages(response.data);
        await markConversationAsRead(conversationId!);
      } catch (error) {
        console.error("Failed to load messages:", error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadMessages();
  }, [conversationId]);

  // Socket connection + room events
  useEffect(() => {
    if (!conversationId) return;

    if (!socket.connected) {
      socket.connect();
    }

    function handleNewMessage(message: Message) {
      if (message.conversationId !== conversationId) return;

      // Prevent duplicates
      setMessages((current) =>
        current.some((m) => m.id === message.id) ? current : [...current, message]
      );

      setIsSending(false);

      markConversationAsRead(conversationId!).catch((error) => {
        console.error("Failed to mark conversation as read:", error);
      });
    }

    function handleMessageError(payload: { conversationId: string; message: string }) {
      if (payload.conversationId === conversationId) {
        setIsSending(false);
        console.error("Message send failed:", payload.message);
      }
    }

    socket.on("message:new", handleNewMessage);
    socket.on("message:error", handleMessageError);
    socket.emit("conversation:join", conversationId);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:error", handleMessageError);
      socket.emit("conversation:leave", conversationId);
    };
  }, [conversationId]);

  function send(content: string) {
    if (!conversationId) return;

    const trimmedContent = content.trim();
    if (!trimmedContent || isSending) return;

    setIsSending(true);

    socket.emit("message:send", {
      conversationId,
      content: trimmedContent,
    });
  }

  return {
    messages,
    isLoading,
    isSending,
    send,
  };
}