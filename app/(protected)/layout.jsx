"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { CreditsProvider } from "@/context/CreditsContext";
import { NotificationProvider } from "@/context/NotificationContext";

export default function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <CreditsProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </CreditsProvider>
    </ProtectedRoute>
  );
}
