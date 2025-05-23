"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { chatApi } from "@/lib/api/chat";
import { useAuth } from "@/context/AuthContext";
import { useAvatar } from "@/context/AvatarContext";
import { toast } from "sonner";

const ChatContext = createContext({});

export const ChatProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { selectedAvatar, getAllAvatars, selectAvatar } = useAvatar();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState(false);
  const [streamController, setStreamController] = useState(null);
  const [manualReset, setManualReset] = useState(false);
  const [selectingChatId, setSelectingChatId] = useState(null);
  const selectionTimeoutRef = useRef(null);
  const [recentSelections, setRecentSelections] = useState({});

  // Check API key status when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      console.log("User authenticated, checking API key status");
      checkApiKeyStatus();
    } else if (!authLoading) {
      console.log("User not authenticated, resetting chat state");
      // Reset state when user is not authenticated
      setChats([]);
      setCurrentChat(null);
      setHasApiKey(false);
      setModels([]);
      setSelectedModel(null);
    }
  }, [user, authLoading]);

  // Load chats and models when user is authenticated and has API key
  useEffect(() => {
    if (user && !authLoading && hasApiKey) {
      loadChats();
      loadModels();
    }
  }, [user, authLoading, hasApiKey]);

  // Clean up streaming when component unmounts
  useEffect(() => {
    return () => {
      if (streamController) {
        streamController.abort();
      }
    };
  }, [streamController]);

  const loadChats = async () => {
    setLoadingChats(true);
    try {
      const chatsData = await chatApi.getChats();
      console.log("Chats loaded:", chatsData);
      
      // Enhance chats with avatar information if available
      const allAvatars = getAllAvatars ? getAllAvatars() : [];
      console.log("Available avatars for linking:", allAvatars.length);
      
      const enhancedChats = chatsData?.map(chat => {
        if (chat.avatarId) {
          const avatar = allAvatars.find(a => a.id === chat.avatarId);
          
          // Ensure messages are properly formatted
          const formattedMessages = chat.messages?.map(msg => ({
            ...msg,
            content: msg.content || "",
            timestamp: msg.timestamp || Math.floor(Date.now() / 1000),
            role: msg.role || (msg.isUser ? "user" : "assistant")
          })) || [];
          
          // Önbelleği güncelle, eğer avatar bilgisi bulduysan
          if (avatar && typeof window !== "undefined") {
            window.__avatarCache = window.__avatarCache || {};
            window.__avatarCache[chat.avatarId] = avatar;
            console.log(`Avatar cached: ${avatar.name} (${chat.avatarId})`);
          } else {
            console.log(`Avatar not found for chat: ${chat.title} (ID: ${chat.avatarId})`);
          }
          
          return avatar ? { 
            ...chat, 
            avatar,
            messages: formattedMessages
          } : {
            ...chat,
            messages: formattedMessages
          };
        }
        
        // Format messages even without avatar
        return {
          ...chat,
          messages: chat.messages?.map(msg => ({
            ...msg,
            content: msg.content || "",
            timestamp: msg.timestamp || Math.floor(Date.now() / 1000),
            role: msg.role || (msg.isUser ? "user" : "assistant")
          })) || []
        };
      }) || [];
      
      setChats(enhancedChats);
      
      // If we have a currently selected chat, update its messages too
      if (currentChat) {
        const updatedChat = enhancedChats.find(c => c.id === currentChat.id);
        if (updatedChat) {
          setCurrentChat(updatedChat);
        }
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Failed to load chats:", error);
        setChats([]);
      }
    } finally {
      setLoadingChats(false);
    }
  };

  const loadModels = async () => {
    try {
      const modelsData = await chatApi.getModels();
      console.log("Models loaded:", modelsData);
      setModels(modelsData || []);

      // Only update existing model reference if needed, don't auto-select first model
      if (selectedModel && typeof selectedModel === "string" && modelsData && modelsData.length > 0) {
        // If selectedModel is just an ID, find the full model object
        const model = modelsData.find((m) => m.id === selectedModel);
        if (model) {
          console.log(
            "Updating selected model from ID to full object:",
            model
          );
          setSelectedModel(model);
        }
      }
    } catch (error) {
      console.error("Failed to load models:", error);
      setModels([]);
    }
  };

  const checkApiKeyStatus = async () => {
    // Skip if user is not authenticated
    if (!user) {
      console.log("User not authenticated, skipping API key status check");
      setHasApiKey(false);
      return;
    }

    try {
      const status = await chatApi.getApiKeyStatus();
      setHasApiKey(status.hasKey || false);
    } catch (error) {
      console.error("Failed to check API key status:", error);
      // Don't show error toast for auth errors
      if (error.response?.status !== 401 && error.response?.status !== 500) {
        toast.error("Failed to check API key status");
      }
      setHasApiKey(false);
    }
  };

  const setApiKey = async (key) => {
    try {
      await chatApi.setApiKey(key);
      setHasApiKey(true);
      toast.success("API key set successfully");
      await loadModels();
      return true;
    } catch (error) {
      console.error("Failed to set API key:", error);
      toast.error("Failed to set API key");
      return false;
    }
  };

  const createChat = async (chatData) => {
    console.log("Creating chat with data:", chatData);
    console.log("Selected model:", selectedModel);
    
    const { message, avatarId, avatarIds } = chatData;

    if (!selectedModel) {
      console.error("No model selected");
      toast.error("Please select a model first");
      return null;
    }

    // If no avatar information provided, use the context values
    const useAvatarId = avatarId || (selectedAvatar ? selectedAvatar.id : null);
    const useAvatarIds = avatarIds || null; // Get avatarIds directly from the chatData, not from context
    
    // We need either a single avatarId or multiple avatarIds
    if (!useAvatarId && (!useAvatarIds || useAvatarIds.length === 0)) {
      console.error("No avatar selected");
      toast.error("Please select at least one avatar");
      return null;
    }

    // Get the model ID, handling both cases where selectedModel is the full object or just the ID
    const modelId =
      selectedModel && typeof selectedModel === "object"
        ? selectedModel.id
        : selectedModel;

    setLoading(true);
    try {
      // Prepare the request data
      const requestData = {
        message: message || "", // Allow empty message
        modelId,
      };
      
      // Add avatar information
      if (useAvatarIds && useAvatarIds.length > 0) {
        requestData.avatarIds = useAvatarIds;
        // For backward compatibility, also set the first avatarId
        requestData.avatarId = useAvatarIds[0];
      } else if (useAvatarId) {
        requestData.avatarId = useAvatarId;
      }

      const chatData = await chatApi.createChat(requestData);

      // Determine which avatar(s) to associate with this chat
      let chatAvatars = null;
      if (useAvatarIds && useAvatarIds.length > 0) {
        // Multi-avatar mode
        chatAvatars = useAvatarIds.map(id => 
          getAllAvatars().find(a => a.id === id)
        ).filter(a => a !== undefined);
      } else if (useAvatarId) {
        // Single avatar mode
        chatAvatars = [getAllAvatars().find(a => a.id === useAvatarId)].filter(a => a !== undefined);
      }

      // Store the avatar information with the chat for easy access
      const chatWithAvatar = {
        ...chatData,
        avatar: chatAvatars && chatAvatars.length > 0 ? chatAvatars[0] : null, // First avatar for backward compatibility
        avatars: chatAvatars || [], // All avatars
      };

      setChats((prevChats) => [chatWithAvatar, ...prevChats]);
      setCurrentChat(chatWithAvatar);
      return chatWithAvatar;
    } catch (error) {
      console.error("Failed to create chat:", error);
      toast.error("Failed to create chat");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (chatId, message, editIndex = null) => {
    setLoading(true);
    try {
      // Get the model to use - use the current chat's model if available, otherwise use selected model
      const modelToUse = currentChat?.modelId ? 
        (models.find(m => m.id === currentChat.modelId) || selectedModel) : 
        selectedModel;
      
      // If editIndex is provided, we're editing a message
      const isEditing = editIndex !== null;
      
      const updatedChat = await chatApi.sendMessage(
        chatId,
        message,
        modelToUse,
        isEditing ? editIndex : undefined
      );
      
      // Ensure messages are properly formatted
      if (updatedChat && updatedChat.messages) {
        updatedChat.messages = updatedChat.messages.map(msg => ({
          ...msg,
          content: msg.content || "",
          timestamp: msg.timestamp || Math.floor(Date.now() / 1000),
          role: msg.role || (msg.isUser ? "user" : "assistant")
        }));
      }

      // Update the current chat with the new messages
      setCurrentChat(updatedChat);

      // Update the chat in the chats list
      setChats((prevChats) =>
        prevChats.map((chat) => (chat.id === chatId ? updatedChat : chat))
      );

      return updatedChat;
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const sendMessageStream = async (chatId, message, onChunk) => {
    setStreamingMessage(true);
    
    // Create a new abort controller for this streaming request
    const controller = new AbortController();
    setStreamController(controller);
    
    try {
      // Make sure we have a current chat
      if (!currentChat) {
        throw new Error("No current chat selected");
      }

      console.log("Starting sendMessageStream with message:", message);

      // Get the model to use - use the current chat's model if available, otherwise use selected model
      const modelToUse = currentChat.modelId ? 
        (models.find(m => m.id === currentChat.modelId) || selectedModel) : 
        selectedModel;

      // Add the user message to the current chat immediately
      const now = Math.floor(Date.now() / 1000);
      const userMessage = {
        role: "user",
        content: message,
        timestamp: now,
      };

      // First update with just the user message
      const userOnlyChat = {
        ...currentChat,
        messages: [...(currentChat.messages || []), userMessage],
        updatedAt: now,
      };

      console.log("Setting current chat with user message only");
      setCurrentChat(userOnlyChat);

      // Update the chat in the chats list with just the user message
      setChats((prevChats) =>
        prevChats.map((chat) => (chat.id === chatId ? userOnlyChat : chat))
      );

      // Create a temporary assistant message for streaming
      const assistantMessage = {
        role: "assistant",
        content: "",
        timestamp: now,
        streaming: true,
      };

      // Now update with both messages
      const updatedChat = {
        ...currentChat,
        messages: [...userOnlyChat.messages, assistantMessage],
        updatedAt: now,
      };

      console.log("Setting current chat with both messages");
      setCurrentChat(updatedChat);

      // Update the chat in the chats list with both messages
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === chatId) {
            // Make sure we preserve the user message when updating
            const chatMessages = [...chat.messages];

            // Check if the last message is from the user
            const hasUserMessage =
              chatMessages.length > 0 &&
              chatMessages[chatMessages.length - 1].role === "user" &&
              chatMessages[chatMessages.length - 1].content === message;

            if (hasUserMessage) {
              // Add the assistant message after the user message
              return {
                ...chat,
                messages: [...chatMessages, assistantMessage],
                updatedAt: now,
              };
            } else {
              // Add both messages if the user message is missing
              return {
                ...chat,
                messages: [
                  ...chatMessages,
                  {
                    role: "user",
                    content: message,
                    timestamp: now - 1,
                  },
                  assistantMessage,
                ],
                updatedAt: now,
              };
            }
          }
          return chat;
        })
      );

      // Define a callback to handle streaming chunks
      const handleChunk = (chunk) => {
        // Update the assistant message with the new content
        setCurrentChat((prevChat) => {
          if (!prevChat) return prevChat;

          const updatedMessages = [...prevChat.messages];
          const lastMessageIndex = updatedMessages.length - 1;

          // If the last message is an assistant message, update its content
          if (
            lastMessageIndex >= 0 &&
            updatedMessages[lastMessageIndex].role === "assistant"
          ) {
            updatedMessages[lastMessageIndex] = {
              ...updatedMessages[lastMessageIndex],
              content: updatedMessages[lastMessageIndex].content + chunk,
            };
          }

          return {
            ...prevChat,
            messages: updatedMessages,
          };
        });

        // Call the provided onChunk callback if available
        if (onChunk) {
          onChunk(chunk);
        }
      };

      // Stream the message with the abort controller's signal
      console.log("Starting API streaming request");
      const fullResponse = await chatApi.sendMessageStream(
        chatId,
        message,
        modelToUse,
        handleChunk,
        controller.signal
      );
      console.log("API streaming request completed");

      // Update the chat with the complete response
      setCurrentChat((prevChat) => {
        if (!prevChat) return prevChat;

        const updatedMessages = [...prevChat.messages];
        const lastMessageIndex = updatedMessages.length - 1;

        // Update the last message with the full response and remove streaming flag
        if (
          lastMessageIndex >= 0 &&
          updatedMessages[lastMessageIndex].role === "assistant"
        ) {
          updatedMessages[lastMessageIndex] = {
            ...updatedMessages[lastMessageIndex],
            content: fullResponse || updatedMessages[lastMessageIndex].content,
            streaming: false,
          };
        }

        return {
          ...prevChat,
          messages: updatedMessages,
        };
      });

      // Update the chat in the chats list
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === chatId) {
            const updatedMessages = [...chat.messages];
            const lastMessageIndex = updatedMessages.length - 1;

            if (
              lastMessageIndex >= 0 &&
              updatedMessages[lastMessageIndex].role === "assistant"
            ) {
              updatedMessages[lastMessageIndex] = {
                ...updatedMessages[lastMessageIndex],
                content:
                  fullResponse || updatedMessages[lastMessageIndex].content,
                streaming: false,
              };
            }

            return {
              ...chat,
              messages: updatedMessages,
              updatedAt: now,
            };
          }
          return chat;
        })
      );

      return fullResponse;
    } catch (error) {
      // If this is not an abort error (user cancelled), show an error
      if (error.name !== 'AbortError') {
        console.error("Failed to stream message:", error);

        // Update the current chat to remove the streaming state and show error
        setCurrentChat((prevChat) => {
          if (!prevChat) return prevChat;

          const updatedMessages = [...prevChat.messages];
          const lastMessageIndex = updatedMessages.length - 1;

          // If the last message is an assistant message, mark it as not streaming
          if (
            lastMessageIndex >= 0 &&
            updatedMessages[lastMessageIndex].role === "assistant"
          ) {
            updatedMessages[lastMessageIndex] = {
              ...updatedMessages[lastMessageIndex],
              streaming: false,
              content:
                updatedMessages[lastMessageIndex].content +
                " [Error: Failed to complete response]",
            };
          }

          return {
            ...prevChat,
            messages: updatedMessages,
          };
        });

        toast.error("Failed to stream message");
      } else {
        console.log("Message streaming was cancelled");
      }
      return null;
    } finally {
      setStreamingMessage(false);
      setStreamController(null);
    }
  };

  // Function to cancel an ongoing streaming request
  const cancelMessageStream = () => {
    if (streamController) {
      streamController.abort();
      setStreamingMessage(false);
      
      // Update the current chat to remove the streaming state
      setCurrentChat((prevChat) => {
        if (!prevChat) return prevChat;

        const updatedMessages = [...prevChat.messages];
        const lastMessageIndex = updatedMessages.length - 1;

        // If the last message is an assistant message, mark it as not streaming
        if (
          lastMessageIndex >= 0 &&
          updatedMessages[lastMessageIndex].role === "assistant"
        ) {
          updatedMessages[lastMessageIndex] = {
            ...updatedMessages[lastMessageIndex],
            streaming: false,
            content: updatedMessages[lastMessageIndex].content + " [Cancelled]",
          };
        }

        return {
          ...prevChat,
          messages: updatedMessages,
        };
      });
    }
  };

  const deleteChat = async (chatId) => {
    try {
      await chatApi.deleteChat(chatId);

      // Remove the chat from the chats list
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));

      // If the deleted chat is the current chat, set currentChat to null
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
      }

      toast.success("Chat deleted");
      return true;
    } catch (error) {
      console.error("Failed to delete chat:", error);
      toast.error("Failed to delete chat");
      return false;
    }
  };

  const selectChat = (chatId) => {
    // 1. Temel kontroller
    if (loadingChats || loading) {
      console.log("Ignoring selectChat during loading state");
      return false;
    }
    
    if (manualReset && chatId !== null) {
      console.log("Ignoring selectChat during manual reset");
      return false;
    }

    // 2. Zaten seçili veya işlemde olan sohbeti kontrol et
    if (currentChat?.id === chatId) {
      console.log("Chat already selected, ignoring");
      return true;
    }
    
    if (selectingChatId) {
      console.log(`Another chat selection in progress (${selectingChatId}), ignoring selection of ${chatId}`);
      return false;
    }
    
    // 3. Son 2 saniye içinde seçim yapıldıysa önle
    const now = Date.now();
    const lastSelectedTime = recentSelections[chatId] || 0;
    if (now - lastSelectedTime < 2000) {
      console.log(`Chat ${chatId} was selected less than 2 seconds ago, preventing duplicate selection`);
      return false;
    }
    
    // 4. Seçim durumunu kaydet
    setRecentSelections(prev => ({
      ...prev,
      [chatId]: now
    }));

    // Track that we're in the process of selecting a chat
    setSelectingChatId(chatId);
    
    // Clear any existing timeout
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    // 5. Null bir chatId işlemi
    if (!chatId) {
      console.log("Setting currentChat to null");
      setCurrentChat(null);
      
      selectionTimeoutRef.current = setTimeout(() => {
        setSelectingChatId(null);
      }, 200);
      
      return false;
    }
    
    // 6. Gerçek sohbet seçim işlemi
    const chat = chats.find((c) => c.id === chatId);
    
    if (chat) {
      console.log(`Found chat with ID ${chatId}, setting as current chat`);
      
      // Sohbeti tek seferde ayarla, yumuşak geçiş için ekstra bir gecikme eklemeyin
      setCurrentChat(chat);
      
      // Diğer ilgili bilgileri ayarla
      const chatModel = chat.modelId ? models.find(m => m.id === chat.modelId) : null;
      if (chatModel) setSelectedModel(chatModel);
      else if (chat.modelId && models.length > 0) setSelectedModel(chat.modelId);
      
      if (chat.avatar) selectAvatar(chat.avatar);
      else if (chat.avatarId) {
        const allAvatars = getAllAvatars ? getAllAvatars() : [];
        const matchingAvatar = allAvatars.find(a => a.id === chat.avatarId);
        if (matchingAvatar) selectAvatar(matchingAvatar);
      }
      
      // Seçim durumunu sonra temizle
      selectionTimeoutRef.current = setTimeout(() => {
        setSelectingChatId(null);
        console.log(`Selection state cleared for chat ${chatId}`);
      }, 400); // Süreyi kısalttım
      
      return true;
    } else {
      console.log(`Chat with ID ${chatId} not found, setting currentChat to null`);
      setCurrentChat(null);
      
      selectionTimeoutRef.current = setTimeout(() => {
        setSelectingChatId(null);
      }, 200);
      
      return false;
    }
  };

  // Function to indicate we're doing a manual reset
  const setManualChatReset = (value) => {
    console.log("Manual chat reset:", value);
    setManualReset(value);
  };

  // Add a helper method to check if a chat exists
  const chatExists = (chatId) => {
    return chats.some(c => c.id === chatId);
  };

  // Add a selectModel function
  const selectModel = (modelId) => {
    console.log("Selecting model with ID:", modelId);
    // Find the full model object by ID
    const model = models.find((m) => m.id === modelId);
    if (model) {
      console.log("Found model:", model);
      setSelectedModel(model);
    } else {
      console.error("Model not found with ID:", modelId);
      // If model not found but we have models, select the first one
      if (models.length > 0) {
        console.log("Selecting first available model:", models[0]);
        setSelectedModel(models[0]);
      }
    }
  };

  // Add any chat with the latest messages from the server
  const updateChat = (updatedChat) => {
    if (!updatedChat) return;
    
    setChats((prevChats) => 
      prevChats.map((chat) => 
        chat.id === updatedChat.id ? {...chat, ...updatedChat} : chat
      )
    );
    
    // If this is the current chat, update it
    if (currentChat?.id === updatedChat.id) {
      setCurrentChat({...currentChat, ...updatedChat});
    }
  };

  // Add a function to refresh a specific chat's messages
  const refreshChatMessages = async (chatId) => {
    try {
      const chatData = await chatApi.getChat(chatId);
      
      if (chatData && chatData.messages) {
        // Format messages properly
        chatData.messages = chatData.messages.map(msg => ({
          ...msg,
          content: msg.content || "",
          timestamp: msg.timestamp || Math.floor(Date.now() / 1000),
          role: msg.role || (msg.isUser ? "user" : "assistant")
        }));
        
        // Update in state
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === chatId ? { ...chat, messages: chatData.messages } : chat
          )
        );
        
        // Update current chat if it's the one we're refreshing
        if (currentChat && currentChat.id === chatId) {
          setCurrentChat(prev => ({ ...prev, messages: chatData.messages }));
        }
        
        return chatData.messages;
      }
    } catch (error) {
      console.error("Failed to refresh chat messages:", error);
      toast.error("Failed to get latest messages");
    }
    return null;
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        models,
        selectedModel,
        hasApiKey,
        loading,
        loadingChats,
        streamingMessage,
        selectingChatId, // Expose the selection state
        createChat,
        selectChat,
        chatExists,  // Add the new helper function
        sendMessage,
        sendMessageStream,
        cancelMessageStream,
        deleteChat,
        setApiKey,
        selectModel,
        updateChat,
        loadChats,
        refreshChatMessages,
        setManualChatReset, // Add this new function
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  return useContext(ChatContext);
};
