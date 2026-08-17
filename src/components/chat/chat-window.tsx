"use client";

import { MessageSquare } from "lucide-react";

import { useAuth } from "@/context/auth-provider";
import { useMessages } from "@/hooks/use-messages";

import { MessageList } from "./message-list";
import { MessageComposer } from "./message-composer";
import { Conversation } from "@/shared/types/conversation";
import { ConversationHeader } from "./conversation-header";

interface ChatWindowProps {
  conversationId: string | null;
  conversation: Conversation | null;
}

export function ChatWindow({ conversationId, conversation }: ChatWindowProps) {
  const { user } = useAuth();

  const { messages, isLoading, isSending, send  } = useMessages(conversationId);

  if (!conversationId || !conversation) {
    return (
      <section className="hidden flex-1 items-center justify-center bg-muted/20 md:flex">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>

          <h2 className="mt-4 text-lg font-semibold">Select a conversation</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Choose a conversation from the left to start chatting.
          </p>
        </div>
      </section>
    );
  }

  /*
   * For now we're finding the conversation
   * from the data passed to ChatPage.
   *
   * We'll improve this when we introduce
   * /chat/[conversationId].
   */

  return (
    <section className="flex min-w-0 flex-1 flex-col">

      <ConversationHeader conversation={conversation} />

      <MessageList
        messages={messages}
        isLoading={isLoading}
        currentUserId={user?.id ?? ""}
      />

      <MessageComposer onSend={send} isSending={isSending} />
    </section>
  );
}
