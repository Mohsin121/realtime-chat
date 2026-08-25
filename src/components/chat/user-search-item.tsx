"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User } from "@/shared/types/auth";
import { Loader2, MessageSquarePlus } from "lucide-react";

interface UserSearchItemProps {
  user: Omit<User, "createdAt">;
  onSelect: (userId: string) => void;
  isLoading?: boolean;
  isOnline?: boolean;
}

export function UserSearchItem({
  user,
  onSelect,
  isLoading = false,
  isOnline,
}: UserSearchItemProps) {
  // Generate 2-letter initials fallback (e.g., "John Doe" -> "JD")
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div
      onClick={() => !isLoading && onSelect(user.id)}
      className={cn(
        "flex items-center justify-between gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-accent/60 focus-visible:outline-none focus-visible:bg-accent/60",
        isLoading && "opacity-70 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar with optional online status badge */}
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
            <AvatarFallback className="font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          {isOnline && (
            <span
              className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background"
              title="Online"
            />
          )}
        </div>

        {/* User Details */}
        <div className="flex flex-col min-w-0">
          <span className="truncate text-sm font-medium text-foreground">
            {user.name}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <Button
        type="button"
        size="icon"
        variant="ghost"
        disabled={isLoading}
        onClick={(e) => {
          e.stopPropagation(); // Prevents double firing if container is clicked
          onSelect(user.id);
        }}
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageSquarePlus className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}