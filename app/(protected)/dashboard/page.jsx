"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAvatar } from "@/context/AvatarContext";
import { useChat } from "@/context/ChatContext";
import { useCredits } from "@/context/CreditsContext";
import { useNotifications } from "@/context/NotificationContext";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

// Components
import { AvatarDisplay } from "@/components/dashboard/AvatarDisplay";
import { ChatStats } from "@/components/dashboard/ChatStats";
import { CreditsCard } from "@/components/dashboard/CreditsCard";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { NotificationsList } from "@/components/dashboard/NotificationsList";
import { QuickActions } from "@/components/dashboard/QuickActions";

// Styles
import "./styles.css";

const DashboardPage = () => {
  const router = useRouter();
  const { userAvatars, selectAvatar, selectedAvatar } = useAvatar();
  const { chats } = useChat();
  const { notifications, handleNotificationRead, markAllAsRead } = useNotifications();
  const [totalMessages, setTotalMessages] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Toggle sidebar listener
  useEffect(() => {
    setMounted(true);
  }, []);

  // Real stats from actual user data
  const stats = [
    { label: "Avatars", value: userAvatars?.length || 0 },
    { label: "Chats", value: chats?.length || 0 },
    { label: "Messages", value: totalMessages },
  ];

  // Calculate total messages
  useEffect(() => {
    if (chats && chats.length > 0) {
      let messageCount = 0;
      chats.forEach(chat => {
        if (chat.messages && Array.isArray(chat.messages)) {
          messageCount += chat.messages.length;
        }
      });
      setTotalMessages(messageCount);
    }
  }, [chats]);

  if (!mounted) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <DashboardShell activePage="dashboard" title="Dashboard">
      <div className="space-y-6">
        {/* User Avatars and Chat Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AvatarDisplay 
            userAvatars={userAvatars} 
            selectedAvatar={selectedAvatar} 
            onSelectAvatar={selectAvatar} 
          />
          <ChatStats 
            chatsCount={chats?.length || 0} 
            messagesCount={totalMessages} 
          />
        </div>

        {/* OpenRouter Credits Card */}
        <CreditsCard />

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Notifications */}
        <NotificationsList
          notifications={notifications}
          onReadNotification={handleNotificationRead}
          onMarkAllAsRead={markAllAsRead}
        />

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </DashboardShell>
  );
};

export default DashboardPage;
