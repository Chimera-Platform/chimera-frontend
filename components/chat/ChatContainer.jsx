"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/context/ChatContext";
import { useChatVersion } from "@/context/ChatVersionContext";
import { ChatMessage } from "./ChatMessage";
import { ChatMessageBubble } from "./ChatMessageBubble"; // Yeni bileşeni import et
import { ChatInput } from "./ChatInput";
import { Button } from "@/components/ui/button";
import { TrashIcon, ListBulletIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline"; // İkonu ekle
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAvatar } from "@/context/AvatarContext";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAvatarDisplayName } from "./ChatAvatarDisplay";
import { ChatWelcomeScreen } from "./ChatWelcomeScreen";
import { ChatLoadingScreen } from "./ChatLoadingScreen";
import { cn } from "@/lib/utils"; // Add this missing import

// Add a new component for the chat header avatar display
function ChatHeaderAvatar({ chat, sidebarOpen, onToggleSidebar, viewMode, toggleViewMode }) {
  const [imageError, setImageError] = useState(false);
  const [avatars, setAvatars] = useState([]);
  const { getAllAvatars } = useAvatar();
  
  useEffect(() => {
    // Reset error state when chat changes
    setImageError(false);
    
    // Load avatars when chat changes
    const loadAvatars = () => {
      if (!chat) return;
      
      // For multi-avatar chats
      if (chat.avatarIds && chat.avatarIds.length > 0) {
        const allAvatars = getAllAvatars ? getAllAvatars() : [];
        const chatAvatars = chat.avatarIds
          .map(id => allAvatars.find(a => a.id === id))
          .filter(a => a !== undefined);
        
        if (chatAvatars.length > 0) {
          setAvatars(chatAvatars);
          return;
        }
      }
      
      // Single avatar from chat.avatar
      if (chat.avatar) {
        setAvatars([chat.avatar]);
        return;
      }
      
      // Single avatar from avatarId
      if (chat.avatarId && getAllAvatars) {
        const allAvatars = getAllAvatars();
        const foundAvatar = allAvatars.find(a => a.id === chat.avatarId);
        if (foundAvatar) {
          setAvatars([foundAvatar]);
          return;
        }
      }
      
      // Fallback - no avatars found
      setAvatars([]);
    };
    
    loadAvatars();
  }, [chat, getAllAvatars]);

  // Get initials for fallback
  const getInitials = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  // Get description with fallback
  const getDescription = () => {
    // For multi-avatar chat
    if (avatars.length > 1) {
      return `Group conversation with ${avatars.length} characters`;
    }
    
    // For single avatar
    const avatar = avatars[0];
    if (avatar?.description) return avatar.description;
    
    // Try to get from cache
    if (chat?.avatarId && typeof window !== "undefined" && window.__avatarCache) {
      const cachedAvatar = window.__avatarCache[chat.avatarId];
      if (cachedAvatar?.description) return cachedAvatar.description;
    }
    
    return "AI Assistant";
  };

  // Handle image loading error
  const handleImageError = () => {
    console.error("Error loading avatar image");
    setImageError(true);
  };

  // Check if this is a multi-avatar chat
  const isMultiAvatarChat = avatars.length > 1;

  // Get the title based on avatar count
  const getTitle = () => {
    if (isMultiAvatarChat) {
      return "Group Chat";
    }
    return avatars[0]?.name || getAvatarDisplayName(chat) || "AI Character";
  };

  return (
    <div className="flex items-center justify-between space-x-3 px-4 py-3 border-b bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
      <div className="flex items-center space-x-3">
        {/* Add sidebar toggle button when sidebar is closed */}
        {!sidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleSidebar(true)}
            className="h-8 w-8 mr-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full flex-shrink-0"
            title="Show sidebar"
          >
            <ListBulletIcon className="h-5 w-5" />
            <span className="sr-only">Show sidebar</span>
          </Button>
        )}
        
        {/* Avatar display - handle both single and multiple avatars */}
        {isMultiAvatarChat ? (
          <div className="flex -space-x-2 mr-2">
            {avatars.slice(0, 3).map((avatar, index) => (
              <div 
                key={avatar.id || index} 
                className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-200 dark:border-indigo-700"
                style={{ zIndex: 10 - index }}
              >
                {avatar.profileImageUrl ? (
                  <Image
                    src={avatar.profileImageUrl}
                    alt={avatar.name}
                    fill
                    className="object-cover"
                    unoptimized={true}
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white font-bold text-lg">
                    {getInitials(avatar.name)}
                  </div>
                )}
              </div>
            ))}
            
            {/* If there are more avatars than we're showing */}
            {avatars.length > 3 && (
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-200 dark:border-indigo-700 bg-indigo-600 flex items-center justify-center">
                <span className="text-xs text-white font-medium">
                  +{avatars.length - 3}
                </span>
              </div>
            )}
          </div>
        ) : avatars.length === 1 ? (
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-200 dark:border-indigo-700">
            {!imageError && avatars[0]?.profileImageUrl ? (
              <Image
                src={avatars[0].profileImageUrl}
                alt={avatars[0].name || "Character"}
                fill
                className="object-cover"
                unoptimized={true}
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white font-bold text-lg">
                {getInitials(avatars[0]?.name || chat?.title)}
              </div>
            )}
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            ?
          </div>
        )}
        
        <div>
          <h3 className="font-medium text-indigo-700 dark:text-indigo-300">
            {getTitle()}
          </h3>
          <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 max-w-[300px] line-clamp-1">
            {getDescription()}
          </p>
        </div>
      </div>
      
      {/* View Mode Toggle Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleViewMode}
              className="h-8 w-8 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full flex-shrink-0"
              title={viewMode === 'chat' ? 'Switch to Bubble View' : 'Switch to Chat View'}
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              <span className="sr-only">Toggle View Mode</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{viewMode === 'chat' ? 'Switch to Bubble View' : 'Switch to Chat View'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

// Add this function before the ChatContainer component to handle avatar retrieval
function getAvatarInfo(chat, getAllAvatars) {
  if (!chat) return { url: null, name: null };
  
  // Case 1: Direct avatar object with profileImageUrl
  if (chat.avatar && chat.avatar.profileImageUrl) {
    return {
      url: chat.avatar.profileImageUrl,
      name: chat.avatar.name || getAvatarDisplayName(chat)
    };
  }
  
  // Case 2: Avatar ID referencing an avatar in the cache
  if (chat.avatarId && getAllAvatars) {
    const allAvatars = getAllAvatars();
    const avatar = allAvatars.find(a => a.id === chat.avatarId);
    if (avatar) {
      return {
        url: avatar.profileImageUrl,
        name: avatar.name || getAvatarDisplayName(chat)
      };
    }
  }
  
  // Case 3: Multiple avatars (group chat)
  if (chat.avatarIds && chat.avatarIds.length > 0 && getAllAvatars) {
    const allAvatars = getAllAvatars();
    const firstAvatar = chat.avatarIds
      .map(id => allAvatars.find(a => a.id === id))
      .filter(a => a !== undefined)[0];
    
    if (firstAvatar) {
      return {
        url: firstAvatar.profileImageUrl,
        name: "Group Chat"
      };
    }
  }
  
  // Default fallback
  return {
    url: null,
    name: getAvatarDisplayName(chat) || "AI Assistant"
  };
}

// ChatWelcomeScreen'i göstermeden önce kontrol edilmesi gereken yeni bir prop ekleyelim
export function ChatContainer({ 
  sidebarOpen, 
  onToggleSidebar, 
  forceShowWelcome, 
  isResetting, 
  preventStateChange, 
  waitingForChats,
  targetChatId
}) {
  const {
    currentChat,
    sendMessage,
    sendMessageStream,
    loading,
    loadingChats, // Add this missing destructured variable
    streamingMessage,
    selectedModel,
    refreshChatMessages,
    selectingChatId
  } = useChat();
  const {
    currentMessages,
    addMessageToCurrentVersion,
    deleteLastUserMessage,
    chatVersions,
    waitingForResponse,
    currentVersionIndex,
    setWaitingForResponse,
    setChatVersions,
    syncWithDatabaseMessages,
  } = useChatVersion();
  const messagesEndRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const [lastProcessedMessageCount, setLastProcessedMessageCount] = useState(0);
  const [previousChatId, setPreviousChatId] = useState(null);
  const { selectedAvatar, getAllAvatars } = useAvatar();

  // Sohbet geçiş durumlarını yönetmek için yeni state ekleyelim
  const [previousChatState, setPreviousChatState] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [shouldSmoothScroll, setShouldSmoothScroll] = useState(false);
  const [viewMode, setViewMode] = useState('chat'); // 'chat' or 'bubble'

  // Load view mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('chatViewMode');
    if (savedMode === 'bubble') {
      setViewMode('bubble');
    }
  }, []);

  // Function to toggle view mode and save to localStorage
  const toggleViewMode = () => {
    const newMode = viewMode === 'chat' ? 'bubble' : 'chat';
    setViewMode(newMode);
    localStorage.setItem('chatViewMode', newMode);
  };
  
  // currentChat değişimlerini izleyerek geçiş durumunu yönet
  useEffect(() => {
    // Eğer daha önce bir chat varken şimdi yoksa ve seçim işlemi devam ediyorsa,
    // geçici durumu etkinleştir ve önceki chat'i sakla
    if (previousChatState && !currentChat && selectingChatId) {
      setIsTransitioning(true);
    } 
    // Eğer geçiş durumundaysak ve yeni bir chat geldiyse, geçiş durumunu kapat
    else if (isTransitioning && currentChat) {
      setIsTransitioning(false);
    }
    
    // Eğer şu anda bir chat varsa, sonraki değişiklikler için bunu kaydet
    if (currentChat) {
      setPreviousChatState(currentChat);
    }
  }, [currentChat, selectingChatId, previousChatState, isTransitioning]);

  // Eğer welcome screen gösterilmemesi gereken durumlarda ama currentChat yoksa,
  // ve bir geçiş durumundaysak, önceki chat'i kullan
  const effectiveChat = currentChat || (isTransitioning ? previousChatState : null);

  // Reset the message counter when the chat changes
  useEffect(() => {
    if (currentChat) {
      if (currentChat.id !== previousChatId) {
        setLastProcessedMessageCount(0);
        setPreviousChatId(currentChat.id);
      }
    }
  }, [currentChat?.id, previousChatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages, streamingMessage]);

  // Enhanced smooth scrolling during streaming
  useEffect(() => {
    if (streamingMessage && messagesEndRef.current) {
      const scrollToBottom = () => {
        // Get the distance to the bottom
        const scrollOffset = messagesEndRef.current.getBoundingClientRect().bottom - window.innerHeight;
        
        // Only scroll if we're close to the bottom (to avoid disrupting reading)
        if (scrollOffset < 300) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: scrollOffset < 20 ? "auto" : "smooth", 
            block: "end" 
          });
        }
      };

      // Scroll immediately and then set up an interval
      scrollToBottom();
      const scrollInterval = setInterval(scrollToBottom, 300);

      return () => clearInterval(scrollInterval);
    }
  }, [streamingMessage]);

  // New effect: Smooth scroll to bottom when a chat is selected
  useEffect(() => {
    // This effect specifically handles chat selection
    if (currentChat && messagesEndRef.current) {
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Function for smooth scrolling with custom duration
      const smoothScrollToBottom = (duration = 800) => {
        if (!messagesEndRef.current) return; // Safety check
        
        // Find a valid scroll container
        const scrollContainer = findScrollContainer(messagesEndRef.current);
        if (!scrollContainer) return;
        
        const targetPosition = messagesEndRef.current.offsetTop;
        const startPosition = scrollContainer.scrollTop;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        const animateScroll = (currentTime) => {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);
          
          // Easing function for smoother feel
          const easeInOutQuad = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          const easedProgress = easeInOutQuad(progress);
          
          scrollContainer.scrollTop = startPosition + distance * easedProgress;
          
          if (timeElapsed < duration) {
            requestAnimationFrame(animateScroll);
          }
        };
        
        requestAnimationFrame(animateScroll);
      };
      
      // Add a small delay to ensure content is rendered
      setTimeout(() => {
        smoothScrollToBottom(800); // 800ms for a gentle scroll
      }, 100);
      
      // Adding 3 additional gentler scrolls with increasing delays to handle any content that loads slowly
      setTimeout(() => smoothScrollToBottom(600), 300);
      setTimeout(() => smoothScrollToBottom(400), 600);
      setTimeout(() => smoothScrollToBottom(200), 1000);
    }
    
    // Cleanup function
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentChat?.id]); // Only trigger when chat ID changes

  // Enhanced smooth scrolling during streaming with more gentle behavior
  useEffect(() => {
    if (streamingMessage && messagesEndRef.current) {
      const scrollToBottom = () => {
        if (!messagesEndRef.current) return; // Safety check
        
        // Find a valid scroll container
        const scrollContainer = findScrollContainer(messagesEndRef.current);
        if (!scrollContainer) return;
        
        // Get the distance to the bottom
        const scrollOffset = messagesEndRef.current.getBoundingClientRect().bottom - window.innerHeight;
        
        // Only scroll if we're close to the bottom (to avoid disrupting reading)
        if (scrollOffset < 300) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: "smooth", 
            block: "end" 
          });
        }
      };

      // Scroll immediately and then set up an interval with a longer delay for smoother experience
      scrollToBottom();
      const scrollInterval = setInterval(scrollToBottom, 400);

      return () => clearInterval(scrollInterval);
    }
  }, [streamingMessage]);

  // Update the version context when the API returns new messages
  useEffect(() => {
    if (!currentChat || !currentChat.messages) return;

    // Only process if we have new messages from the API
    if (currentChat.messages.length > lastProcessedMessageCount) {
      // Get only the new messages that we haven't processed yet
      const newMessages = currentChat.messages.slice(lastProcessedMessageCount);

      // Only add AI messages - user messages are added manually when sent
      const newAIMessages = newMessages.filter(
        (msg) => msg.role === "assistant"
      );

      // Add each new AI message to the current version
      newAIMessages.forEach((message) => {
        addMessageToCurrentVersion(message);
      });

      // Update the last processed count
      setLastProcessedMessageCount(currentChat.messages.length);
    }
  }, [
    currentChat?.messages,
    lastProcessedMessageCount,
    addMessageToCurrentVersion,
    currentChat?.id, // Add currentChat.id as a dependency to reset when chat changes
  ]);

  // Sync with database when chat changes
  useEffect(() => {
    if (currentChat?.id) {
      // Fetch the latest messages from the database
      const syncMessages = async () => {
        await syncWithDatabaseMessages();
      };

      syncMessages();
    }
  }, [currentChat?.id]);

  // Add explicit logging to debug the rendering condition
  useEffect(() => {
    console.log("ChatContainer rendering with:", { 
      currentChat: currentChat?.id || 'null',
      forceShowWelcome,
      isResetting,
      preventStateChange,
      loading,
      loadingChats,
      selectingChat: selectingChatId
    });
  }, [currentChat, forceShowWelcome, isResetting, preventStateChange, loading, loadingChats, selectingChatId]);

  // Önemli değişiklik: Welcome screen gösterimi için özel bir mantık
  // Doğrudan bir chat ID'sine gidiliyorsa ve chat henüz yüklenmediyse welcome screen gösterme
  const showingWelcome = !targetChatId && (
    isResetting || 
    preventStateChange || 
    forceShowWelcome || 
    (!effectiveChat && !isTransitioning)
  );
  
  // Yükleme ekranı durumunda özel bir içerik göster
  // URL'de chat ID varsa ve yükleme devam ediyorsa, welcome screen yerine loading göster
  const showLoadingIndicator = loading || loadingChats || (targetChatId && waitingForChats);
  
  // Track initial load and set up smooth scrolling
  useEffect(() => {
    if (currentChat && isInitialLoad) {
      // Show loading screen briefly for better UX
      const loadingTimer = setTimeout(() => {
        setIsInitialLoad(false);
        // Enable smooth scrolling after loading
        setShouldSmoothScroll(true);
        
        // After a brief delay, scroll to bottom with animation
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ 
              behavior: "smooth", 
              block: "end" 
            });
          }
          
          // Reset the smooth scroll flag after animation completes
          setTimeout(() => {
            setShouldSmoothScroll(false);
          }, 1000);
        }, 100);
      }, 800); // Loading screen display time

      return () => clearTimeout(loadingTimer);
    }
  }, [currentChat, isInitialLoad]);

  // Reset initial load state when chat changes
  useEffect(() => {
    if (currentChat?.id !== previousChatId) {
      setIsInitialLoad(true);
    }
  }, [currentChat?.id, previousChatId]);

  // Smooth scroll to bottom when a chat is selected with custom scrolling function
  useEffect(() => {
    // This effect specifically handles chat selection
    if (currentChat && messagesEndRef.current && shouldSmoothScroll) {
      // Get available scroll container
      const scrollContainer = findScrollContainer(messagesEndRef.current);
      if (!scrollContainer) return;
      
      // Function for smooth scrolling with custom duration and easing
      const smoothScrollToBottom = (duration = 800) => {
        if (!scrollContainer) return;
        
        const scrollHeight = scrollContainer.scrollHeight;
        const startPosition = scrollContainer.scrollTop;
        const targetPosition = scrollHeight - scrollContainer.clientHeight;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        const animateScroll = (currentTime) => {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);
          
          // Easing function - ease out cubic
          const easing = t => 1 - Math.pow(1 - t, 3);
          const easedProgress = easing(progress);
          
          scrollContainer.scrollTop = startPosition + distance * easedProgress;
          
          if (timeElapsed < duration) {
            requestAnimationFrame(animateScroll);
          }
        };
        
        requestAnimationFrame(animateScroll);
      };
      
      // Execute smooth scroll
      smoothScrollToBottom(1200); // Slower, more elegant animation
    }
  }, [currentChat?.id, shouldSmoothScroll]);

  // Show loading screen when switching chats or during initial load
  const showLoadingScreen = (isInitialLoad || selectingChatId || (targetChatId && waitingForChats)) && currentMessages.length > 0;

  if (showingWelcome) {
    console.log("Showing welcome screen due to:", 
      isResetting ? "isResetting=true" : 
      preventStateChange ? "preventStateChange=true" :
      forceShowWelcome ? "forceShowWelcome=true" : 
      "no currentChat and not transitioning");
    return <ChatWelcomeScreen sidebarOpen={sidebarOpen} onToggleSidebar={onToggleSidebar} />;
  }

  // If no chat is selected but we have a targetChatId and are waiting for chats, show loading
  if (!effectiveChat && targetChatId && waitingForChats) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8">
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
            <div className="h-3 w-4/6 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mt-4 text-center">
          Sohbet yükleniyor... <br/>
          <span className="text-sm text-slate-500 dark:text-slate-500">ID: {targetChatId}</span>
        </p>
      </div>
    );
  }

  // If no chat is selected, show the welcome screen
  if (!effectiveChat) {
    console.log("No effective chat during state transition");
    return <ChatWelcomeScreen />;
  }

  const handleSendMessage = async (message) => {
    if (!currentChat) return;

    console.log("Sending message:", message);

    // Check if the current chat has a model associated with it
    const chatHasModel = currentChat.modelId && currentChat.modelId.length > 0;
    console.log(
      "Chat model ID:",
      chatHasModel ? currentChat.modelId : "Not set"
    );
    console.log(
      "Using model:",
      chatHasModel ? currentChat.modelId : selectedModel
    );

    // Create a user message
    const userMessage = {
      role: "user",
      content: message,
      timestamp: Date.now() / 1000,
      isNew: true, // Mark as a new message, not an edit
    };

    // Create an empty assistant message for streaming
    const assistantMessage = {
      role: "assistant",
      content: "",
      timestamp: Date.now() / 1000,
      streaming: true,
    };

    // Get the current version and its messages
    const currentVersion = chatVersions && chatVersions[currentVersionIndex];

    // If we don't have a current version, create one with the chat's messages
    if (!currentVersion) {
      console.log("No current version, creating one with chat messages");

      // Get messages from the current chat
      const chatMessages = currentChat.messages || [];

      // Create a new version with all existing messages plus the new ones
      const newVersion = {
        id: 1,
        messages: [...chatMessages, userMessage, assistantMessage],
        timestamp: new Date(),
        editedMessageIndices: [],
        edits: [],
        chatId: currentChat.id,
      };

      // Update the chat versions state
      const updatedVersions = chatVersions ? [...chatVersions] : [];
      updatedVersions[currentVersionIndex] = newVersion;
      console.log("Setting chat versions with new version");
      setChatVersions(updatedVersions);
    } else {
      // We have a current version, so add the new messages to it
      console.log("Adding new messages to existing version");

      // Get the existing messages
      const existingMessages = currentVersion.messages || [];

      // Create an updated version with all existing messages plus the new ones
      const updatedVersion = {
        ...currentVersion,
        messages: [...existingMessages, userMessage, assistantMessage],
        timestamp: new Date(),
      };

      // Update the chat versions state
      const updatedVersions = chatVersions ? [...chatVersions] : [];
      updatedVersions[currentVersionIndex] = updatedVersion;
      console.log("Setting chat versions with updated version");
      setChatVersions(updatedVersions);
    }

    // Scroll to bottom immediately
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    // Set waiting for response
    setWaitingForResponse(true);

    try {
      // Update the last processed count to include these messages
      setLastProcessedMessageCount((prev) => prev + 2);

      // Define a callback for handling streaming chunks
      const handleStreamChunk = (chunk) => {
        // Update the assistant message content
        setChatVersions((prevVersions) => {
          if (!prevVersions || !prevVersions[currentVersionIndex])
            return prevVersions || [];

          const updatedVersions = [...prevVersions];
          const currentVersion = updatedVersions[currentVersionIndex];
          const messages = [...currentVersion.messages];

          // Find the last assistant message (should be the one we just added)
          const assistantIndex = messages.findIndex(
            (msg, index) =>
              msg.role === "assistant" && index === messages.length - 1
          );

          if (assistantIndex >= 0) {
            messages[assistantIndex] = {
              ...messages[assistantIndex],
              content: messages[assistantIndex].content + chunk,
            };

            updatedVersions[currentVersionIndex] = {
              ...currentVersion,
              messages: messages,
            };
          }

          return updatedVersions;
        });
      };

      // Send the message to the API with streaming
      await sendMessageStream(currentChat.id, message, handleStreamChunk);

      // Update the streaming flag on the assistant message
      setChatVersions((prevVersions) => {
        if (!prevVersions || !prevVersions[currentVersionIndex])
          return prevVersions || [];

        const updatedVersions = [...prevVersions];
        const currentVersion = updatedVersions[currentVersionIndex];
        const messages = [...currentVersion.messages];

        // Find the last assistant message (should be the one we just added)
        const assistantIndex = messages.findIndex(
          (msg, index) =>
            msg.role === "assistant" && index === messages.length - 1
        );

        if (assistantIndex >= 0) {
          messages[assistantIndex] = {
            ...messages[assistantIndex],
            streaming: false,
          };

          updatedVersions[currentVersionIndex] = {
            ...currentVersion,
            messages: messages,
          };
        }

        return updatedVersions;
      });

      // Refresh the messages from the database to ensure we have the latest state
      setTimeout(() => {
        refreshChatMessages(currentChat.id);
      }, 500);
    } catch (error) {
      console.error("Error sending message:", error);

      // Show error toast
      toast.error("Failed to send message. Please try again.");

      // Remove the failed messages from the version
      setChatVersions((prevVersions) => {
        if (!prevVersions || !prevVersions[currentVersionIndex])
          return prevVersions || [];

        const updatedVersions = [...prevVersions];
        const currentVersion = updatedVersions[currentVersionIndex];

        // Remove the last two messages (user and assistant)
        const messages = currentVersion.messages.slice(0, -2);

        updatedVersions[currentVersionIndex] = {
          ...currentVersion,
          messages: messages,
        };

        return updatedVersions;
      });
    } finally {
      // Reset waiting state
      setWaitingForResponse(false);
    }
  };

  // If no chat is selected, show the welcome screen
  if (!effectiveChat) {
    console.log("No effective chat during state transition");
    return <ChatWelcomeScreen />;
  }

  // Check if we have multiple versions to show the delete button
  const hasMultipleVersions = chatVersions && chatVersions.length > 1;
  const isLoading = loading || waitingForResponse || streamingMessage;

  return (
    <div className="flex flex-col h-full">
      {/* Removed the entire header bar div */}

      {/* Replace the existing avatar section with our new component */}
      {effectiveChat && (effectiveChat.avatar || effectiveChat.avatarId) && (
        <ChatHeaderAvatar 
          chat={effectiveChat} 
          sidebarOpen={sidebarOpen} 
          onToggleSidebar={onToggleSidebar}
          viewMode={viewMode}
          toggleViewMode={toggleViewMode}
        />
      )}

      {/* Aktif seçim durumu varsa üst kısımda bilgilendirici bir çubuk göster */}
      {selectingChatId && (
        <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm text-center py-2 flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Switching to another conversation...
        </div>
      )}

      {/* Show loading screen when appropriate */}
      {showLoadingScreen ? (
        <ChatLoadingScreen 
          avatarUrl={getAvatarInfo(effectiveChat, getAllAvatars).url}
          characterName={getAvatarInfo(effectiveChat, getAllAvatars).name}
        />
      ) : (
        <ScrollArea className={cn(
          "flex-1",
          shouldSmoothScroll && "smooth-scrolling" // Add class for CSS transitions
        )}>
          {/* Add delete message button to avatar header if we want to preserve this functionality */}
          {hasMultipleVersions && !waitingForResponse && !streamingMessage && (
            <div className="absolute top-3 right-3 z-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={deleteLastUserMessage}
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span className="sr-only">Delete last message</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete last user message</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          
          {showLoadingIndicator && currentMessages.length === 0 ? (
            <div className="flex flex-col h-full items-center justify-center p-8 text-center">
              <div className="animate-pulse space-y-4 w-full max-w-md">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                  <div className="space-y-1 flex-1">
                    <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-4">
                Mesajlar yükleniyor...
              </p>
            </div>
          ) : currentMessages.length === 0 ? (
            <div className="flex flex-col h-full items-center justify-center p-8 text-center">
              <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-2">
                Start a new conversation
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md">
                Send a message to begin chatting with the AI assistant.
              </p>
            </div>
          ) : (
            <div className={cn(
              viewMode === 'chat' ? 'divide-y divide-slate-200 dark:divide-slate-800' : 'p-4 space-y-4',
              'message-list-container' // Add a general class
            )}>
              {currentMessages
                .filter(
                  (message) =>
                    !chatVersions ||
                    !chatVersions[currentVersionIndex]?.chatId ||
                    chatVersions[currentVersionIndex]?.chatId === currentChat.id
                )
                .map((message, index) => {
                  // Conditionally render message component based on viewMode
                  const MessageComponent = viewMode === 'bubble' ? ChatMessageBubble : ChatMessage;
                  return (
                    <MessageComponent
                      key={`${currentChat.id}-${
                        message.id || index
                      }-${message.content.substring(0, 10)}-${currentVersionIndex}-${viewMode}`} // Add viewMode to key
                      message={message}
                      messageIndex={index}
                      streaming={message.streaming}
                      // Pass necessary props to ChatMessageBubble if needed
                    />
                  );
                })}
              {isLoading && !streamingMessage && (
                <div className="p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </ScrollArea>
      )}

      <ChatInput
        onSend={handleSendMessage}
        disabled={waitingForResponse || streamingMessage || selectingChatId}
      />
    </div>
  );
}

// Function for safely finding a scrollable parent container
const findScrollContainer = (element) => {
  if (!element) return document.documentElement;
  
  // Try a series of possible scroll container selectors
  const scrollContainers = [
    '.scroll-area-viewport',
    '.scroll-area',
    '[data-radix-scroll-area-viewport]',
    '.scrollbar-container',
    'main',
    'div'
  ];
  
  for (const selector of scrollContainers) {
    const container = element.closest(selector);
    if (container) return container;
  }
  
  return document.documentElement;
};

const handleStartConversation = async () => {
  // ...existing code...
  
  try {
    // ...existing code...
    
    if (!chat) {
      console.error("Failed to create chat");
      toast.error("Failed to create chat");
    } else {
      // Show success notification
      toast.success("Conversation created successfully!");
      
      // Yeni chat URL formatını kullan
      router.push(`/chat/${chat.id}`);
    }
  } catch (error) {
    // ...existing code...
  } finally {
    // ...existing code...
  }
};
