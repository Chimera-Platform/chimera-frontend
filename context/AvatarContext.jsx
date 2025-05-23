"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { avatarApi } from "@/lib/api/avatar";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const AvatarContext = createContext({});

export const AvatarProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [userAvatars, setUserAvatars] = useState([]);
  const [publicAvatars, setPublicAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  // Add new state for multiple avatar selection
  const [selectedAvatars, setSelectedAvatars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [avatarsLoaded, setAvatarsLoaded] = useState(false);

  // Load avatars when user is authenticated
  useEffect(() => {
    if (user && !authLoading && !loading && !avatarsLoaded) {
      console.log("User authenticated, loading avatars");
      loadUserAvatars();
      loadPublicAvatars();
      setAvatarsLoaded(true);
    } else if (!authLoading && !user) {
      console.log("User not authenticated, resetting avatar state");
      // Reset state when user is not authenticated
      setUserAvatars([]);
      setPublicAvatars([]);
      setSelectedAvatar(null);
      setAvatarsLoaded(false);
    }
  }, [user, authLoading, loading, avatarsLoaded]);

  // Reset selected avatars when selectedAvatar changes
  useEffect(() => {
    if (selectedAvatar) {
      // If a single avatar is selected, sync it with the selectedAvatars array
      setSelectedAvatars([selectedAvatar]);
    } else {
      setSelectedAvatars([]);
    }
  }, [selectedAvatar]);

  // Function to manually reload avatars when needed
  const reloadAvatars = () => {
    console.log("Manually reloading avatars");
    setAvatarsLoaded(false);
  };

  const loadUserAvatars = async () => {
    // Skip if user is not authenticated or already loading
    if (!user || loading) {
      console.log(
        "User not authenticated or already loading, skipping avatar loading"
      );
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching user avatars from API");
      const avatars = await avatarApi.getUserAvatars();
      console.log("Received user avatars:", avatars?.length || 0);
      setUserAvatars(avatars || []);

      // If we have avatars and none is selected, select the first one
      if (avatars?.length > 0 && !selectedAvatar) {
        setSelectedAvatar(avatars[0]);
      }
    } catch (error) {
      console.error("Failed to load user avatars:", error);
      // Only show toast if it's not an auth error (401)
      if (error.response?.status !== 401) {
        toast.error("Failed to load your avatars");
      }
      setUserAvatars([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPublicAvatars = async () => {
    // Skip if user is not authenticated or already loading
    if (!user || loading) {
      console.log(
        "User not authenticated or already loading, skipping public avatar loading"
      );
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching public avatars from API");
      const avatars = await avatarApi.getPublicAvatars();
      console.log("Received public avatars:", avatars?.length || 0);
      setPublicAvatars(avatars || []);
    } catch (error) {
      console.error("Failed to load public avatars:", error);
      // Only show toast if it's not an auth error (401)
      if (error.response?.status !== 401) {
        toast.error("Failed to load marketplace avatars");
      }
      setPublicAvatars([]);
    } finally {
      setLoading(false);
    }
  };

  const createAvatar = async (avatarData) => {
    setLoading(true);
    try {
      const newAvatar = await avatarApi.createAvatar(avatarData);
      setUserAvatars((prev) => [...prev, newAvatar]);
      toast.success("Avatar created successfully");
      return newAvatar;
    } catch (error) {
      console.error("Failed to create avatar:", error);
      toast.error("Failed to create avatar");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = async (id, avatarData) => {
    setLoading(true);
    try {
      const updatedAvatar = await avatarApi.updateAvatar(id, avatarData);

      // Update in userAvatars
      setUserAvatars((prev) =>
        prev.map((avatar) => (avatar.id === id ? updatedAvatar : avatar))
      );

      // Update in publicAvatars if it exists there
      setPublicAvatars((prev) =>
        prev.map((avatar) => (avatar.id === id ? updatedAvatar : avatar))
      );

      // Update selectedAvatar if it's the one being updated
      if (selectedAvatar?.id === id) {
        setSelectedAvatar(updatedAvatar);
      }

      toast.success("Avatar updated successfully");
      return updatedAvatar;
    } catch (error) {
      console.error(`Failed to update avatar ${id}:`, error);
      toast.error("Failed to update avatar");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAvatar = async (id) => {
    setLoading(true);
    try {
      await avatarApi.deleteAvatar(id);

      // Remove from userAvatars
      setUserAvatars((prev) => prev.filter((avatar) => avatar.id !== id));

      // Remove from publicAvatars if it exists there
      setPublicAvatars((prev) => prev.filter((avatar) => avatar.id !== id));

      // Clear selectedAvatar if it's the one being deleted
      if (selectedAvatar?.id === id) {
        setSelectedAvatar(null);
      }

      toast.success("Avatar deleted successfully");
    } catch (error) {
      console.error(`Failed to delete avatar ${id}:`, error);
      toast.error("Failed to delete avatar");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const selectAvatar = (avatar) => {
    setSelectedAvatar(avatar);
    // Also set in the array for consistency
    setSelectedAvatars(avatar ? [avatar] : []);
  };

  // New function to toggle avatar selection for multi-avatar mode
  const toggleAvatarSelection = (avatar) => {
    if (!avatar) return;
    
    setSelectedAvatars(prev => {
      // Check if the avatar is already selected
      const isSelected = prev.some(a => a.id === avatar.id);
      
      if (isSelected) {
        // Remove the avatar from selection
        const newSelection = prev.filter(a => a.id !== avatar.id);
        
        // If we're removing the current single selection, update selectedAvatar too
        if (selectedAvatar && selectedAvatar.id === avatar.id) {
          setSelectedAvatar(newSelection.length > 0 ? newSelection[0] : null);
        }
        
        return newSelection;
      } else {
        // Add the avatar to selection
        const newSelection = [...prev, avatar];
        
        // If this is the first avatar being selected, update selectedAvatar too
        if (!selectedAvatar) {
          setSelectedAvatar(avatar);
        }
        
        return newSelection;
      }
    });
  };

  // Clear all selected avatars
  const clearSelectedAvatars = () => {
    setSelectedAvatars([]);
    setSelectedAvatar(null);
  };

  // Check if an avatar is in the selection
  const isAvatarSelected = (avatarId) => {
    return selectedAvatars.some(avatar => avatar.id === avatarId);
  };

  const getAllAvatars = () => {
    // Combine user and public avatars, removing duplicates
    const allAvatars = [...userAvatars];

    publicAvatars.forEach((publicAvatar) => {
      if (!allAvatars.some((avatar) => avatar.id === publicAvatar.id)) {
        allAvatars.push(publicAvatar);
      }
    });

    return allAvatars;
  };

  const hasAvatars = () => {
    return (
      (userAvatars && userAvatars.length > 0) ||
      (publicAvatars && publicAvatars.length > 0)
    );
  };

  return (
    <AvatarContext.Provider
      value={{
        userAvatars,
        publicAvatars,
        selectedAvatar,
        selectedAvatars,           // New: expose the selected avatars array
        toggleAvatarSelection,     // New: function to toggle avatar selection
        isAvatarSelected,          // New: function to check if avatar is selected
        clearSelectedAvatars,      // New: function to clear all selections
        loading,
        createAvatar,
        updateAvatar,
        deleteAvatar,
        selectAvatar,
        loadUserAvatars,
        loadPublicAvatars,
        getAllAvatars,
        hasAvatars,
        reloadAvatars,
        avatarsLoaded,
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => useContext(AvatarContext);
