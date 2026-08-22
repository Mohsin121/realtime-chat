import { ChatWindow } from "@/components/chat/chat-window";
import { getConversationById } from "@/services/conversation.service";
import { getConversationMessages } from "@/services/message.service";
import { verifyAccessToken } from "@/services/token.service";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

interface ChatConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ChatConversationPage({
  params,
}: ChatConversationPageProps) {
  const { conversationId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) redirect("/login");
  const payload = await verifyAccessToken(token);
  if (!payload) redirect("/login");

  // Fetch metadata and messages in parallel on the server
  const [conversation, initialMessages] = await Promise.all([
    getConversationById(conversationId, payload.sub),
    getConversationMessages(conversationId, payload.sub),
  ]);

  if (!conversation) {
    notFound();
  }

  return (
    <ChatWindow
      conversation={conversation}
      initialMessages={initialMessages}
      currentUserId={payload.sub}
    />
  );
}