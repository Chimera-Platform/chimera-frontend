import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

export function DashboardLayout({ children, notifications = [] }) {
  const [mounted, setMounted] = useState(false);
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

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar activePage="dashboard" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <Header title="Dashboard" notifications={notifications} />
        
        {/* Content Area - burada p-6 var, ancak içerik arası spacing yok */}
        <ScrollArea className="flex-1">
          <div className="p-6 content-area">
            {children}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
