"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, UserX, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserSearchItem } from "@/components/chat/user-search-item";
import { useDebounce } from "@/hooks/use-debounce";
import { User } from "@/shared/types/auth";
import { searchUsers } from "@/api/user";

interface NewConversationModalProps {
  onStartChat: (userId: string) => Promise<void>;
  triggerBtn?: React.ReactElement;
}

export function NewConversationModal({
  onStartChat,
  triggerBtn,
}: NewConversationModalProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Call API directly inside the effect
  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setIsSearching(false);
        return;
      }
  
      setIsSearching(true);
      try {
        const response = await searchUsers(debouncedQuery);
        
        // Safely check if response has .data or if response IS the array
        const userList = Array.isArray(response) 
          ? response 
          : Array.isArray(response?.data) 
          ? response.data 
          : [];
  
        setResults(userList);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setResults([]); // Always fallback to empty array on error
      } finally {
        setIsSearching(false);
      }
    };
  
    handleSearch();
  }, [debouncedQuery]);

  const handleSelectUser = async (userId: string) => {
    setLoadingUserId(userId);
    try {
      await onStartChat(userId);
      setOpen(false);
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          triggerBtn || (
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          )
        }
      />

      <DialogContent className="sm:max-w-[425px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search people by name or email..."
              className="pl-9 pr-9"
              autoFocus
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        <ScrollArea className="h-[300px] border-t px-2 py-2">
          {!searchQuery.trim() ? (
            <div className="flex flex-col items-center justify-center h-[260px] text-center p-4">
              <Search className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">
                Search for someone to begin messaging
              </p>
            </div>
          ) : isSearching ? (
            <div className="flex flex-col items-center justify-center h-[260px]">
              <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Finding contacts...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[260px] text-center p-4">
              <UserX className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm font-medium">No users found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try searching with a different name or email address.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((user) => (
                <UserSearchItem
                  key={user.id}
                  user={user}
                  isLoading={loadingUserId === user.id}
                  onSelect={handleSelectUser}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}