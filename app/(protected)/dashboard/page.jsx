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
import { ActivityList } from "@/components/dashboard/ActivityList";
import { NotificationsList } from "@/components/dashboard/NotificationsList";
import { QuickActions } from "@/components/dashboard/QuickActions";

// Icons
import {
  FiPenTool,
  FiShoppingBag,
  FiMessageSquare,
} from "react-icons/fi";

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

  // Mock data for dashboard
  const stats = [
    { label: "Profile Views", value: 1240, change: 12.5, increase: true },
    { label: "Messages", value: 35, change: 8.2, increase: true },
    { label: "Marketplace Items", value: 7, change: 2.1, increase: false },
  ];

  const activities = [
    { id: 1, action: "Created a new avatar", time: "2 hours ago", icon: FiPenTool },
    { id: 2, action: "Posted in marketplace", time: "1 day ago", icon: FiShoppingBag },
    { id: 3, action: "Received 5 new messages", time: "2 days ago", icon: FiMessageSquare },
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

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ActivityList activities={activities} />
          <NotificationsList 
            notifications={notifications} 
            onReadNotification={handleNotificationRead} 
            onMarkAllAsRead={markAllAsRead} 
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </DashboardShell>
  );
};

export default DashboardPage;
