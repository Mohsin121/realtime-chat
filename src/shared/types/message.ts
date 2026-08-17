import { User } from "./auth";

export interface MessageAttachment {
  id: string;
  messageId: string;
  url: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

export interface MessageReceipt {
  id: string;
  userId: string;
  readAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  type: "TEXT" | "IMAGE" | "FILE";
  createdAt: string;
  updatedAt: string;

  sender: User;
  attachments: MessageAttachment[];
  receipts: MessageReceipt[];
}