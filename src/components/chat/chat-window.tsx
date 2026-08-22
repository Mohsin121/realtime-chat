"use client";

import { Conversation } from "@/shared/types/conversation";
import { Message } from "@/shared/types/message";
import { useMessages } from "@/hooks/use-messages";
import { ConversationHeader } from "./conversation-header";
import { MessageList } from "./message-list";
import { MessageComposer } from "./message-composer";

interface ChatWindowProps {
  conversation: Conversation;
  initialMessages: Message[];
  currentUserId: string;
}

export function ChatWindow({ conversation, initialMessages, currentUserId }: ChatWindowProps) {
  const { messages, isSending, send } = useMessages(conversation.id, initialMessages);

  return (
    <section className="flex flex-col h-full min-w-0">
      <ConversationHeader conversation={conversation} />
      <MessageList messages={messages} currentUserId={currentUserId} />
      <MessageComposer onSend={send} isSending={isSending} />
    </section>
  );
}