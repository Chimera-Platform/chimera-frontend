"use client";

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Contexts
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import { useChatVersion } from "@/context/ChatVersionContext";
import { useAvatar } from "@/context/AvatarContext";
import { useChat } from "@/context/ChatContext";

// React and state
import { useState, useEffect, useRef } from "react";

// Markdown support
import { MarkdownRenderer } from "./MarkdownRenderer";

// Icons
import {
  ClipboardIcon,
  CheckIcon,
  PencilIcon,
  ArrowPathIcon,
  ClockIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

// Components
import { MessageEditor } from "./MessageEditor";
import { MessageVersionIndicator } from "./MessageVersionIndicator";
import { toast } from "sonner";

// Split multi-avatar messages into separate parts by character
function parseMultiAvatarMessage(content) {
  if (!content) return [];
  
  // Regular expression to match bracketed character names followed by their messages
  const regex = /\[(.*?)\](.*?)(?=\[|$)/gs;
  const parts = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    if (match[1] && match[2]) {
      parts.push({
        character: match[1].trim(),
        content: match[2].trim()
      });
    }
  }
  
  // If we couldn't parse any parts, return the original as one part
  if (parts.length === 0 && content.trim()) {
    return [{
      character: null,
      content: content.trim()
    }];
  }
  
  return parts;
}

export function ChatMessage({ message, messageIndex, streaming }) {
  const { user } = useAuth();
  const isUser = message.role === "user";
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [messageCopied, setMessageCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const messageRef = useRef(null);
  const [editedContent, setEditedContent] = useState(message.content);
  const {
    editMessage,
    isEditingMessage,
    setIsEditingMessage,
    chatVersions,
    currentVersionIndex,
    waitingForResponse,
    editedMessageIndices,
    getEditedMessagesInCurrentVersion,
  } = useChatVersion();
  const { selectedAvatar, getAllAvatars } = useAvatar();
  const { currentChat } = useChat();

  // For collapsible code blocks
  const [collapsedCodeBlocks, setCollapsedCodeBlocks] = useState({});
  
  // State for parsed multi-avatar messages
  const [messageParts, setMessageParts] = useState([]);
  
  // Parse multi-avatar messages on content change
  useEffect(() => {
    if (!isUser && message.content) {
      // Check if this is a multi-avatar chat
      const isMultiAvatarChat = currentChat?.avatarIds?.length > 1;
      
      if (isMultiAvatarChat) {
        // Parse message into separate parts for each character
        const parts = parseMultiAvatarMessage(message.content);
        setMessageParts(parts);
      } else {
        // For single avatar chats, keep as one message
        setMessageParts([{
          character: null,
          content: message.content
        }]);
      }
    } else {
      // User messages are always a single part
      setMessageParts([{
        character: null,
        content: message.content
      }]);
    }
  }, [message.content, isUser, currentChat?.avatarIds]);

  const toggleCodeBlock = (blockId) => {
    setCollapsedCodeBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  };

  // Use the streaming prop or check if the message has a streaming property
  const isStreaming = streaming || message.streaming;

  // Check if this message was edited in the current version
  const currentVersion = chatVersions[currentVersionIndex];
  const isEditedInCurrentVersion =
    currentVersion?.editedMessageIndices?.includes(messageIndex);

  // Get all messages that were edited in the current version
  const editedMessagesInCurrentVersion = getEditedMessagesInCurrentVersion();

  // Check if this message was edited in any version
  const wasEditedInAnyVersion = chatVersions.some((version) =>
    version.editedMessageIndices?.includes(messageIndex)
  );

  // Check if we're waiting for a response after editing this message
  const isWaitingForResponse =
    waitingForResponse && editedMessageIndices.includes(messageIndex);

  // Scroll to edited message when switching versions
  useEffect(() => {
    if (isEditedInCurrentVersion && messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isEditedInCurrentVersion, currentVersionIndex]);

  // Force re-render when content changes during streaming
  useEffect(() => {
    if (isStreaming) {
      // This empty dependency array with a state update forces a re-render
      const forceUpdateTimer = setInterval(() => {
        setMessageCopied((prev) => prev); // This is just to trigger a re-render without changing state
      }, 50); // Faster refresh rate for smoother streaming

      return () => clearInterval(forceUpdateTimer);
    }
  }, [isStreaming, message.content]);

  // Add a typing indicator class when streaming
  useEffect(() => {
    if (messageRef.current && isStreaming) {
      messageRef.current.classList.add('streaming-message');
    } else if (messageRef.current) {
      messageRef.current.classList.remove('streaming-message');
    }
  }, [isStreaming]);

  // Scroll into view when the message is added - but only for new messages with gentle scrolling
  useEffect(() => {
    // Only auto-scroll for new streaming messages or messages being added at the end
    // Don't scroll when loading chat history
    if (messageRef.current && (isStreaming || message.isNew)) {
      messageRef.current.scrollIntoView({ 
        behavior: "smooth", // Changed from "auto" to "smooth" for gentler scrolling
        block: "end"
      });
    }
  }, [message.content, isStreaming]);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
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
      // No changes made, just cancel the edit
      setIsEditing(false);
      return;
    }
    
    editMessage(messageIndex, newContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Only allow editing user messages and not waiting for a response
  const canEdit = isUser && !waitingForResponse && !isEditingMessage;

  // Determine if we should show the version navigator
  // Show it on the message that was edited in any version
  const showVersionNavigator =
    chatVersions.length > 1 && !isWaitingForResponse && wasEditedInAnyVersion;

  // Function to check if text is a mermaid diagram
  const isMermaidDiagram = (text) => {
    return text?.trim().startsWith("```mermaid") && text.includes("```");
  };

  // Extract mermaid content from markdown
  const extractMermaidContent = (text) => {
    const match = text?.match(/```mermaid\n([\s\S]*?)```/);
    return match ? match[1] : null;
  };

  // Find avatar by character name for multi-avatar chats
  const getAvatarByCharacterName = (characterName) => {
    if (!characterName || !currentChat?.avatarIds) return null;
    
    // First try from current chat's avatars array if available
    if (currentChat.avatars) {
      const matchingAvatar = currentChat.avatars.find(a => 
        a.name === characterName
      );
      if (matchingAvatar) return matchingAvatar;
    }
    
    // Otherwise search through all avatars
    const allAvatars = getAllAvatars ? getAllAvatars() : [];
    return allAvatars.find(a => 
      a.name === characterName && 
      currentChat.avatarIds.includes(a.id)
    );
  };

  // Enhanced logic for displaying avatar names in multi-avatar chats
  const getMessageSender = (characterName) => {
    if (isUser) {
      return user?.displayName || "You";
    }
    
    if (characterName) {
      return characterName;
    }
    
    return currentChat?.avatar?.name || selectedAvatar?.name || "AI Assistant";
  };

  // Avatar display section - updated for both user and assistant with multi-avatar support
  const renderAvatar = (characterName = null) => {
    if (isUser && user?.photoURL) {
      // User avatar
      return (
        <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
          <img
            src={user.photoURL}
            alt={user.displayName || "User"}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Error loading user avatar image:", e);
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.displayName || "User"
              )}&background=random`;
            }}
          />
        </div>
      );
    } else if (message.role === "assistant") {
      // For assistant messages in multi-avatar chats
      let avatarToShow = null;
      let isUnknownCharacter = false;
      
      if (characterName) {
        // Try to find the avatar with this name for multi-avatar chats
        avatarToShow = getAvatarByCharacterName(characterName);
        
        // Check if this is an unknown character (has name but no matching avatar)
        isUnknownCharacter = characterName && !avatarToShow;
      }
      
      // If we couldn't find a specific avatar, use the default
      if (!avatarToShow && !isUnknownCharacter) {
        avatarToShow = currentChat?.avatar || selectedAvatar;
      }
      
      // Special rendering for unknown characters
      if (isUnknownCharacter) {
        return (
          <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800 border-2 border-yellow-300 dark:border-yellow-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {characterName?.charAt(0).toUpperCase() || "?"}
            </span>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-400 dark:bg-yellow-600 rounded-full border border-white dark:border-gray-800"></div>
          </div>
        );
      }
      
      // Render the avatar if we have one
      if (avatarToShow) {
        return (
          <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            {avatarToShow.profileImageUrl?.includes("firebasestorage") ||
             avatarToShow.profileImageUrl?.includes("storage.googleapis.com") ? (
              // Use regular img tag for Firebase Storage URLs
              <img
                src={avatarToShow.profileImageUrl}
                alt={avatarToShow.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Error loading avatar image:", e);
                }}
              />
            ) : avatarToShow.profileImageUrl ? (
              // Use Next.js Image for other URLs
              <Image
                src={avatarToShow.profileImageUrl}
                alt={avatarToShow.name}
                fill
                className="object-cover"
                unoptimized={true}
              />
            ) : (
              // Fallback for avatars with no image
              <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white font-bold text-lg">
                {avatarToShow.name?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
        );
      }
    }
    
    // Fallback avatar when no image available
    return (
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
        {message.role === "user" ? "You" : characterName?.charAt(0).toUpperCase() || "AI"}
      </div>
    );
  };

  // For multi-avatar chats with streaming, render the parts differently
  if (!isUser && messageParts.length > 0) {
    // We're dealing with a multi-avatar message that needs to be split
    
    // For streaming messages, we need special handling
    if (isStreaming) {
      return (
        <div ref={messageRef} className="multi-avatar-message-container">
          {messageParts.map((part, idx) => (
            <div
              key={`${messageIndex}-part-${idx}`}
              className={cn(
                "py-6 px-4 flex gap-4 group relative",
                "bg-slate-50 dark:bg-slate-900/50",
                isWaitingForResponse && "opacity-70",
                isEditedInCurrentVersion && "bg-indigo-50/30 dark:bg-indigo-900/10",
                editedMessagesInCurrentVersion.includes(messageIndex) &&
                  "border-l-2 border-indigo-400 dark:border-indigo-600",
                idx > 0 && "mt-1" // Add slight spacing between character messages
              )}
            >
              {renderAvatar(part.character)}
              
              <div className="flex-1 space-y-2 overflow-hidden">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  {getMessageSender(part.character)}
                </h3>
                
                <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0">
                  <div className="streaming-content">
                    <MarkdownRenderer 
                      content={part.content}
                      isDark={isDark}
                      collapsedCodeBlocks={collapsedCodeBlocks}
                      toggleCodeBlock={toggleCodeBlock}
                    />
                    {idx === messageParts.length - 1 && (
                      <span className="typing-indicator">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    // For non-streaming multi-avatar messages
    return (
      <div ref={messageRef} className="multi-avatar-message-container">
        {messageParts.map((part, idx) => (
          <div
            key={`${messageIndex}-part-${idx}`}
            className={cn(
              "py-6 px-4 flex gap-4 group relative",
              "bg-slate-50 dark:bg-slate-900/50",
              isWaitingForResponse && "opacity-70",
              isEditedInCurrentVersion && "bg-indigo-50/30 dark:bg-indigo-900/10",
              editedMessagesInCurrentVersion.includes(messageIndex) &&
                "border-l-2 border-indigo-400 dark:border-indigo-600",
              idx > 0 && "mt-1" // Add slight spacing between character messages
            )}
          >
            {renderAvatar(part.character)}
            
            <div className="flex-1 space-y-2 overflow-hidden">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {getMessageSender(part.character)}
              </h3>
              
              <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0">
                <MarkdownRenderer 
                  content={part.content}
                  isDark={isDark}
                  collapsedCodeBlocks={collapsedCodeBlocks}
                  toggleCodeBlock={toggleCodeBlock}
                />
              </div>
              
              {/* Only show message actions for the last part */}
              {idx === messageParts.length - 1 && (
                <div className="flex items-center space-x-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {/* Show version indicator if this message was edited */}
                  {isEditedInCurrentVersion && (
                    <div className="flex items-center mr-2">
                      <ArrowPathIcon className="h-3 w-3 mr-1" />
                      <span>Edited</span>
                    </div>
                  )}

                  {/* Show if this message was edited in the current version */}
                  {!isEditedInCurrentVersion &&
                    editedMessagesInCurrentVersion.includes(messageIndex) && (
                      <div className="flex items-center mr-2 text-indigo-500 dark:text-indigo-400">
                        <ArrowPathIcon className="h-3 w-3 mr-1" />
                        <span>Previously Edited</span>
                      </div>
                    )}

                  {/* Show loading indicator if waiting for response */}
                  {isWaitingForResponse && (
                    <div className="flex items-center mr-2 text-indigo-500 dark:text-indigo-400 animate-pulse">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      <span>Waiting for response...</span>
                    </div>
                  )}

                  {/* Message actions */}
                  <div className="flex items-center space-x-2 mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canEdit && !isEditing && (
                      <button
                        onClick={handleEditMessage}
                        className="flex items-center space-x-1 p-1 rounded-md hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label="Edit message"
                        disabled={isEditingMessage || waitingForResponse}
                      >
                        <PencilIcon className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                    )}
                    <button
                      onClick={handleCopyMessage}
                      className="flex items-center space-x-1 p-1 rounded-md hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      aria-label="Copy message"
                    >
                      {messageCopied ? (
                        <>
                          <CheckIcon className="h-3 w-3 text-green-500" />
                          <span className="text-green-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <ClipboardIcon className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Show version navigator outside the individual bubbles */}
        {showVersionNavigator && (
          <div className="pl-4 py-2">
            <MessageVersionIndicator messageIndex={messageIndex} />
          </div>
        )}
      </div>
    );
  }

  // Regular single-message rendering (existing code for user messages or single avatar)
  return (
    <div
      ref={messageRef}
      className={cn(
        "py-6 px-4 flex gap-4 group relative",
        isUser
          ? "bg-white dark:bg-slate-950"
          : "bg-slate-50 dark:bg-slate-900/50",
        isWaitingForResponse && "opacity-70",
        isEditedInCurrentVersion && "bg-indigo-50/30 dark:bg-indigo-900/10",
        editedMessagesInCurrentVersion.includes(messageIndex) &&
          "border-l-2 border-indigo-400 dark:border-indigo-600",
        isStreaming && "streaming-message-container"
      )}
    >
      {renderAvatar()}

      <div className="flex-1 space-y-2 overflow-hidden">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          {getMessageSender()}
        </h3>

        {isEditing ? (
          <MessageEditor
            initialContent={message.content}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        ) : (
          <>
            <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0">
              {isStreaming ? (
                <div className="streaming-content">
                  <MarkdownRenderer 
                    content={isUser ? message.content : cleanMessageContent(message.content)}
                    isDark={isDark}
                    collapsedCodeBlocks={collapsedCodeBlocks}
                    toggleCodeBlock={toggleCodeBlock}
                  />
                  <span className="typing-indicator">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </span>
                </div>
              ) : (
                <MarkdownRenderer 
                  content={isUser ? message.content : cleanMessageContent(message.content)}
                  isDark={isDark}
                  collapsedCodeBlocks={collapsedCodeBlocks}
                  toggleCodeBlock={toggleCodeBlock}
                />
              )}
            </div>

            {/* Message actions below the content */}
            <div className="flex items-center space-x-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
              {/* Show version indicator if this message was edited */}
              {isEditedInCurrentVersion && (
                <div className="flex items-center mr-2">
                  <ArrowPathIcon className="h-3 w-3 mr-1" />
                  <span>Edited</span>
                </div>
              )}

              {/* Show if this message was edited in the current version */}
              {!isEditedInCurrentVersion &&
                editedMessagesInCurrentVersion.includes(messageIndex) && (
                  <div className="flex items-center mr-2 text-indigo-500 dark:text-indigo-400">
                    <ArrowPathIcon className="h-3 w-3 mr-1" />
                    <span>Previously Edited</span>
                  </div>
                )}

              {/* Show loading indicator if waiting for response */}
              {isWaitingForResponse && (
                <div className="flex items-center mr-2 text-indigo-500 dark:text-indigo-400 animate-pulse">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  <span>Waiting for response...</span>
                </div>
              )}

              {/* Message actions */}
              <div className="flex items-center space-x-2 mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {canEdit && !isEditing && (
                  <button
                    onClick={handleEditMessage}
                    className="flex items-center space-x-1 p-1 rounded-md hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Edit message"
                    disabled={isEditingMessage || waitingForResponse}
                  >
                    <PencilIcon className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                )}
                <button
                  onClick={handleCopyMessage}
                  className="flex items-center space-x-1 p-1 rounded-md hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Copy message"
                >
                  {messageCopied ? (
                    <>
                      <CheckIcon className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <ClipboardIcon className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Show version navigator on the message that was edited in any version */}
        {showVersionNavigator && (
          <MessageVersionIndicator messageIndex={messageIndex} />
        )}
      </div>
    </div>
  );
}

// Function to clean content by removing avatar name prefix if present
function cleanMessageContent(content) {
  if (!content) return "";
  // Remove the [Name] prefix from multi-avatar messages
  return content.replace(/^\[(.*?)\]\s*/, '');
}
