import { useState, useEffect } from "react";
import Image from "next/image";
import { useAvatar } from "@/context/AvatarContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ChatAvatarDisplay({ chat, size = 24 }) {
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
  const getInitials = () => {
    if (avatars.length > 0 && avatars[0]?.name) {
      return avatars[0].name.charAt(0).toUpperCase();
    }
    if (chat?.title) return chat.title.charAt(0).toUpperCase();
    return "?";
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Check if this is a multi-avatar chat
  const isMultiAvatarChat = avatars.length > 1;
  
  // If we have no avatars to show, render a fallback
  if (avatars.length === 0) {
    return (
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 dark:from-indigo-800 dark:to-purple-800 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-300">
          {getInitials()}
        </span>
      </div>
    );
  }
  
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative flex-shrink-0">
            {/* Primary avatar (first one) */}
            <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-indigo-200 to-purple-200 dark:from-indigo-800 dark:to-purple-800 flex items-center justify-center">
              {!imageError && avatars[0]?.profileImageUrl ? (
                <Image
                  src={avatars[0].profileImageUrl}
                  alt={avatars[0].name || "Avatar"}
                  width={size}
                  height={size}
                  priority={true}
                  loading="eager"
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              ) : (
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-300">
                  {getInitials()}
                </span>
              )}
            </div>
            
            {/* Indicator for multi-avatar chats */}
            {isMultiAvatarChat && (
              <div className="absolute -bottom-1 -right-1 bg-indigo-500 rounded-full w-3 h-3 flex items-center justify-center border border-white dark:border-slate-900 text-[7px] font-bold text-white">
                {avatars.length}
              </div>
            )}
            
            {/* Stack effect for multi-avatar chats */}
            {isMultiAvatarChat && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 -z-10"></div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          {isMultiAvatarChat ? (
            <div className="text-xs max-w-[200px]">
              <p className="font-medium">Group Chat with:</p>
              <ul className="list-disc pl-4 mt-1">
                {avatars.map((avatar, idx) => (
                  <li key={avatar.id || idx}>{avatar.name}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs">{avatars[0]?.name || "Unknown Character"}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Export the display name function separately for use in the sidebar
export function getAvatarDisplayName(chat) {
  // Check if this is a multi-avatar chat
  const isMultiAvatarChat = chat?.avatarIds && chat.avatarIds.length > 1;
  
  if (isMultiAvatarChat) {
    // For multi-avatar chat, show "Group Chat" or number of avatars
    return `${chat.avatarIds.length} Characters`;
  }
  
  // Standard single-avatar chat handling
  if (chat?.avatar?.name) return chat.avatar.name;
  
  // If chat.avatar doesn't exist or has no name, try to find avatar info in cache
  try {
    if (typeof window !== "undefined" && window.__avatarCache && chat?.avatarId) {
      const cachedAvatar = window.__avatarCache[chat.avatarId];
      if (cachedAvatar?.name) return cachedAvatar.name;
    }
  } catch (e) {
    console.log("Avatar cache check error:", e);
  }
  
  // Fall back to title
  if (chat?.title) {
    const titleParts = chat.title.split(" with ");
    if (titleParts.length > 1) return titleParts[1];
  }
  
  // Last resort
  if (chat?.avatarId) return "Loading character...";
  return "No character selected";
}
