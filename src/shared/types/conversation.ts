import { ConversationType, MessageType } from "@prisma/client";
import { User } from "./auth";
import { Message } from "./message";

export interface Conversation {
  id: string;
  type: "DIRECT" | "GROUP";
  name: string | null;
  avatar: string | null;
  otherUser: User | null;
  lastMessage: ConversationLastMessage | null;
  unreadCount: number;
}

export interface ConversationLastMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  type: MessageType;
  createdAt: string;
}