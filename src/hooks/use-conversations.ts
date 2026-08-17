"use client";

import { useEffect, useState } from "react";
import { getConversations } from "@/api/conversation";
import { socket } from "@/lib/socket";
import { Conversation } from "@/shared/types/conversation";
import { Message } from "@/shared/types/message";

export function useConversations() {
  const [isLoading, setIsLoading] = useState(true);

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  useEffect(() => {
    async function loadConversations() {
      try {
        const response =
          await getConversations();

        setConversations(response.data);
      } catch (error) {
        console.error(
          "Failed to load conversations:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadConversations();
  }, []);

  useEffect(() => {
    function handleNewMessage(
      message: Message
    ) {
      setConversations((current) => {
        const conversation = current.find(
          (item) => item.id === message.conversationId
        );
      
        if (!conversation) {
          return current;
        }
      
        const updatedConversation: Conversation = {
          ...conversation,
          lastMessage: message,
        };
      
        return [
          updatedConversation,
          ...current.filter(
            (item) => item.id !== message.conversationId
          ),
        ];
      });
    }

    socket.on(
      "message:new",
      handleNewMessage
    );

    return () => {
      socket.off(
        "message:new",
        handleNewMessage
      );
    };
  }, []);

  return {
    conversations,
    isLoading,
  };
}