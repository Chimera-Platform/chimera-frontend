"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useChat } from "@/context/ChatContext";

const ChatVersionContext = createContext({});

export const ChatVersionProvider = ({ children }) => {
  const { currentChat, sendMessage, refreshChatMessages } = useChat();

  // State for chat versions
  const [chatVersions, setChatVersions] = useState([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [editedMessageIndices, setEditedMessageIndices] = useState([]);
  const [initializedChats, setInitializedChats] = useState(new Set());
  const [editHistory, setEditHistory] = useState([]);

  // Initialize chat versions when currentChat changes
  useEffect(() => {
    if (currentChat) {
      console.log("Current chat changed:", currentChat.id);

      // Check if we already have versions for this chat
      const hasVersions = chatVersions.some((v) => v.chatId === currentChat.id);

      if (!hasVersions) {
        console.log(
          "No versions found for this chat, initializing with chat messages"
        );

        // Get the messages from the current chat
        const chatMessages = currentChat.messages || [];
        console.log("Chat has", chatMessages.length, "messages");
        
        // Ensure messages are properly formatted
        const formattedMessages = chatMessages.map(msg => ({
          ...msg,
          content: msg.content || "",
          timestamp: msg.timestamp || Math.floor(Date.now() / 1000),
          role: msg.role || (msg.isUser ? "user" : "assistant")
        }));

        // Initialize with the current chat messages
        const newVersion = {
          id: 1,
          messages: formattedMessages,
          timestamp: new Date(),
          editedMessageIndices: [],
          edits: [],
          chatId: currentChat.id,
        };

        setChatVersions([newVersion]);
        setCurrentVersionIndex(0);
        setEditHistory([]);

        // Add this chat to initialized chats
        setInitializedChats((prev) => new Set([...prev, currentChat.id]));

        // Save to localStorage
        try {
          localStorage.setItem(
            `chat_versions_${currentChat.id}`,
            JSON.stringify([newVersion])
          );
          localStorage.setItem(`chat_current_version_${currentChat.id}`, "0");
          localStorage.setItem(
            `chat_edit_history_${currentChat.id}`,
            JSON.stringify([])
          );
        } catch (error) {
          console.error("Error saving versions to localStorage:", error);
        }
      } else {
        console.log("Found existing versions for this chat");
      }
    } else {
      // Reset state when no chat is selected
      console.log("No current chat, resetting state");
      setChatVersions([]);
      setCurrentVersionIndex(0);
      setWaitingForResponse(false);
      setEditedMessageIndices([]);
      setIsEditingMessage(false);
      setEditHistory([]);
    }
  }, [currentChat?.id]); // Only re-run when the chat ID changes

  // Handle new chat creation
  useEffect(() => {
    if (
      currentChat &&
      currentChat.messages &&
      currentChat.messages.length === 0
    ) {
      // This is a brand new chat, reset everything
      setChatVersions([
        {
          id: 1,
          messages: [],
          timestamp: new Date(),
          editedMessageIndices: [],
          edits: [],
          chatId: currentChat.id,
        },
      ]);
      setCurrentVersionIndex(0);
      setWaitingForResponse(false);
      setEditedMessageIndices([]);
      setIsEditingMessage(false);
      setEditHistory([]);

      // Remove any saved versions for this chat
      localStorage.removeItem(`chat_versions_${currentChat.id}`);
      localStorage.removeItem(`chat_current_version_${currentChat.id}`);
      localStorage.removeItem(`chat_edit_history_${currentChat.id}`);

      // Mark this chat as initialized
      setInitializedChats((prev) => new Set([...prev, currentChat.id]));
    }
  }, [currentChat?.id, currentChat?.messages]);

  // Create a new version when editing a message
  const editMessage = async (messageIndex, newContent) => {
    if (!currentChat) return;

    setIsEditingMessage(true);
    setWaitingForResponse(true);

    // Add the messageIndex to editedMessageIndices if not already present
    setEditedMessageIndices((prev) =>
      prev.includes(messageIndex) ? prev : [...prev, messageIndex]
    );

    // Create a copy of the current version's messages
    const currentMessages = [...chatVersions[currentVersionIndex].messages];

    // Update the message content
    currentMessages[messageIndex] = {
      ...currentMessages[messageIndex],
      content: newContent,
    };

    // If we're not at the latest version, remove all versions after the current one
    const updatedVersions = chatVersions.slice(0, currentVersionIndex + 1);

    // Record this edit in the edit history
    const newEdit = {
      versionIndex: currentVersionIndex,
      messageIndex,
      oldContent:
        chatVersions[currentVersionIndex].messages[messageIndex].content,
      newContent,
      timestamp: new Date(),
      chatId: currentChat.id,
    };

    const updatedEditHistory = [...editHistory, newEdit];
    setEditHistory(updatedEditHistory);

    try {
      // For user messages, we need to regenerate the AI response
      if (currentMessages[messageIndex].role === "user") {
        // Create a new version with only messages before the edit
        const messagesBeforeEdit = currentMessages.slice(0, messageIndex + 1);
        
        // Create a new version with only messages before the edit
        const newVersion = {
          id: chatVersions.length + 1,
          messages: messagesBeforeEdit,
          timestamp: new Date(),
          editedMessageIndices: [...editedMessageIndices, messageIndex],
          edits: [...(chatVersions[currentVersionIndex].edits || []), newEdit],
          chatId: currentChat.id,
        };

        // Add the new version
        setChatVersions([...updatedVersions, newVersion]);
        setCurrentVersionIndex(updatedVersions.length);

        // Send the message to get a new response
        try {
          // Pass messageIndex as editIndex to let backend know we're editing
          const updatedChat = await sendMessage(currentChat.id, newContent, messageIndex);
          
          if (updatedChat) {
            // After sending the edited message, refresh the messages
            await refreshChatMessages(currentChat.id);
          }
        } catch (error) {
          console.error("Error sending edited message:", error);
          toast.error("Failed to update message");
        }
      } else {
        // For AI messages, just update the content without regenerating
        const newVersion = {
          id: chatVersions.length + 1,
          messages: currentMessages,
          timestamp: new Date(),
          editedMessageIndices: [...editedMessageIndices, messageIndex],
          edits: [...(chatVersions[currentVersionIndex].edits || []), newEdit],
          chatId: currentChat.id,
        };

        // Add the new version
        setChatVersions([...updatedVersions, newVersion]);
        setCurrentVersionIndex(updatedVersions.length);
      }
    } catch (error) {
      console.error("Error editing message:", error);
      toast.error("Failed to edit message");
    } finally {
      setWaitingForResponse(false);
      setIsEditingMessage(false);
    }

    // Save edit history to localStorage
    try {
      localStorage.setItem(
        `chat_edit_history_${currentChat.id}`,
        JSON.stringify(updatedEditHistory)
      );
    } catch (error) {
      console.error("Error saving edit history to localStorage:", error);
    }
  };

  // Navigate to a specific version
  const navigateToVersion = (versionIndex) => {
    if (versionIndex >= 0 && versionIndex < chatVersions.length) {
      console.log(`Navigating to version ${versionIndex}`);

      // When navigating, we need to update the edited message indices
      const targetVersion = chatVersions[versionIndex];

      // Set the current version index first
      setCurrentVersionIndex(versionIndex);

      // Then update the edited message indices
      setEditedMessageIndices(targetVersion.editedMessageIndices || []);

      // Save the current version index to localStorage
      try {
        localStorage.setItem(
          `chat_current_version_${currentChat.id}`,
          versionIndex.toString()
        );
      } catch (error) {
        console.error(
          "Error saving current version index to localStorage:",
          error
        );
      }
    }
  };

  // Delete the last user message
  const deleteLastUserMessage = () => {
    if (!currentChat || chatVersions.length === 0) return;

    const currentMessages = [...chatVersions[currentVersionIndex].messages];

    // Find the last user message
    let lastUserMessageIndex = -1;
    for (let i = currentMessages.length - 1; i >= 0; i--) {
      if (currentMessages[i].role === "user") {
        lastUserMessageIndex = i;
        break;
      }
    }

    if (lastUserMessageIndex === -1) return; // No user messages found

    // Remove the last user message and all messages after it
    const updatedMessages = currentMessages.slice(0, lastUserMessageIndex);

    // Record this deletion in the edit history
    const newEdit = {
      versionIndex: currentVersionIndex,
      messageIndex: lastUserMessageIndex,
      oldContent: currentMessages[lastUserMessageIndex].content,
      newContent: null, // null indicates deletion
      timestamp: new Date(),
    };

    const updatedEditHistory = [...editHistory, newEdit];
    setEditHistory(updatedEditHistory);

    // Create a new version
    const newVersion = {
      id: chatVersions.length + 1,
      messages: updatedMessages,
      timestamp: new Date(),
      deletedMessageIndex: lastUserMessageIndex,
      editedMessageIndices: [],
      edits: [...(chatVersions[currentVersionIndex].edits || []), newEdit],
      chatId: currentChat.id,
    };

    // If we're not at the latest version, remove all versions after the current one
    const updatedVersions = chatVersions.slice(0, currentVersionIndex + 1);

    // Add the new version
    setChatVersions([...updatedVersions, newVersion]);
    setCurrentVersionIndex(updatedVersions.length);

    // Save edit history to localStorage
    try {
      localStorage.setItem(
        `chat_edit_history_${currentChat.id}`,
        JSON.stringify(updatedEditHistory)
      );
    } catch (error) {
      console.error("Error saving edit history to localStorage:", error);
    }
  };

  // Add a new message to the current version
  const addMessageToCurrentVersion = (message) => {
    if (!currentChat) {
      console.log("Cannot add message: No current chat");
      return;
    }

    console.log(
      "Adding message to current version:",
      message.role,
      message.content.substring(0, 20) + "..."
    );

    // Get current version
    const currentVersion = chatVersions[currentVersionIndex];

    // If no current version exists, create one with the chat's messages plus the new message
    if (!currentVersion) {
      console.log(
        "No current version exists, creating one with chat messages plus new message"
      );

      // Get messages from the current chat
      const chatMessages = currentChat.messages || [];

      // Create a new version with all existing messages plus the new one
      const newVersion = {
        id: 1,
        messages: [...chatMessages, message],
        timestamp: new Date(),
        editedMessageIndices: [],
        edits: [],
        chatId: currentChat.id,
      };

      // Update the chat versions state
      const updatedVersions = [...chatVersions];
      updatedVersions[currentVersionIndex] = newVersion;
      setChatVersions(updatedVersions);

      // Save to localStorage
      try {
        localStorage.setItem(
          `chat_versions_${currentChat.id}`,
          JSON.stringify(updatedVersions)
        );
      } catch (error) {
        console.error("Error saving versions to localStorage:", error);
      }

      return;
    }

    // Get current messages
    const currentMessages = currentVersion.messages || [];
    console.log("Current messages count:", currentMessages.length);

    // Check if the message already exists to avoid duplicates
    const messageExists = currentMessages.some(
      (msg) =>
        msg.role === message.role &&
        msg.content === message.content &&
        msg.timestamp === message.timestamp
    );

    if (messageExists) {
      console.log("Message already exists, skipping");
      return;
    }

    console.log("Message doesn't exist, adding to version");

    // Add the message to the current messages
    const updatedMessages = [...currentMessages, message];

    // Update the current version with the new message
    const updatedVersion = {
      ...currentVersion,
      messages: updatedMessages,
      editedMessageIndices: currentVersion.editedMessageIndices || [],
      chatId: currentChat.id,
    };

    const updatedVersions = [...chatVersions];
    updatedVersions[currentVersionIndex] = updatedVersion;

    console.log("Setting chat versions with updated version");
    setChatVersions(updatedVersions);

    // If we were waiting for a response to an edited message, mark as no longer waiting
    if (waitingForResponse && message.role === "assistant") {
      console.log("Setting waiting for response to false");
      setWaitingForResponse(false);
    }

    // Save to localStorage immediately to ensure persistence
    try {
      localStorage.setItem(
        `chat_versions_${currentChat.id}`,
        JSON.stringify(updatedVersions)
      );
    } catch (error) {
      console.error("Error saving versions to localStorage:", error);
    }
  };

  // Get all edited messages in the current version
  const getEditedMessagesInCurrentVersion = () => {
    if (!chatVersions[currentVersionIndex]) return [];

    const currentVersion = chatVersions[currentVersionIndex];
    const edits = currentVersion.edits || [];

    // Get unique message indices that were edited
    const editedMessageIndices = [
      ...new Set(edits.map((edit) => edit.messageIndex)),
    ];

    return editedMessageIndices;
  };

  // Save versions to localStorage whenever they change
  useEffect(() => {
    if (currentChat && chatVersions.length > 0) {
      try {
        // Filter out any versions that don't belong to the current chat
        const filteredVersions = chatVersions.map((version) => ({
          ...version,
          chatId: version.chatId || currentChat.id, // Ensure all versions have a chatId
        }));

        localStorage.setItem(
          `chat_versions_${currentChat.id}`,
          JSON.stringify(filteredVersions)
        );
        localStorage.setItem(
          `chat_current_version_${currentChat.id}`,
          currentVersionIndex.toString()
        );
      } catch (error) {
        console.error("Error saving versions to localStorage:", error);
      }
    }
  }, [chatVersions, currentVersionIndex, currentChat]);

  // Clear chat versions when user logs out or is not authenticated
  useEffect(() => {
    if (!currentChat) {
      setChatVersions([]);
      setCurrentVersionIndex(0);
      setWaitingForResponse(false);
      setEditedMessageIndices([]);
      setIsEditingMessage(false);
      setEditHistory([]);
    }
  }, [currentChat]);

  // Add a function to sync with database messages
  const syncWithDatabaseMessages = async () => {
    if (!currentChat || !currentChat.id) return;
    
    try {
      const messages = await refreshChatMessages(currentChat.id);
      
      if (messages && messages.length > 0) {
        // Update the current version with these messages
        setChatVersions(prevVersions => {
          if (!prevVersions || prevVersions.length === 0) {
            // If no versions exist, create a new one
            return [{
              id: 1,
              messages: messages,
              timestamp: new Date(),
              editedMessageIndices: [],
              edits: [],
              chatId: currentChat.id,
            }];
          }
          
          const updatedVersions = [...prevVersions];
          // Only update the latest version
          const latestVersionIndex = updatedVersions.length - 1;
          updatedVersions[latestVersionIndex] = {
            ...updatedVersions[latestVersionIndex],
            messages: messages
          };
          
          return updatedVersions;
        });
      }
    } catch (error) {
      console.error("Error syncing with database messages:", error);
    }
  };

  return (
    <ChatVersionContext.Provider
      value={{
        chatVersions,
        currentVersionIndex,
        currentMessages: chatVersions[currentVersionIndex]?.messages || [],
        isEditingMessage,
        waitingForResponse,
        setWaitingForResponse,
        editedMessageIndices,
        editHistory,
        setIsEditingMessage,
        navigateToVersion,
        editMessage,
        deleteLastUserMessage,
        addMessageToCurrentVersion,
        getEditedMessagesInCurrentVersion,
        setChatVersions,
        syncWithDatabaseMessages
      }}
    >
      {children}
    </ChatVersionContext.Provider>
  );
};

export const useChatVersion = () => {
  return useContext(ChatVersionContext);
};
