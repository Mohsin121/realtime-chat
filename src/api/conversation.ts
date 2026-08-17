import { api } from "@/lib/api";
import { ApiResponse } from "@/shared/types/api";
import { Conversation } from "@/shared/types/conversation";

export function getConversations() {
  return api.get<ApiResponse<Conversation[]>>(
    "/api/conversations"
  );
}

export function createConversation(userId: string) {
  return api.post<ApiResponse<Conversation>>(
    "/api/conversations",
    {
      userId,
    }
  );
}