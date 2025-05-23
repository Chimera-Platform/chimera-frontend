"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";
import { ChatVersionProvider } from "@/context/ChatVersionContext";
import { AvatarProvider } from "@/context/AvatarContext";
import { Toaster } from "sonner";

export function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      enableColorScheme={true}
      storageKey="theme-preference" // Ensures theme is saved to localStorage
    >
      <AuthProvider>
        <AvatarProvider>
          <ChatProvider>
            <ChatVersionProvider>
              <Toaster position="top-right" richColors />
              {children}
            </ChatVersionProvider>
          </ChatProvider>
        </AvatarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
