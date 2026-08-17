"use client";

import { MessageSquare } from "lucide-react";
import { PublicNavigation } from "./public-navigation";
import { UserNavigation } from "./user-navigation";
import { useAuth } from "@/context/auth-provider";

export function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
            <MessageSquare className="h-5 w-5" />
          </div>

          <span className="text-lg font-bold tracking-tight">
            ChatApp
          </span>
        </div>

        {/* Navigation / Action State */}
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="hidden h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800 sm:block" />
          </div>
        ) : user ? (
          <UserNavigation user={user} />
        ) : (
          <PublicNavigation />
        )}

      </div>
    </header>
  );
}