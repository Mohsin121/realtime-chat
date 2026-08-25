"use client";

import { useRouter, useParams } from "next/navigation";
import { Conversation } from "@/shared/types/conversation";
import { ConversationItem } from "./conversation-item";
import { NewConversationModal } from "./new-conversation-modal";
import { createConversation } from "@/api/conversation";
import { useConversations } from "@/hooks/use-conversations";
import { usePresence } from "@/hooks/use-presence";

interface ConversationSidebarProps {
  initialConversations: Conversation[];
}

export function ConversationSidebar({ initialConversations }: ConversationSidebarProps) {
  const router = useRouter();
  const params = useParams();
  const currentId = params?.conversationId as string | undefined;
  const { isOnline } = usePresence();

  // Hydrate useConversations with the server-fetched data
  const { conversations, selectAndMarkAsRead } = useConversations(
    currentId, initialConversations
  );

  const handleSelect = (id: string) => {
    selectAndMarkAsRead(id);
    router.push(`/chat/${id}`);
  };


  const handleStartChatApi = async (targetUserId: string): Promise<void> => {
    try {
      const response = await createConversation(targetUserId);
      const conversation = response.data;
      router.push(`/chat/${conversation.id}`);
    } catch (error) {
      console.error("Error while creating chat:", error);
    }
  };

  return (
    <aside className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-lg font-bold">Chats</h1>
        <NewConversationModal onStartChat={handleStartChatApi} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No conversations yet
          </div>
        ) : (
          conversations.map((c) => (
            <ConversationItem
              key={c.id}
              conversation={c}
              selected={c.id === currentId} // Fixed variable name from 'chat.id' to 'c.id'
              onClick={() => handleSelect(c.id)} // Clears unread badge + navigates
              isOnline={c.otherUser ? isOnline(c.otherUser.id) : false}

            />
          ))
        )}
      </div>
    </aside>
  );
}