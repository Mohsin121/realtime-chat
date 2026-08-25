import { Skeleton } from "@/components/ui/skeleton";

export default function ChatConversationLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b bg-background p-4">
        <Skeleton className="h-10 w-10 rounded-full" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-hidden p-6">
        <div className="flex">
          <Skeleton className="h-10 w-48 rounded-2xl" />
        </div>

        <div className="flex justify-end">
          <Skeleton className="h-10 w-64 rounded-2xl" />
        </div>

        <div className="flex">
          <Skeleton className="h-12 w-72 rounded-2xl" />
        </div>

        <div className="flex justify-end">
          <Skeleton className="h-10 w-52 rounded-2xl" />
        </div>

        <div className="flex">
          <Skeleton className="h-10 w-40 rounded-2xl" />
        </div>
      </div>

      {/* Composer */}
      <div className="border-t bg-background p-4">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}