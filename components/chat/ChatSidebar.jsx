"use client";

import { useState, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import { ModelSelector } from "./ModelSelector";
import { useTheme } from "next-themes";
import ChatAvatarDisplay, { getAvatarDisplayName } from "./ChatAvatarDisplay";
import {
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { useAvatar } from "@/context/AvatarContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function ChatSidebar({ onNewChat, onToggleSidebar, isSidebarOpen }) {
  const { chats, currentChat, selectChat, deleteChat, loading, loadingChats, streamingMessage, selectingChatId } =
    useChat();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const { selectedAvatar } = useAvatar();
  const router = useRouter();
  const [localSelectingChatId, setLocalSelectingChatId] = useState(null);
  const selectionTimeoutRef = useRef(null);
  const [selectedChatHistory, setSelectedChatHistory] = useState({});

  // Use the parent component's state and setter function
  const toggleSidebar = () => {
    if (onToggleSidebar) {
      onToggleSidebar(false);
    }
  };

  const handleDeleteClick = (chatId, e) => {
    e.stopPropagation();
    const chat = chats.find((c) => c.id === chatId);
    setChatToDelete(chat);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (chatToDelete) {
      await deleteChat(chatToDelete.id);
      setDeleteDialogOpen(false);
      setChatToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setChatToDelete(null);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const filteredChats = chats.filter((chat) =>
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sohbet seçim işlemini geliştirme
  const handleSelectChat = (chatId) => {
    // 1. Halihazırda bir seçim işlemi devam ediyorsa engelle
    if (selectingChatId || localSelectingChatId) {
      console.log("Selection already in progress, ignoring");
      return;
    }

    // 2. Zaten seçili olan sohbeti tekrar seçmeyi engelle
    if (currentChat?.id === chatId) {
      console.log("Chat already selected, ignoring");
      return;
    }
    
    // 3. Son 2 saniye içinde aynı sohbet için seçim yapıldıysa engelle
    const lastSelectedTime = selectedChatHistory[chatId] || 0;
    const now = Date.now();
    if (now - lastSelectedTime < 2000) { // 2 saniye önce seçilmişse, tekrar seçmeyi önle
      console.log(`Chat ${chatId} was selected less than 2 seconds ago, ignoring duplicate selection`);
      return;
    }

    console.log("Selecting chat:", chatId);
    setLocalSelectingChatId(chatId);
    
    // Seçim geçmişini güncelle
    setSelectedChatHistory(prev => ({
      ...prev,
      [chatId]: now
    }));
    
    // Önceki zamanlayıcıyı temizle
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    // URL'i güncellemek için yeni format kullan
    router.replace(`/chat/${chatId}`);
    
    // Context'e seçim durumunu bildir 
    const success = selectChat(chatId);
    
    // Yerel seçim durumunu bir süre sonra temizle
    selectionTimeoutRef.current = setTimeout(() => {
      setLocalSelectingChatId(null);
    }, 600);
  };

  const handleNewChatClick = () => {
    // Prevent action if chats are loading, streaming, or app is in any loading state
    if (loadingChats || loading || streamingMessage) {
      console.log("Ignoring new chat click during loading/streaming state");
      return;
    }
    
    console.log("New chat button clicked from sidebar");
    if (onNewChat) {
      console.log("Executing new chat handler");
      onNewChat();
    }
  };

  return (
    <>
      <div
        className={`
        ${isSidebarOpen ? "w-72" : "w-0"} 
        transition-all duration-300 ease-in-out 
        h-screen border-r border-slate-200 dark:border-slate-800 
        bg-white dark:bg-slate-950 flex flex-col
        fixed md:relative z-30 shadow-md overflow-hidden
      `}
      >
        {isSidebarOpen && (
          <>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push('/dashboard')}
                  className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  <span className="sr-only">Back to Dashboard</span>
                </Button>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Chat</h2>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                >
                  {theme === "dark" ? (
                    <SunIcon className="h-5 w-5" />
                  ) : (
                    <MoonIcon className="h-5 w-5" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400"
                  title="Collapse sidebar"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                  <span className="sr-only">Close sidebar</span>
                </Button>
              </div>
            </div>

            <div className="p-4">
              <Button
                onClick={handleNewChatClick}
                disabled={loading || loadingChats || streamingMessage}
                className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-md transition-all duration-200 hover:shadow-lg
                  ${(loading || loadingChats || streamingMessage) ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                {loadingChats ? "Loading Chats..." : loading ? "Processing..." : "New Chat"}
              </Button>
            </div>

            <div className="px-4 pb-2">
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    <span className="sr-only">Clear search</span>
                  </button>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1 px-2">
              <div className="space-y-2 p-2">
                {loadingChats ? (
                  <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                    Loading chats...
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                    {searchQuery
                      ? "No chats found"
                      : "No chats yet"}
                  </div>
                ) : (
                  filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      className={`
                        flex items-center justify-between p-3 rounded-lg cursor-pointer group transition-all duration-200
                        ${
                          currentChat?.id === chat.id
                            ? "bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-600 dark:text-indigo-400 shadow-sm"
                            : "hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200"
                        }
                        ${(selectingChatId === chat.id || localSelectingChatId === chat.id) ? "opacity-70 pointer-events-none" : ""}
                      `}
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0 mr-2">
                        {/* Proper usage of ChatAvatarDisplay component */}
                        <ChatAvatarDisplay chat={chat} />
                        <div className="truncate flex-1 max-w-[160px]">
                          <div className="font-medium truncate">
                            {chat.title || "Untitled Chat"}
                          </div>
                          {/* Use the helper function for display name */}
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {getAvatarDisplayName(chat)}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteClick(chat.id, e)}
                        className="h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 rounded-full"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <ModelSelector />
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                className="w-full hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                onClick={() => router.push("/characters")}
              >
                New Chat with Different Character
              </Button>
            </div>
          </>
        )}
      </div>

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        chatTitle={chatToDelete?.title}
      />
    </>
  );
}

// Export the sidebar state for external components to check
export function useSidebarState() {
  const [isOpen, setIsOpen] = useState(true);
  return { isOpen, setIsOpen };
}
