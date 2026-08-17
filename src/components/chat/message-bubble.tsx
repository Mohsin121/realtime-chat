"use client";

import { Message } from "@/shared/types/message";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({
  message,
  isOwn,
}: MessageBubbleProps) {
  return (
    <div
      className={`flex ${
        isOwn ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[70%] ${
          isOwn
            ? "items-end"
            : "items-start"
        }`}
      >
        {!isOwn && (
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            {message.sender.name}
          </p>
        )}

        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md bg-muted"
          }`}
        >
          {message.content && (
            <p className="whitespace-pre-wrap break-words text-sm">
              {message.content}
            </p>
          )}
        </div>

        <p
          className={`mt-1 text-[11px] text-muted-foreground ${
            isOwn ? "text-right" : "text-left"
          }`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}