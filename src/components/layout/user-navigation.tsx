"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logout } from "@/api/auth";
import { useAuth } from "@/context/auth-provider";
import { User } from "@/shared/types/auth";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserNavigationProps {
  user: User;
}

export function UserNavigation({
  user,
}: UserNavigationProps) {
  const router = useRouter();
  const { setUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);

      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const initials = user.name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-4">
      {/* User */}
      <div className="flex items-center gap-3 border-r border-slate-200 pr-4 dark:border-slate-800">
        <Avatar className="h-9 w-9">
          {user.avatar && (
            <AvatarImage
              src={user.avatar}
              alt={user.name}
            />
          )}

          <AvatarFallback>
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="hidden flex-col sm:flex">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {user.name}
          </span>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            {user.email}
          </span>
        </div>
      </div>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className="group flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-800 dark:text-slate-300 dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400"
      >
        <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />

        <span>Logout</span>
      </button>
    </div>
  );
}