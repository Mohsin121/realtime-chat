import { User } from "./auth";
import { Message } from "./message";

export interface Conversation {
  id: string;
  type: "DIRECT" | "GROUP";

  name: string | null;
  avatar: string | null;

  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;

  otherUser: User | null;
  lastMessage: ConversationLastMessage | null;
}

export interface ConversationLastMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  type: "TEXT" | "IMAGE" | "FILE";
  createdAt: string;
}