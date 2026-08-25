
interface User {
  id: string,
  name: string,
  avatar:string | null
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
}