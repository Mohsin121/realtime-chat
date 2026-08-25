"use client";

import { Conversation } from "@/shared/types/conversation";
import { Message } from "@/shared/types/message";

import { useMessages } from "@/hooks/use-messages";
import { useTyping } from "@/hooks/use-typing";

import { ConversationHeader } from "./conversation-header";
import { MessageList } from "./message-list";
import { MessageComposer } from "./message-composer";

interface ChatWindowProps {
  conversation: Conversation;
  initialMessages: Message[];
  currentUserId: string;
}

export function ChatWindow({
  conversation,
  initialMessages,
  currentUserId,
}: ChatWindowProps) {
  const { messages, isSending, send } = useMessages(
    conversation.id,
    initialMessages
  );

  const {
    isTyping,
    startTyping,
    stopTyping,
  } = useTyping(conversation.id, currentUserId);

  return (
    <section className="flex h-full min-w-0 flex-col">
      <ConversationHeader conversation={conversation} />

      {/* Message area */}
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          isTyping={isTyping}
        />

      {/* Typing indicator + composer */}
      
        <MessageComposer
          onSend={send}
          isSending={isSending}
          onTyping={startTyping}
          onStopTyping={stopTyping}
        />
    </section>
  );
}