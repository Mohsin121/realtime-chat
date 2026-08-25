"use client";

import { useEffect, useRef } from "react";

import { Message } from "@/shared/types/message";
import { MessageBubble } from "./message-bubble";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isTyping:boolean
}

export function MessageList({
  messages,
  currentUserId,
  isTyping
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
    {isTyping && (
      <div className="mb-6">
    <div className="inline-flex items-center gap-1 rounded-2xl bg-muted px-2 py-2 ">
      <span className="text-xs text-muted-foreground">Typing...</span>

      <span className="flex items-center gap-0.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full" />
      </span>
  </div>
  </div>
)}

      <div ref={bottomRef} />
    </div>
  );
}