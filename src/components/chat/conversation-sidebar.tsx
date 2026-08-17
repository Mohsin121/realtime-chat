
import { MessageSquare } from "lucide-react";
import { Conversation } from "@/shared/types/conversation";
import { ConversationItem } from "./conversation-item";

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  isLoading: boolean;
}

export function ConversationSidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading,
}: ConversationSidebarProps) {
  return (
    <aside className="flex w-full max-w-sm flex-col border-r bg-background">
      {/* Sidebar Header */}
      <div className="flex h-16 items-center border-b px-5">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />

          <h1 className="text-lg font-semibold">Messages</h1>
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ConversationSkeleton />
        ) : conversations.length === 0 ? (
          <EmptyConversations />
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              selected={conversation.id === selectedConversationId}
              onClick={() => onSelectConversation(conversation.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}



function EmptyConversations() {
  return (
    <div className="flex h-full items-center justify-center p-6 text-center">
      <div>
        <p className="font-medium">No conversations</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Start a conversation with someone.
        </p>
      </div>
    </div>
  );
}

function ConversationSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="flex animate-pulse items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-muted" />

          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-3 w-48 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

