"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ApiKeyModal } from "@/components/dashboard/ApiKeyModal";
import { ReplicateApiKeyModal } from "@/components/canvas/ReplicateApiKeyModal";
import { useCredits } from "@/context/CreditsContext";
import { useNotifications } from "@/context/NotificationContext";

export function DashboardShell({ 
  children, 
  activePage = "dashboard", 
  title = "Dashboard", 
  subtitle,
  backButton,
  actions,
}) {
  const { credits, loading: creditsLoading, error: creditsError, refreshCredits } = useCredits();
  const { notifications, handleNotificationRead, markAllAsRead } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showReplicateApiKeyModal, setShowReplicateApiKeyModal] = useState(false);

  // Toggle sidebar listener
  useEffect(() => {
    const handleToggleSidebar = () => {
      setSidebarOpen(prev => !prev);
    };
    
    document.addEventListener('toggle-sidebar', handleToggleSidebar);
    
    return () => {
      document.removeEventListener('toggle-sidebar', handleToggleSidebar);
    };
  }, []);

  const handleOpenApiKeyModal = () => {
    setShowApiKeyModal(true);
  };

  const handleOpenReplicateApiKeyModal = () => {
    setShowReplicateApiKeyModal(true);
  };

  const handleApiKeyUpdated = () => {
    refreshCredits();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Desktop Sidebar - sabit kalacak */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <Sidebar 
          activePage={activePage} 
          credits={credits} 
          loading={creditsLoading} 
          error={creditsError}
        />
      </div>
      
      {/* Mobile Sidebar - açılır kapanır olacak */}
      <div
        className={`fixed inset-0 flex z-40 md:hidden transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
        style={{ width: "16rem" }}
      >
        <Sidebar 
          activePage={activePage} 
          credits={credits} 
          loading={creditsLoading} 
          error={creditsError}
        />
      </div>

      {/* Main Content - sidebar genişliği kadar margin ekledik */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <Header 
          title={title} 
          subtitle={subtitle}
          backButton={backButton}
          actions={actions}
          notifications={notifications}
          onReadNotification={handleNotificationRead}
          onMarkAllAsRead={markAllAsRead}
          onOpenApiKeyModal={handleOpenApiKeyModal}
          onOpenReplicateApiKeyModal={handleOpenReplicateApiKeyModal}
        />

        {/* Content Area */}
        <ScrollArea className="flex-1 content-area">
          <div className="p-6">
            {children}
          </div>
        </ScrollArea>
      </div>

      {/* API Key Modals */}
      <ApiKeyModal 
        isOpen={showApiKeyModal} 
        onClose={() => setShowApiKeyModal(false)} 
        onApiKeyUpdated={handleApiKeyUpdated}
      />
      
      {/* Replicate API Key Modal */}
      <ReplicateApiKeyModal
        isOpen={showReplicateApiKeyModal}
        onClose={() => setShowReplicateApiKeyModal(false)}
        onApiKeyUpdated={handleApiKeyUpdated}
      />
    </div>
  );
}
