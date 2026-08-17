import { useAuth } from "@/context/auth-provider";
import { Conversation } from "@/shared/types/conversation";


interface ConversationItemProps {
    conversation: Conversation;
    selected: boolean;
    onClick: () => void;
  }
  
  export function ConversationItem({
    conversation,
    selected,
    onClick,
  }: ConversationItemProps) {
    const { user } = useAuth();
  
    const name =
      conversation.type === "DIRECT"
        ? conversation.otherUser?.name
        : conversation.name;
  
    const avatar =
      conversation.type === "DIRECT"
        ? conversation.otherUser?.avatar
        : conversation.avatar;
  
    const lastMessage = conversation.lastMessage;
    const currentUserId = user?.id;
    const preview = lastMessage
      ? lastMessage.senderId === currentUserId
        ? `You: ${lastMessage.content ?? ""}`
        : lastMessage.content
      : null;
  
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors ${
          selected ? "bg-muted" : "hover:bg-muted/50"
        }`}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold">
          {avatar ? (
            <img
              src={avatar}
              alt={name ?? "User"}
              className="h-full w-full object-cover"
            />
          ) : (
            (name?.slice(0, 2).toUpperCase() ?? "?")
          )}
        </div>
  
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-medium">{name ?? "Unknown"}</p>
            <span className="shrink-0 text-xs text-muted-foreground">
              {conversation.lastMessage
                ? formatTime(conversation.lastMessage.createdAt)
                : null}
            </span>
          </div>
  
          <p className="truncate text-sm text-muted-foreground">
            {preview ?? "No messages yet"}
          </p>
        </div>
      </button>
    );
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  