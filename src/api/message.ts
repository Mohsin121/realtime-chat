import { api } from "@/lib/api";
import { ApiResponse } from "@/shared/types/api";
import { Message } from "@/shared/types/message";

export function getConversationMessages(
  conversationId: string
) {
  return api.get<ApiResponse<Message[]>>(
    `/api/conversations/${conversationId}/messages`
  );
}

export function sendMessage(
    conversationId: string,
    content: string
  ) {
    return api.post<ApiResponse<Message>>(
      `/api/conversations/${conversationId}/messages`,
      {
        content,
      }
    );
  }