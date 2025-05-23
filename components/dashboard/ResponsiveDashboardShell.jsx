import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ApiKeyModal } from "@/components/dashboard/ApiKeyModal";
import { NavigationMenu } from "@/components/shared/NavigationMenu";
import { useCredits } from "@/context/CreditsContext"; // Add credits context import
import ProtectedRoute from "@/components/ProtectedRoute";

export function ResponsiveDashboardShell({ 
  children, 
  activePage = "dashboard", 
  title, 
  notifications = [],
  customHeader = null
}) {
  const [mounted, setMounted] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const { refreshCredits } = useCredits(); // Add credits refresh function
  const { theme } = useTheme();

  // Set mounted state for theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // If not mounted yet, return a simple loading state
  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // Generate page title if not explicitly provided
  const pageTitle = title || (activePage.charAt(0).toUpperCase() + activePage.slice(1).replace('-', ' '));

  const handleApiKeyUpdated = () => {
    // Refresh credits data when API key is updated
    refreshCredits();
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar activePage={activePage} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
          {/* Header with mobile menu */}
          <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm flex-shrink-0">
            {customHeader ? (
              <div className="flex items-center w-full">
                <NavigationMenu activePage={activePage} />
                {customHeader}
              </div>
            ) : (
              <>
                {/* Mobile Navigation Menu */}
                <div className="flex items-center gap-3">
                  <NavigationMenu activePage={activePage} />
                  <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                    {pageTitle}
                  </h1>
                </div>

                {/* User Info & Notifications */}
                <Header 
                  title="" 
                  notifications={notifications} 
                  onOpenApiKeyModal={() => setShowApiKeyModal(true)}
                />
              </>
            )}
          </div>

          {/* Content Area */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              {children}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal 
        isOpen={showApiKeyModal} 
        onClose={() => setShowApiKeyModal(false)} 
        onApiKeyUpdated={handleApiKeyUpdated}
      />
    </ProtectedRoute>
  );
}
