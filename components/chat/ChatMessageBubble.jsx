"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import { useChatVersion } from "@/context/ChatVersionContext";
import { useAvatar } from "@/context/AvatarContext";
import { useChat } from "@/context/ChatContext";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { MessageEditor } from "./MessageEditor";
import { MessageVersionIndicator } from "./MessageVersionIndicator";
import { toast } from "sonner";
import {
  ClipboardIcon,
  CheckIcon,
  PencilIcon,
  ArrowPathIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// Helper function (can be moved to a utils file)
function parseMultiAvatarMessage(content) {
  if (!content) return [];
  const regex = /\[(.*?)\](.*?)(?=\[|$)/gs;
  const parts = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match[1] && match[2]) {
      parts.push({ character: match[1].trim(), content: match[2].trim() });
    }
  }
  if (parts.length === 0 && content.trim()) {
    return [{ character: null, content: content.trim() }];
  }
  return parts;
}

// Function to clean content by removing avatar name prefix if present
function cleanMessageContent(content) {
  if (!content) return "";
  // Remove the [Name] prefix from multi-avatar messages
  return content.replace(/^\[(.*?)\]\s*/, '');
}


export function ChatMessageBubble({ message, messageIndex, streaming }) {
  const { user } = useAuth();
  const isUser = message.role === "user";
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [messageCopied, setMessageCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const {
    editMessage,
    isEditingMessage,
    chatVersions,
    currentVersionIndex,
    waitingForResponse,
    editedMessageIndices,
    getEditedMessagesInCurrentVersion,
  } = useChatVersion();
  const { selectedAvatar, getAllAvatars } = useAvatar();
  const { currentChat } = useChat();
  const [collapsedCodeBlocks, setCollapsedCodeBlocks] = useState({});
  const [messageParts, setMessageParts] = useState([]);

  // Parse multi-avatar messages
  useEffect(() => {
    if (!isUser && message.content) {
      const isMultiAvatarChat = currentChat?.avatarIds?.length > 1;
      if (isMultiAvatarChat) {
        const parts = parseMultiAvatarMessage(message.content);
        setMessageParts(parts);
      } else {
        setMessageParts([{ character: null, content: message.content }]);
      }
    } else {
      setMessageParts([{ character: null, content: message.content }]);
    }
  }, [message.content, isUser, currentChat?.avatarIds]);

  const toggleCodeBlock = (blockId) => {
    setCollapsedCodeBlocks(prev => ({ ...prev, [blockId]: !prev[blockId] }));
  };

  const isStreaming = streaming || message.streaming;
  const currentVersion = chatVersions[currentVersionIndex];
  const isEditedInCurrentVersion = currentVersion?.editedMessageIndices?.includes(messageIndex);
  const editedMessagesInCurrentVersion = getEditedMessagesInCurrentVersion();
  const wasEditedInAnyVersion = chatVersions.some((version) => version.editedMessageIndices?.includes(messageIndex));
  const isWaitingForResponse = waitingForResponse && editedMessageIndices.includes(messageIndex);
  const showVersionNavigator = chatVersions.length > 1 && !isWaitingForResponse && wasEditedInAnyVersion;
  const canEdit = isUser && !waitingForResponse && !isEditingMessage;

  const handleCopyMessage = async (contentToCopy) => {
    try {
      await navigator.clipboard.writeText(contentToCopy);
      setMessageCopied(true);
      setTimeout(() => setMessageCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy message: ", err);
    }
  };

  const handleEditMessage = () => {
    if (isEditingMessage || waitingForResponse) {
      toast.error("Another edit is in progress. Please wait.");
      return;
    }
    setIsEditing(true);
    setEditedContent(message.content);
  };

  const handleSaveEdit = (newContent) => {
    if (newContent === message.content) {
      setIsEditing(false);
      return;
    }
    editMessage(messageIndex, newContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => setIsEditing(false);

  const getAvatarByCharacterName = (characterName) => {
    if (!characterName || !currentChat?.avatarIds) return null;
    if (currentChat.avatars) {
      const matchingAvatar = currentChat.avatars.find(a => a.name === characterName);
      if (matchingAvatar) return matchingAvatar;
    }
    const allAvatars = getAllAvatars ? getAllAvatars() : [];
    return allAvatars.find(a => a.name === characterName && currentChat.avatarIds.includes(a.id));
  };

  const getMessageSender = (characterName) => {
    if (isUser) return user?.displayName || "You";
    if (characterName) return characterName;
    return currentChat?.avatar?.name || selectedAvatar?.name || "AI Assistant";
  };

  const renderAvatar = (characterName = null) => {
    let avatarToShow = null;
    let isUnknownCharacter = false;
    let displayName = "User";

    if (isUser) {
      avatarToShow = user;
      displayName = user?.displayName || "User";
    } else {
      if (characterName) {
        avatarToShow = getAvatarByCharacterName(characterName);
        isUnknownCharacter = characterName && !avatarToShow;
        displayName = characterName;
      }
      if (!avatarToShow && !isUnknownCharacter) {
        avatarToShow = currentChat?.avatar || selectedAvatar;
        displayName = avatarToShow?.name || "AI";
      }
    }

    const avatarUrl = isUser ? user?.photoURL : avatarToShow?.profileImageUrl;
    const initials = displayName?.charAt(0).toUpperCase() || "?";

    if (isUnknownCharacter) {
      return (
        <div className="bubble-avatar rounded-full bg-gradient-to-br from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800 border-2 border-yellow-300 dark:border-yellow-600 flex items-center justify-center">
          <span className="text-xs font-bold text-white">{initials}</span>
        </div>
      );
    }

    return (
      <div className="bubble-avatar rounded-full overflow-hidden flex-shrink-0 bg-indigo-100 dark:bg-indigo-900">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className={`w-full h-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold ${avatarUrl ? 'hidden' : 'flex'}`}>
          {initials}
        </div>
      </div>
    );
  };

  const renderMessageContent = (content, isLastPartStreaming) => (
    <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0">
      <MarkdownRenderer
        content={content}
        isDark={isDark}
        collapsedCodeBlocks={collapsedCodeBlocks}
        toggleCodeBlock={toggleCodeBlock}
      />
      {isLastPartStreaming && (
        <span className="typing-indicator">
          <span className="dot"></span><span className="dot"></span><span className="dot"></span>
        </span>
      )}
    </div>
  );

  const renderActions = (contentToCopy) => (
    <div className="message-bubble-actions">
      {isEditedInCurrentVersion && (
        <div className="flex items-center mr-auto text-xs text-slate-500 dark:text-slate-400">
          <ArrowPathIcon className="h-3 w-3 mr-1" />
          <span>Edited</span>
        </div>
      )}
       {!isEditedInCurrentVersion && editedMessagesInCurrentVersion.includes(messageIndex) && (
          <div className="flex items-center mr-auto text-xs text-indigo-500 dark:text-indigo-400">
            <ArrowPathIcon className="h-3 w-3 mr-1" />
            <span>Previously Edited</span>
          </div>
        )}
       {isWaitingForResponse && (
          <div className="flex items-center mr-auto text-xs text-indigo-500 dark:text-indigo-400 animate-pulse">
            <ClockIcon className="h-3 w-3 mr-1" />
            <span>Waiting...</span>
          </div>
        )} 
      {canEdit && !isEditing && (
        <button onClick={handleEditMessage} aria-label="Edit message" disabled={isEditingMessage || waitingForResponse}>
          <PencilIcon className="h-3.5 w-3.5" />
        </button>
      )}
      <button onClick={() => handleCopyMessage(contentToCopy)} aria-label="Copy message">
        {messageCopied ? <CheckIcon className="h-3.5 w-3.5 text-green-500" /> : <ClipboardIcon className="h-3.5 w-3.5" />}
      </button>
    </div>
  );

  // Main Render Logic
  const isMultiAvatarChat = !isUser && messageParts.length > 1;

  return (
    <div className={cn("message-bubble-wrapper", isWaitingForResponse && "opacity-70")}>
      {isEditing ? (
        // Simplified editing view - doesn't show individual avatars during edit
        <div className={cn("message-bubble-container", isUser ? "user" : "assistant")}>
             {!isUser && renderAvatar()} {/* Show default/first avatar for assistant */}
             <div className={cn("message-bubble", isUser ? "message-bubble-user" : "message-bubble-assistant", "w-full")}>
                <MessageEditor
                  initialContent={message.content}
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                />
             </div>
             {isUser && renderAvatar()} {/* Show user avatar */}
        </div>
      ) : (
        // Map through message parts and render avatar + bubble for each
        <>
            {messageParts.map((part, idx) => {
                const content = isUser ? part.content : cleanMessageContent(part.content);
                const isLastPart = idx === messageParts.length - 1;
                const isLastPartStreaming = isLastPart && isStreaming;
                const characterName = !isUser ? part.character : null;

                return (
                    // Container for each part (avatar + bubble + actions)
                    <div key={idx} className={cn("message-bubble-container", isUser ? "user" : "assistant")}>
                        {/* Render avatar for assistant messages */}
                        {!isUser && renderAvatar(characterName)}

                        {/* Bubble content + actions column */}
                        <div className={cn("flex flex-col", isUser ? "items-end" : "items-start", "max-w-[85%]")}>
                            <div
                                className={cn(
                                    "message-bubble",
                                    isUser ? "message-bubble-user" : "message-bubble-assistant",
                                    isEditedInCurrentVersion && !isUser && "border border-indigo-300 dark:border-indigo-700",
                                    isEditedInCurrentVersion && isUser && "border border-white/30",
                                )}
                            >
                                {/* Show character name for assistant messages */}
                                {!isUser && (
                                  <div className="text-xs font-semibold mb-1 opacity-80">
                                    {getMessageSender(characterName)}
                                  </div>
                                )}
                                {renderMessageContent(content, isLastPartStreaming)}
                            </div>
                            {/* Actions and Version Indicator below the bubble */}
                            {/* Only show for the last part of a multi-part message or for single messages */}
                            {(isLastPart || messageParts.length === 1) && (
                                <div className={cn("mt-2 w-full flex", isUser ? "justify-end" : "justify-start")}>
                                    <div> {/* Inner div to contain actions/indicator */}
                                        {renderActions(message.content)}
                                        {showVersionNavigator && (
                                            <div className="message-bubble-version-indicator mt-1">
                                                <MessageVersionIndicator messageIndex={messageIndex} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Render user avatar */}
                        {isUser && renderAvatar()}
                    </div>
                );
            })}
        </>
      )}
    </div>
  );
}
