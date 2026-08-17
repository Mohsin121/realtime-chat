"use client";

import { useState } from "react";
import { ConversationSidebar } from "@/components/chat/conversation-sidebar";
import { ChatWindow } from "@/components/chat/chat-window";
import { useConversations } from "@/hooks/use-conversations";

export default function ChatPage() {
  const {
    conversations,
    isLoading,
  } = useConversations();

  const [
    selectedConversationId,
    setSelectedConversationId,
  ] = useState<string | null>(null);

  const selectedConversation =
    conversations.find(
      (conversation) =>
        conversation.id ===
        selectedConversationId
    ) ?? null;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ConversationSidebar
        conversations={conversations}
        selectedConversationId={
          selectedConversationId
        }
        onSelectConversation={
          setSelectedConversationId
        }
        isLoading={isLoading}
      />

      <ChatWindow
        conversationId={
          selectedConversationId
        }
        conversation={selectedConversation}
      />
    </div>
  );
}