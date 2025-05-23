"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useRouter, useSearchParams } from "next/navigation";
import "./styles.css";

export default function ChatPage() {
  const { chats, currentChat, selectChat, setManualChatReset, loading, loadingChats, streamingMessage, selectingChatId } = useChat();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Initialize with default, but we'll update from localStorage in useEffect
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [forceRerender, setForceRerender] = useState(0);
  // Don't immediately show welcome screen - check URL params first
  const [showWelcome, setShowWelcome] = useState(false);
  const [initialUrlProcessed, setInitialUrlProcessed] = useState(false);
  const isResettingRef = useRef(false);
  const preventStateChangeRef = useRef(false);
  const urlChangeTimeoutRef = useRef(null);
  const [lastSelectedChatId, setLastSelectedChatId] = useState(null);
  const [lastProcessedUrl, setLastProcessedUrl] = useState(null);
  const [selectionInProgress, setSelectionInProgress] = useState(false);
  
  // Load sidebar state from localStorage on initial render
  useEffect(() => {
    // Make sure we're on the client side
    if (typeof window !== 'undefined') {
      const savedSidebarState = localStorage.getItem('chatSidebarOpen');
      // Only update if we have a saved state
      if (savedSidebarState !== null) {
        setSidebarOpen(savedSidebarState === 'true');
      }
    }
  }, []);
  
  // Special effect to handle the initial URL on first load
  useEffect(() => {
    // Skip if we've already processed the initial URL
    if (initialUrlProcessed) return;
    
    const chatId = searchParams.get('id');
    console.log("Initial URL processing, chatId:", chatId);
    
    if (chatId) {
      // Eski format URL varsa yeni formata yönlendir
      console.log("Found chat ID in initial URL, redirecting to new format:", chatId);
      router.replace(`/chat/${chatId}`);
      setInitialUrlProcessed(true);
      return;
    } else {
      // No chat ID in URL, show welcome screen
      console.log("No chat ID in URL, showing welcome screen");
      setShowWelcome(true);
      setInitialUrlProcessed(true);
    }
  }, [searchParams, router, initialUrlProcessed]);
  
  // Handle the sidebar toggle from either component
  const handleToggleSidebar = useCallback((isOpen) => {
    setSidebarOpen(isOpen);
    // Save the sidebar state to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatSidebarOpen', isOpen);
    }
  }, []);

  // React to currentChat changes to update showWelcome, but only if allowed
  useEffect(() => {
    if (!isResettingRef.current && !preventStateChangeRef.current && initialUrlProcessed) {
      // Only update welcome state if we're not in a selection process
      if (!selectingChatId) {
        if (!currentChat) {
          setShowWelcome(true);
        } else {
          setShowWelcome(false);
        }
      }
    }
  }, [currentChat, selectingChatId, initialUrlProcessed]);

  const handleNewChat = useCallback(() => {
    // Prevent action if the chat context is in a loading state
    if (loadingChats || loading || streamingMessage) {
      console.log("Ignoring new chat request during loading/streaming state");
      return;
    }
    
    // Set flags to indicate we're in the process of resetting and should prevent other state changes
    isResettingRef.current = true;
    preventStateChangeRef.current = true;
    
    // Force welcome screen display BEFORE any other changes
    setShowWelcome(true);
    
    // Tell ChatContext we're doing a manual reset
    if (typeof setManualChatReset === 'function') {
      setManualChatReset(true);
    }
    
    // Clear current chat selection
    console.log("Clearing current chat selection");
    selectChat(null);
    
    // Force component re-render
    setForceRerender(prev => prev + 1);
    
    // After a short delay, navigate to clean URL to avoid race conditions
    setTimeout(() => {
      router.push('/chat');
      
      // After navigation completes, we can reset our flags
      setTimeout(() => {
        isResettingRef.current = false;
        
        // Keep the preventStateChange flag active for a bit longer
        // to ensure any pending state updates don't override our welcome screen
        setTimeout(() => {
          preventStateChangeRef.current = false;
          if (typeof setManualChatReset === 'function') {
            setManualChatReset(false);
          }
        }, 500); // Extra delay to ensure all state updates are completed
      }, 100);
    }, 50);
  }, [router, selectChat, setManualChatReset, loadingChats, loading, streamingMessage]);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950">
      <ChatSidebar 
        onNewChat={handleNewChat} 
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={sidebarOpen}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatContainer 
          sidebarOpen={sidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          forceShowWelcome={showWelcome && !selectingChatId && initialUrlProcessed} // Only show welcome when we've processed the URL
          isResetting={isResettingRef.current}
          preventStateChange={preventStateChangeRef.current}
          key={`chat-${forceRerender}-${showWelcome && !selectingChatId ? 'welcome' : (currentChat?.id || 'empty')}`}
        />
      </main>
    </div>
  );
}
