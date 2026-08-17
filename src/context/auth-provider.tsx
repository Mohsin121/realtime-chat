"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { me } from "@/api/auth";
import { User } from "@/shared/types/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  initialUser = null,
  children,
}: {
  initialUser?: User | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  // If initialUser was passed from server, we are NOT loading.
  const [loading, setLoading] = useState<boolean>(!initialUser);

  useEffect(() => {
    // Skip client fetch if initialUser was provided by server layout
    if (initialUser) return;

    me()
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [initialUser]);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}