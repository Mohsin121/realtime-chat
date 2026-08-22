"use client";

import { useEffect, useRef } from "react";

import { Message } from "@/shared/types/message";
import { MessageBubble } from "./message-bubble";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export function MessageList({
  messages,
  currentUserId,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);



  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="font-medium">
            No messages yet
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Send a message to start the conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.senderId === currentUserId}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}