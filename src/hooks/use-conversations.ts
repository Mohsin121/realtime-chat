// hooks/use-conversations.ts
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { markConversationAsRead } from "@/api/conversation";
import { socket, connectSocket } from "@/lib/socket";
import { Conversation } from "@/shared/types/conversation";
import { Message } from "@/shared/types/message";

export function useConversations(selectedConversationId?: string | null, initialConversations: Conversation[]= []) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);

  // Keep a fresh reference to selectedConversationId to avoid stale closures in socket events
  const selectedIdRef = useRef(selectedConversationId);
  useEffect(() => {
    selectedIdRef.current = selectedConversationId;
  }, [selectedConversationId]);


  // Mark selected chat as read locally and in DB
  const selectAndMarkAsRead = useCallback(async (conversationId: string) => {
    setConversations((current) =>
      current.map((item) =>
        item.id === conversationId ? { ...item, unreadCount: 0 } : item
      )
    );

    try {
      await markConversationAsRead(conversationId);
    } catch (error) {
      console.error("Failed to mark conversation as read:", error);
    }
  }, []);

  // Real-time conversation updates
  useEffect(() => {
    connectSocket();

    function handleConversationUpdate(data: {
      conversationId: string;
      lastMessage: Message;
      unreadCount: number;
    }) {
      setConversations((current) => {
        const existingIndex = current.findIndex((item) => item.id === data.conversationId);
        if (existingIndex === -1) return current;

        const isCurrentlySelected = selectedIdRef.current === data.conversationId;
        const target = current[existingIndex];

        const updatedConversation: Conversation = {
          ...target,
          lastMessage: data.lastMessage,
          unreadCount: isCurrentlySelected ? 0 : data.unreadCount,
        };

        // Re-order updated conversation to the top
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
  }, []);

  return {
    conversations,
    setConversations,
    selectAndMarkAsRead,
  };
}