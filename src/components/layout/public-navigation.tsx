"use client";

import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";

export function PublicNavigation() {
  return (
    <nav className="flex items-center gap-2">
      <Link
        href="/login"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <LogIn className="h-4 w-4" />
        <span>Login</span>
      </Link>

      <Link
        href="/register"
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        <UserPlus className="h-4 w-4" />
        <span>Register</span>
      </Link>
    </nav>
  );
}