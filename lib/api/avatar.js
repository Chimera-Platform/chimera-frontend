import axios from "axios";
import { auth } from "@/firebase/firebase";

const API_URL = "/api";

// Create an axios instance with interceptors to add auth token
const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Error getting auth token:", error);
        // Continue without token
      }
    } else {
      console.log("No user logged in for API request");
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        console.log("Authentication error (401):", error.response.data);
      } else if (error.response.status === 500) {
        console.error("Server error (500):", error.response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request setup error:", error.message);
    }
    return Promise.reject(error);
  }
);

export const avatarApi = {
  // Get all avatars owned by the current user
  getUserAvatars: async () => {
    try {
      const response = await api.get("/avatars/user");
      return response.data.avatars || [];
    } catch (error) {
      console.error("Error fetching user avatars:", error);
      throw error;
    }
  },

  // Get all public avatars for the marketplace
  getPublicAvatars: async () => {
    try {
      const response = await api.get("/avatars/public");
      return response.data.avatars || [];
    } catch (error) {
      console.error("Error fetching public avatars:", error);
      throw error;
    }
  },

  // Get a single avatar by ID
  getAvatar: async (id) => {
    try {
      const response = await api.get(`/avatars/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching avatar ${id}:`, error);
      throw error;
    }
  },

  // Create a new avatar
  createAvatar: async (avatarData) => {
    try {
      const response = await api.post("/avatars", avatarData);
      return response.data;
    } catch (error) {
      console.error("Error creating avatar:", error);
      throw error;
    }
  },

  // Update an existing avatar
  updateAvatar: async (id, avatarData) => {
    try {
      const response = await api.put(`/avatars/${id}`, avatarData);
      return response.data;
    } catch (error) {
      console.error(`Error updating avatar ${id}:`, error);
      throw error;
    }
  },

  // Delete an avatar
  deleteAvatar: async (id) => {
    try {
      const response = await api.delete(`/avatars/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting avatar ${id}:`, error);
      throw error;
    }
  },
};
