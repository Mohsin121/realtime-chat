import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserConversations } from "@/services/conversation.service";
import { verifyAccessToken } from "@/services/token.service";
import { ConversationSidebar } from "@/components/chat/conversation-sidebar";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = await verifyAccessToken(token);
  if (!payload) {
    redirect("/login");
  }

  const conversations = await getUserConversations(payload.sub);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <aside className="w-80 border-r shrink-0 bg-background">
        <ConversationSidebar initialConversations={conversations} />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-muted/10">
        {children}
      </main>
    </div>
  );
}