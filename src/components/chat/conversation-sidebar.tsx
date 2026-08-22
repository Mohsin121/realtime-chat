"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Conversation } from "@/shared/types/conversation";
import { ConversationItem } from "./conversation-item";
import { NewConversationModal } from "./new-conversation-modal";
import { User } from "@/shared/types/auth";
import { createConversation } from "@/api/conversation";
import { toast } from "sonner";

interface ConversationSidebarProps {
  initialConversations: Conversation[];
}

export function ConversationSidebar({ initialConversations }: ConversationSidebarProps) {
  const router = useRouter();
  const params = useParams();
  const currentId = params?.conversationId as string | undefined;

  const [conversations] = useState<Conversation[]>(initialConversations);

  
  const handleStartChatApi = async (targetUserId: string): Promise<void> => {
    try {
      const response = await createConversation(targetUserId);
      const conversation = response.data;
      router.push(`/chat/${conversation.id}`);
      router.refresh();
    } catch (error) {
      console.log("Error while creating chat", error)
      // toast.error(error)
    }
   
  };

  return (
    <aside className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-lg font-bold">Chats</h1>
        <NewConversationModal
          onStartChat={handleStartChatApi}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No conversations yet</div>
        ) : (
          conversations.map((c) => (
            <ConversationItem
              key={c.id}
              conversation={c}
              selected={c.id === currentId}
              onClick={() => router.push(`/chat/${c.id}`)}
            />
          ))
        )}
      </div>
    </aside>
  );
}