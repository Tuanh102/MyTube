"use client";

import { SessionProvider } from "next-auth/react";
import { UIProvider } from "@/context/UIContext";
import { SocketProvider } from "@/context/SocketContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UIProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
      </UIProvider>
    </SessionProvider>
  );
}
