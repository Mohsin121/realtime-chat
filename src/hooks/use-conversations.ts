"use client";

import { useEffect, useState, useCallback } from "react";
import { getConversations, markConversationAsRead } from "@/api/conversation";
import { socket } from "@/lib/socket";
import { Conversation } from "@/shared/types/conversation";
import { Message } from "@/shared/types/message";

export function useConversations(selectedConversationId?: string | null) {
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    async function loadConversations() {
      try {
        const response = await getConversations();
        setConversations(response.data);
      } catch (error) {
        console.error("Failed to load conversations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadConversations();
  }, []);

  // Handler to clear unread state when a chat is selected
  const selectAndMarkAsRead = useCallback(async (conversationId: string) => {
    // 1. Instantly clear unread badge in state
    setConversations((current) =>
      current.map((item) =>
        item.id === conversationId ? { ...item, unreadCount: 0 } : item
      )
    );

    // 2. Persist lastReadAt timestamp in DB
    try {
      await markConversationAsRead(conversationId);
    } catch (error) {
      console.error("Failed to mark conversation as read:", error);
    }
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    function handleConversationUpdate(data: {
      conversationId: string;
      lastMessage: Message;
      unreadCount: number;
    }) {
      setConversations((current) => {
        const conversation = current.find(
          (item) => item.id === data.conversationId
        );

        if (!conversation) return current;

        const isCurrentlySelected = selectedConversationId === data.conversationId;

        const updatedConversation: Conversation = {
          ...conversation,
          lastMessage: data.lastMessage,
          unreadCount: isCurrentlySelected ? 0 : data.unreadCount,
        };

        return [
          updatedConversation,
          ...current.filter((item) => item.id !== data.conversationId),
        ];
      });
    }

    socket.on("conversation:updated", handleConversationUpdate);

    return () => {
      socket.off("conversation:updated", handleConversationUpdate);
    };
  }, [selectedConversationId]);

  return {
    conversations,
    setConversations,
    selectAndMarkAsRead,
    isLoading,
  };
}