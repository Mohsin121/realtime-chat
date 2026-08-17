"use client";

import { Phone, Video } from "lucide-react";
import { Conversation } from "@/shared/types/conversation";

interface ConversationHeaderProps {
  conversation: Conversation;
}

export function ConversationHeader({
  conversation,
}: ConversationHeaderProps) {
  const name =
    conversation.type === "DIRECT"
      ? conversation.otherUser?.name
      : conversation.name;

  const avatar =
    conversation.type === "DIRECT"
      ? conversation.otherUser?.avatar
      : conversation.avatar;


  return (
    <header className="flex h-16 items-center justify-between border-b px-5">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold">
            {avatar ? (
              <img
                src={avatar}
                alt={name ?? "User"}
                className="h-full w-full object-cover"
              />
            ) : (
              name?.slice(0, 2).toUpperCase() ?? "?"
            )}
          </div>

          {/* {isOnline && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
          )} */}
        </div>

        <div>
          <p className="font-semibold">
            {name ?? "Unknown"}
          </p>

          {/* {conversation.type === "DIRECT" && (
            <p className="text-xs text-muted-foreground">
              {isOnline ? "Online" : "Offline"}
            </p>
          )} */}
        </div>
      </div>

    </header>
  );
}