"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { useRouter, useParams } from "next/navigation";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import "../../chat/styles.css";

export default function ChatDetailPage() {
  const { selectChat, chats, currentChat, setManualChatReset, loading, loadingChats, streamingMessage } = useChat();
  const router = useRouter();
  const params = useParams();
  const chatId = params.id;

  // Initialize sidebar state from localStorage
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const isResettingRef = useRef(false);
  const preventStateChangeRef = useRef(false);
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false);
  const [waitingForChats, setWaitingForChats] = useState(true);
  const attemptCountRef = useRef(0);
  const maxAttempts = 10;

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

  // İlk yükleme veya sayfa yenileme durumlarında sohbeti seçmeyi yönet
  useEffect(() => {
    // Eğer zaten bir sohbet seçiliyse ve ID'si URL ile eşleşiyorsa işlem yapma
    if (currentChat?.id === chatId) {
      console.log(`Chat ${chatId} already selected, no action needed`);
      setWaitingForChats(false);
      return;
    }

    // Sohbetler yüklendiyse işlem yap
    if (!loadingChats) {
      // Maksimum deneme sayısını aşmadıysak devam et
      if (attemptCountRef.current < maxAttempts) {
        attemptCountRef.current++;
        
        // Sohbet listesi dolu mu kontrol et
        if (chats.length > 0) {
          console.log(`Attempting to select chat ${chatId}, attempt ${attemptCountRef.current}`);
          const chat = chats.find(c => c.id === chatId);
          
          if (chat) {
            console.log(`Found chat with ID ${chatId}, selecting`);
            selectChat(chatId);
            setShowWelcome(false);
            setWaitingForChats(false);
            setInitialLoadAttempted(true);
          } else {
            console.log(`Chat with ID ${chatId} not found in loaded chats`);
            // Sohbetler yüklendi ama ID bulunamadı - son deneme miydi?
            if (attemptCountRef.current >= maxAttempts) {
              console.log("Max attempts reached, redirecting to main chat page");
              router.replace('/chat');
              setShowWelcome(true);
              setWaitingForChats(false);
            }
          }
        } else if (attemptCountRef.current >= maxAttempts) {
          // Sohbetler boş ve son deneme
          console.log("No chats loaded after max attempts, redirecting to main chat page");
          router.replace('/chat');
          setShowWelcome(true);
          setWaitingForChats(false);
        }
      }
    }
  }, [chatId, chats, currentChat, loadingChats, router, selectChat]);

  // Handle the sidebar toggle from either component
  const handleToggleSidebar = (isOpen) => {
    setSidebarOpen(isOpen);
    // Save the sidebar state to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatSidebarOpen', isOpen);
    }
  };

  const handleNewChat = () => {
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
    
    // Navigate to clean URL 
    setTimeout(() => {
      router.push('/chat');
      
      // After navigation completes, we can reset our flags
      setTimeout(() => {
        isResettingRef.current = false;
        
        setTimeout(() => {
          preventStateChangeRef.current = false;
          if (typeof setManualChatReset === 'function') {
            setManualChatReset(false);
          }
        }, 500);
      }, 100);
    }, 50);
  };

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
          forceShowWelcome={showWelcome} 
          isResetting={isResettingRef.current}
          preventStateChange={preventStateChangeRef.current}
          waitingForChats={waitingForChats}
          targetChatId={chatId}
        />
      </main>
    </div>
  );
}
