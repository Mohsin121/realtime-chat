import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 shrink-0 border-r bg-background">
        <div className="flex items-center justify-between border-b p-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>

        <div className="space-y-2 p-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg p-2"
            >
              <Skeleton className="h-11 w-11 shrink-0 rounded-full" />

              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-36" />
              </div>

              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex flex-1 flex-col bg-muted/10">
        <div className="flex items-center gap-3 border-b bg-background p-4">
          <Skeleton className="h-10 w-10 rounded-full" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        <div className="flex-1" />

        <div className="border-t bg-background p-4">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </main>
    </div>
  );
}