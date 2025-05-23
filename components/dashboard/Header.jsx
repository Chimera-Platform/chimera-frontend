"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

// Icons
import {
  FiSun,
  FiMoon,
  FiUser,
  FiLogOut,
  FiSettings,
  FiBell,
  FiMenu,
  FiHome,
  FiChevronLeft,
  FiKey,
  FiImage,
} from "react-icons/fi";

// Styles
import "./header.css";

export function Header({ 
  title, 
  subtitle, 
  backButton, 
  actions, 
  notifications = [], 
  onOpenApiKeyModal, 
  onOpenReplicateApiKeyModal,
  onReadNotification,  // Notification handlers
  onMarkAllAsRead      // <-- Yeni prop eklendi
}) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showApiSubmenu, setShowApiSubmenu] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    setMounted(true);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate unread notifications
  useEffect(() => {
    setUnreadCount(notifications.filter(n => n.unread).length);
  }, [notifications]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.notification-dropdown')) {
        setShowDropdown(false);
      }
      if (showUserMenu && !event.target.closest('.user-dropdown')) {
        setShowUserMenu(false);
        setShowApiSubmenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, showUserMenu]);

  // Wait for mounting to avoid hydration issues with theme
  if (!mounted) return null;

  const isDark = theme === "dark";

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

  const handleLogoutClick = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleNotifications = () => {
    setShowDropdown(!showDropdown);
    if (showUserMenu) setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    if (showDropdown) setShowDropdown(false);
  };

  const toggleApiSubmenu = () => {
    setShowApiSubmenu(!showApiSubmenu);
  };

  const handleOpenRouterApiClick = () => {
    setShowUserMenu(false);
    setShowApiSubmenu(false);
    if (onOpenApiKeyModal) {
      onOpenApiKeyModal();
    }
  };

  const handleReplicateApiClick = () => {
    setShowUserMenu(false);
    setShowApiSubmenu(false);
    if (onOpenReplicateApiKeyModal) {
      onOpenReplicateApiKeyModal();
    } else {
      console.warn("onOpenReplicateApiKeyModal function not provided to Header component");
    }
  };

  // Bildirimler için tümünü okundu olarak işaretle fonksiyonu
  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead(); // Context'teki markAllAsRead fonksiyonunu çağır
    }
  };

  // Tek bir bildirimi okundu olarak işaretle
  const handleReadNotification = (id) => {
    if (onReadNotification) {
      onReadNotification(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`sticky top-0 z-10 w-full ${
        scrolled ? "header-scrolled" : ""
      } header-animation`}
    >
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Left side: Title and back button */}
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none hover-scale-effect"
            onClick={() => document.dispatchEvent(new CustomEvent('toggle-sidebar'))}
          >
            <span className="sr-only">Open sidebar</span>
            <FiMenu className="h-5 w-5" aria-hidden="true" />
          </button>

          {backButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={backButton.onClick}
              className="h-9 w-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover-scale-effect"
            >
              <FiChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <span className="sr-only">Back</span>
            </Button>
          )}
          
          <div>
            <AnimatePresence mode="wait">
              <motion.h1
                key={title}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-xl font-semibold text-slate-800 dark:text-slate-200 header-title"
              >
                {title}
              </motion.h1>
            </AnimatePresence>
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400 header-subtitle">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right side: Actions, Notifications, Theme Toggle, User Menu */}
        <div className="flex items-center space-x-2">
          {/* Custom Action Buttons */}
          {actions && <div className="hidden md:flex space-x-2">{actions}</div>}

          {/* Dashboard shortcut */}
          <Link href="/dashboard" className="hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover-scale-effect"
            >
              <FiHome className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <span className="sr-only">Dashboard</span>
            </Button>
          </Link>

          {/* Notifications */}
          <div className="relative notification-dropdown">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleNotifications}
              className="h-9 w-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 relative hover-scale-effect notification-button"
            >
              <FiBell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold notification-badge">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
            
            {/* Notifications Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-md shadow-lg py-1 z-50 dropdown-menu-animation">
                <div className="px-4 py-2 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                  <span className="font-medium text-slate-800 dark:text-slate-200">Notifications</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs px-2 py-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification) => (
                      <div 
                        key={notification.id} 
                        className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer notification-item"
                        onClick={() => handleReadNotification(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.unread ? 'bg-indigo-500 pulse-effect' : 'bg-transparent'}`}></div>
                          <div className="flex-1">
                            <p className={`text-sm ${notification.unread ? 'font-medium text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
                              {notification.text}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <FiBell className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-center w-full text-slate-500 dark:text-slate-400">No notifications</p>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-slate-100 dark:border-slate-800 p-2">
                  <Link href="/notifications" className="block w-full text-center py-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md">
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="h-9 w-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover-scale-effect theme-toggle-button"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isDark ? "dark" : "light"}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {isDark ? (
                  <FiSun className="h-5 w-5 text-amber-400" />
                ) : (
                  <FiMoon className="h-5 w-5 text-slate-600" />
                )}
              </motion.div>
            </AnimatePresence>
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Menu */}
          <div className="relative user-dropdown">
            <Button 
              variant="ghost" 
              onClick={toggleUserMenu}
              className="h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 p-0.5 hover-scale-effect avatar-button"
            >
              <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700 avatar-transition">
                <AvatarImage src={user?.photoURL} alt={user?.displayName || "User"} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
            
            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-md shadow-lg py-1 z-50 dropdown-menu-animation">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 p-1">
                    <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                      <AvatarImage src={user?.photoURL} alt={user?.displayName || "User"} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 dark:text-slate-100">{user?.displayName || "User"}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-1">
                  <Link href="/profile" className="flex items-center px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md menu-item-hover">
                    <FiUser className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  
                  {/* API Keys settings dropdown */}
                  <div className="relative">
                    <button 
                      onClick={toggleApiSubmenu} 
                      className="settings-button flex items-center w-full px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md menu-item-hover justify-between"
                    >
                      <div className="flex items-center">
                        <FiKey className="mr-2 h-4 w-4" />
                        <span>API Settings</span>
                      </div>
                      <svg className={`w-4 h-4 transition-transform ${showApiSubmenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    
                    {/* API Keys submenu */}
                    {showApiSubmenu && (
                      <div className="pl-6 mt-1 space-y-1">
                        <button 
                          onClick={handleOpenRouterApiClick} 
                          className="flex items-center w-full px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md menu-item-hover"
                        >
                          <FiKey className="mr-2 h-3.5 w-3.5" />
                          <span>OpenRouter API</span>
                        </button>
                        <button 
                          onClick={handleReplicateApiClick} 
                          className="flex items-center w-full px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md menu-item-hover"
                        >
                          <FiImage className="mr-2 h-3.5 w-3.5" />
                          <span>Replicate API</span>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <Link href="/settings" className="flex items-center px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md menu-item-hover">
                    <FiSettings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 p-1">
                  <button 
                    onClick={handleLogoutClick} 
                    className="flex w-full items-center px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md menu-item-hover"
                  >
                    <FiLogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
