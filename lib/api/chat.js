import axios from "axios";
import { auth } from "@/firebase/firebase";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return Promise.reject(error);
  }
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error
      toast.error("Please sign in to continue");
      // You might want to redirect to login page here
    }
    return Promise.reject(error);
  }
);

export const chatApi = {
  // Chat management
  createChat: async (chatData) => {
    try {
      console.log(
        "Creating chat with data:",
        JSON.stringify(chatData, null, 2)
      );
      
      // Prepare the request - ensure either avatarId or avatarIds is sent
      let requestData = { ...chatData };
      
      // If we have avatarIds array but no avatarId, set avatarId to the first avatar
      if (requestData.avatarIds?.length && !requestData.avatarId) {
        requestData.avatarId = requestData.avatarIds[0];
      }
      
      const response = await api.post("/api/chat/create", requestData);
      console.log("Chat created successfully:", response.data);
      
      // If the backend doesn't include modelId in the response,
      // add it from the request data
      if (chatData.modelId && !response.data.modelId) {
        response.data.modelId = chatData.modelId;
      }
      
      // Also ensure avatarId and avatarIds are included
      if (chatData.avatarId && !response.data.avatarId) {
        response.data.avatarId = chatData.avatarId;
      }
      
      if (chatData.avatarIds && !response.data.avatarIds) {
        response.data.avatarIds = chatData.avatarIds;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error creating chat:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      throw error;
    }
  },

  sendMessage: async (chatId, message, modelId, editIndex) => {
    try {
      const payload = {
        message,
        modelId,
      };
      
      // If editIndex is provided, include it in the request
      if (editIndex !== undefined) {
        payload.editIndex = editIndex;
      }
      
      const response = await api.post(`/api/chat/${chatId}/message`, payload);
      
      // Ensure messages are properly formatted
      if (response.data && response.data.messages) {
        response.data.messages = response.data.messages.map(msg => ({
          ...msg,
          content: msg.content || "",
          timestamp: msg.timestamp || Math.floor(Date.now() / 1000),
          role: msg.role || (msg.isUser ? "user" : "assistant")
        }));
      }
      
      return response.data;
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.error || "Failed to send message");
      }
      throw error;
    }
  },

  sendMessageStream: async (chatId, message, modelId, onChunk, signal, editIndex) => {
    console.log("API: Starting sendMessageStream", { chatId, message });
    try {
      // Get the auth token
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }
      const token = await user.getIdToken();

      // Create the request body
      const body = JSON.stringify({
        message,
        modelId,
        editIndex,
      });

      console.log("API: Sending streaming request to server");

      // Create the fetch request with proper headers
      const response = await fetch(
        `${API_BASE_URL}/api/chat/${chatId}/message/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body,
          signal,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API: Streaming request failed", {
          status: response.status,
          error: errorText,
        });
        throw new Error(errorText || "Failed to stream message");
      }

      console.log("API: Streaming request successful, processing stream");

      // Process the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("API: Stream reading complete");
            break;
          }

          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Process each line in the buffer
          let lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep the last incomplete line in the buffer

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.substring(6).trim();

              // Check for the end of the stream
              if (data === "[DONE]") {
                console.log("API: Received [DONE] marker");
                continue;
              }

              try {
                // Try to parse as JSON first (for OpenRouter delta format)
                const jsonData = JSON.parse(data);
                if (
                  jsonData.choices &&
                  jsonData.choices[0] &&
                  jsonData.choices[0].delta
                ) {
                  const content = jsonData.choices[0].delta.content || "";
                  if (content && onChunk) {
                    console.log("API: Streaming chunk:", content);
                    onChunk(content);
                    fullResponse += content;
                  }
                }
              } catch (e) {
                // If not JSON, use the raw data
                if (data && onChunk) {
                  console.log("API: Streaming raw data:", data);
                  onChunk(data);
                  fullResponse += data;
                }
              }
            }
          }
        }
      } catch (streamError) {
        console.error("API: Error processing stream:", streamError);
        // Continue with what we have so far
      }

      // Process any remaining data in the buffer
      if (buffer && buffer.startsWith("data: ")) {
        const data = buffer.substring(6).trim();
        if (data !== "[DONE]") {
          try {
            // Try to parse as JSON first
            const jsonData = JSON.parse(data);
            if (
              jsonData.choices &&
              jsonData.choices[0] &&
              jsonData.choices[0].delta
            ) {
              const content = jsonData.choices[0].delta.content || "";
              if (content && onChunk) {
                console.log("API: Streaming final chunk:", content);
                onChunk(content);
                fullResponse += content;
              }
            }
          } catch (e) {
            // If not JSON, use the raw data
            if (data && onChunk) {
              console.log("API: Streaming final raw data:", data);
              onChunk(data);
              fullResponse += data;
            }
          }
        }
      }

      console.log("API: Full response length:", fullResponse.length);
      return fullResponse;
    } catch (error) {
      console.error("API: Error streaming message:", error);
      if (error.response?.status !== 401) {
        toast.error(error.message || "Failed to stream message");
      }
      throw error;
    }
  },

  getChats: async () => {
    try {
      const response = await api.get("/api/chat/list");
      return response.data;
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.error || "Failed to load chats");
      }
      throw error;
    }
  },

  getChat: async (chatId) => {
    try {
      const response = await api.get(`/api/chat/${chatId}`);
      
      // Ensure messages are properly formatted
      if (response.data && response.data.messages) {
        response.data.messages = response.data.messages.map(msg => ({
          ...msg,
          content: msg.content || "",
          timestamp: msg.timestamp || Math.floor(Date.now() / 1000),
          role: msg.role || (msg.isUser ? "user" : "assistant")
        }));
      }
      
      return response.data;
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.error || "Failed to load chat");
      }
      throw error;
    }
  },

  deleteChat: async (chatId) => {
    try {
      const response = await api.delete(`/api/chat/${chatId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.error || "Failed to delete chat");
      }
      throw error;
    }
  },

  // OpenRouter configuration
  getModels: async () => {
    try {
      const response = await api.get("/api/chat/models");
      return response.data;
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.error || "Failed to load models");
      }
      throw error;
    }
  },

  setApiKey: async (key) => {
    try {
      const response = await api.post("/api/chat/apikey", {
        key,
      });
      return response.data;
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.error || "Failed to set API key");
      }
      throw error;
    }
  },

  getApiKeyStatus: async () => {
    try {
      const response = await api.get("/api/chat/apikey/status");
      return response.data;
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(
          error.response?.data?.error || "Failed to check API key status"
        );
      }
      throw error;
    }
  },

  // New function to fetch credit information
  getCredits: async () => {
    try {
      const response = await api.get("/api/chat/credits");
      return response.data;
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.error || "Failed to load credits");
      }
      throw error;
    }
  },
};
