"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { socket } from "@/lib/socket";
import { useAuth } from "./auth-provider";

interface SocketContextType {
  isConnected: boolean;
}

const SocketContext =
  createContext<SocketContextType | null>(null);

export function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  const [isConnected, setIsConnected] =
    useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      socket.disconnect();
      setIsConnected(false);
      return;
    }

    function handleConnect() {
      console.log("Socket connected:", socket.id);
      setIsConnected(true);
    }

    function handleDisconnect() {
      console.log("Socket disconnected");
      setIsConnected(false);
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [user, loading]);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error(
      "useSocket must be used inside SocketProvider"
    );
  }

  return context;
}