"use client";

import { useEffect, useState } from "react";



import { socket } from "@/lib/socket";

import { Message } from "@/shared/types/message";
import { getConversationMessages } from "@/api/message";

export function useMessages(
  conversationId: string | null
) {
  const [messages, setMessages] =
    useState<Message[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isSending, setIsSending] =
    useState(false);

  // Load existing messages
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    async function loadMessages() {
      try {
        setIsLoading(true);
        if(!conversationId){
          return;
        }

        const response =
          await getConversationMessages(
            conversationId
          );

        setMessages(response.data);
      } catch (error) {
        console.error(
          "Failed to load messages:",
          error
        );

        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadMessages();
  }, [conversationId]);

  // Socket connection + room + incoming messages
  useEffect(() => {
    if (!conversationId) {
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    function handleNewMessage(
      message: Message
    ) {
      if (
        message.conversationId !==
        conversationId
      ) {
        return;
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        message,
      ]);

      setIsSending(false);
    }

    socket.on(
      "message:new",
      handleNewMessage
    );

    socket.emit(
      "conversation:join",
      conversationId
    );

    return () => {
      socket.off(
        "message:new",
        handleNewMessage
      );

      socket.emit(
        "conversation:leave",
        conversationId
      );
    };
  }, [conversationId]);

  // Send new message
  function send(content: string) {
    if (!conversationId) {
      return;
    }

    const trimmedContent =
      content.trim();

    if (
      !trimmedContent ||
      isSending
    ) {
      return;
    }

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