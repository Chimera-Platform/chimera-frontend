"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { useCredits } from "@/context/CreditsContext";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Icons
import {
  FiGrid,
  FiUser,
  FiMessageSquare,
  FiShoppingBag,
  FiPenTool,
  FiMenu,
  FiX,
  FiImage,
  FiInfo,
  FiHelpCircle,
  FiClock,
  FiBook,
  FiStar
} from "react-icons/fi";

export function Sidebar({ activePage }) {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { credits, loading, error } = useCredits();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProFeatures, setShowProFeatures] = useState(true);
  
  // Calculate usage percentage based on actual credits data
  const usagePercentage = credits?.data && credits.data.total_credits > 0 ? 
    Math.min(100, ((credits.data.total_usage / credits.data.total_credits) * 100).toFixed(1)) : 
    0;

  useEffect(() => {
    // Listen for custom sidebar toggle event from Header
    const handleToggleSidebar = () => {
      setSidebarOpen(prev => !prev);
    };
    
    document.addEventListener('toggle-sidebar', handleToggleSidebar);
    
    // Check if pro features popup was previously dismissed
    const proFeaturesDismissed = localStorage.getItem('proFeaturesDismissed') === 'true';
    if (proFeaturesDismissed) {
      setShowProFeatures(false);
    }
    
    return () => {
      document.removeEventListener('toggle-sidebar', handleToggleSidebar);
    };
  }, []);

  // Handle dismissing pro features popup
  const dismissProFeatures = (e) => {
    e.stopPropagation();
    setShowProFeatures(false);
    localStorage.setItem('proFeaturesDismissed', 'true');
  };

  // Extract user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.displayName) return "U";
    return user.displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Navigation items for the sidebar
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: FiGrid, current: activePage === "dashboard" },
    { name: "Profile", href: "/profile", icon: FiUser, current: activePage === "profile" },
    { name: "Chat", href: "/chat", icon: FiMessageSquare, current: activePage === "chat" },
    { name: "Marketplace", href: "/marketplace", icon: FiShoppingBag, current: activePage === "marketplace" },
    { name: "Create Avatar", href: "/create-avatar", icon: FiPenTool, current: activePage === "create-avatar" },
    { name: "Canvas", href: "/canvas", icon: FiGrid, current: activePage === "canvas" },
    { name: "Gallery", href: "/gallery", icon: FiImage, current: activePage === "gallery" },
    { name: "Characters", href: "/characters", icon: FiUser, current: activePage === "characters" },
  ];

  // Additional links for the bottom of sidebar
  const additionalLinks = [
    { name: "Help & Support", href: "/help", icon: FiHelpCircle },
    { name: "Documentation", href: "/docs", icon: FiBook },
    { name: "Recent Activities", href: "/recent", icon: FiClock },
  ];

  // Credits Usage section based on data state
  const renderCreditsUsage = () => {
    if (loading) {
      return (
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="text-slate-600 dark:text-slate-400">Credits Usage</span>
            <span className="font-medium text-slate-400 dark:text-slate-500">Loading...</span>
          </div>
          <Progress value={0} className="h-1.5" indicatorClassName="bg-indigo-600 dark:bg-indigo-500" />
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="text-slate-600 dark:text-slate-400">Credits Usage</span>
            <span className="font-medium text-red-500 dark:text-red-400">Error</span>
          </div>
          <Progress value={0} className="h-1.5" indicatorClassName="bg-indigo-600 dark:bg-indigo-500" />
          <div className="flex justify-end mt-1">
            <Link href="/chat" className="text-xs text-red-500 dark:text-red-400 hover:underline">
              Set API Key
            </Link>
          </div>
        </div>
      );
    }
    
    if (credits?.data) {
      return (
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="text-slate-600 dark:text-slate-400">Credits Usage</span>
            <span className="font-medium text-indigo-600 dark:text-indigo-400">{usagePercentage}%</span>
          </div>
          <Progress value={parseFloat(usagePercentage)} className="h-1.5" indicatorClassName="bg-indigo-600 dark:bg-indigo-500" />
        </div>
      );
    }
    
    return (
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-1 text-xs">
          <span className="text-slate-600 dark:text-slate-400">Credits Usage</span>
          <span className="font-medium text-slate-500 dark:text-slate-400">No data</span>
        </div>
        <Progress value={0} className="h-1.5" indicatorClassName="bg-indigo-600 dark:bg-indigo-500" />
        <div className="flex justify-end mt-1">
          <Link href="/chat" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
            Set API Key
          </Link>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar for desktop */}
      <div className="h-full w-64 flex-col fixed left-0 top-0 bottom-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-30">
        <div className="flex flex-col h-full">
          {/* Top Section with User Profile & Usage */}
          <div className="flex-shrink-0 pt-5 pb-0">
            {/* Logo and App Name */}
            <div className="flex items-center flex-shrink-0 px-4 mb-5">
              <Image
                src="/images/logo.svg"
                alt="Chimera Logo"
                width={28}
                height={28}
                className="dark:invert mr-2"
              />
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                Chimera
              </span>
            </div>

            {/* User Profile Summary */}
            <div className="px-4 mb-5">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg flex items-center space-x-3 border border-slate-200 dark:border-slate-800">
                <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                  <AvatarImage src={user?.photoURL} alt={user?.displayName || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {user?.displayName || "User"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </div>

            {/* Credits Usage - now using dynamic data */}
            {renderCreditsUsage()}
          </div>

          {/* Main Navigation - Scrollable Area */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="px-2 pb-6">
                <h3 className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Main Menu
                </h3>
                <nav className="mt-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        item.current
                          ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      } group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors`}
                    >
                      <item.icon
                        className={`${
                          item.current
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                        } mr-3 flex-shrink-0 h-5 w-5 transition-colors`}
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </ScrollArea>
          </div>

          {/* Bottom Section with Resources and Footer */}
          <div className="flex-shrink-0 mt-auto ">
            {/* Pro Features - Now with dismiss button */}
            {showProFeatures && (
              <div className="px-4 py-4">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/30 relative">
                  {/* Close button */}
                  <button 
                    onClick={dismissProFeatures}
                    className="absolute top-1 right-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    aria-label="Dismiss pro features"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                  
                  <div className="flex items-center mb-2">
                    <FiStar className="h-4 w-4 text-amber-500 mr-1" />
                    <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      Pro Features
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    Unlock advanced AI features with our premium plan.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            )}
            
            {/* Resources Section */}
            <div className="px-2 py-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Resources
              </h3>
              <nav className="mt-2 space-y-1">
                {additionalLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                  >
                    <item.icon className="text-slate-500 dark:text-slate-400 mr-3 flex-shrink-0 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Sidebar Info Footer - Version text removed */}
            <div className="flex-shrink-0 flex flex-col border-t border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-center justify-between">
                <Link href="/about" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
                  About
                </Link>
                <Link href="/privacy" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
                  Privacy
                </Link>
                <Link href="/terms" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
                  Terms
                </Link>
                <Link href="/contact" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 flex z-40 md:hidden transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
        style={{ width: "16rem" }}
      >
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
          <div className="absolute top-0 right-0 -mr-12 pt-4">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-slate-800/20 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <FiX className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-col h-full overflow-hidden">
            {/* Top Section - Mobile */}
            <div className="flex-shrink-0 pt-5">
              {/* Logo and App Name */}
              <div className="flex-shrink-0 flex items-center px-4 mb-5">
                <Image
                  src="/images/logo.svg"
                  alt="Chimera Logo" 
                  width={28}
                  height={28}
                  className="dark:invert mr-2"
                />
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  Chimera
                </span>
              </div>

              {/* User Profile Summary (Mobile) */}
              <div className="px-4 mb-5">
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg flex items-center space-x-3 border border-slate-200 dark:border-slate-800">
                  <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                    <AvatarImage src={user?.photoURL} alt={user?.displayName || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {user?.displayName || "User"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Credits Usage for Mobile - now using dynamic data */}
              {renderCreditsUsage()}
            </div>

            {/* Main Navigation - Scrollable Area (Mobile) */}
            <div className="flex-1 overflow-y-auto">
              <nav className="mt-2 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    } group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`${
                        item.current
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                      } mr-3 flex-shrink-0 h-5 w-5 transition-colors`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Bottom Section (Mobile) */}
            <div className="flex-shrink-0 mt-auto">
              {/* Pro Features - Mobile with dismiss button */}
              {showProFeatures && (
                <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/30 relative">
                    {/* Close button */}
                    <button 
                      onClick={dismissProFeatures}
                      className="absolute top-1 right-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                      aria-label="Dismiss pro features"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                    
                    <div className="flex items-center mb-2">
                      <FiStar className="h-4 w-4 text-amber-500 mr-1" />
                      <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        Pro Features
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      Unlock advanced AI features with our premium plan.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => setSidebarOpen(false)}
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Resources Section - Now fixed at bottom (Mobile) */}
              <div className="px-2 py-4 border-t border-slate-200 dark:border-slate-800">
                <h3 className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Resources
                </h3>
                <nav className="mt-2 space-y-1">
                  {additionalLinks.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="text-slate-500 dark:text-slate-400 mr-3 flex-shrink-0 h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Mobile Sidebar Footer - Version text removed */}
              <div className="flex-shrink-0 flex flex-col border-t border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-center justify-between">
                  <Link href="/about" onClick={() => setSidebarOpen(false)} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
                    About
                  </Link>
                  <Link href="/privacy" onClick={() => setSidebarOpen(false)} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
                    Privacy
                  </Link>
                  <Link href="/terms" onClick={() => setSidebarOpen(false)} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
                    Terms
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 w-14" aria-hidden="true">
          {/* Dummy element to force sidebar to shrink to fit close icon */}
        </div>
      </div>
    </>
  );
}
