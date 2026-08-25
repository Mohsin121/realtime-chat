// app/(dashboard)/chat/_components/conversation-item.tsx
"use client";

import { useAuth } from "@/context/auth-provider";
import { Conversation } from "@/shared/types/conversation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface ConversationItemProps {
  conversation: Conversation;
  selected: boolean;
  onClick: () => void;
  isOnline: boolean;

}

export function ConversationItem({
  conversation,
  selected,
  onClick,
  isOnline
}: ConversationItemProps) {
  const { user } = useAuth();


  const name = conversation.name || conversation.otherUser?.name || "Unknown User";
  const avatar = conversation.avatar || conversation.otherUser?.avatar || undefined;
  
  // Fallback initials for Avatar (e.g. "John Doe" -> "JD")
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const lastMessage = conversation.lastMessage;
  const currentUserId = user?.id;

  // Render proper text preview based on message type
  const getPreviewText = () => {
    if (!lastMessage) return "No messages yet";
    
    let content = lastMessage.content;
    if (lastMessage.type === "IMAGE") content = "📷 Photo";
    if (lastMessage.type === "FILE") content = "📁 Attachment";

    return lastMessage.senderId === currentUserId ? `You: ${content}` : content;
  };

  console.log("online", isOnline)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors ${
        selected ? "bg-muted" : "hover:bg-muted/50"
      }`}
    >
      {/* Avatar Container */}
      <div className="relative shrink-0">
  <Avatar>
    <AvatarImage src={avatar} />
    <AvatarFallback>
      {initials}
    </AvatarFallback>
  </Avatar>

  {isOnline && (
    <span
      className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-600" 
      aria-label="Online"
    />
  )}
</div>

      {/* Details Container */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={`truncate ${
              conversation.unreadCount > 0 ? "font-semibold" : "font-medium"
            }`}
          >
            {name ?? "Unknown"}
          </p>

          {conversation.lastMessage && (
            <span
              className={`shrink-0 text-xs ${
                conversation.unreadCount > 0
                  ? "font-medium text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {formatTime(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p
            className={`min-w-0 truncate text-sm ${
              conversation.unreadCount > 0
                ? "font-medium text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {getPreviewText()}
          </p>

          {conversation.unreadCount > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}