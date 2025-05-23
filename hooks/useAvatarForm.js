import { useState, useEffect, useCallback } from "react";
import { useAvatar } from "@/context/AvatarContext";
import { toast } from "sonner";
import { avatarApi } from "@/lib/api/avatar";

export function useAvatarForm(editId, router) {
  const { createAvatar, updateAvatar, reloadAvatars } = useAvatar();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => {
    // Try to load saved form data from localStorage
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("avatarFormData");
      if (savedData) {
        try {
          return JSON.parse(savedData);
        } catch (e) {
          console.error("Error parsing saved form data:", e);
        }
      }
    }

    // Default form data
    return {
      name: "",
      description: "",
      story: "",
      persona: "",
      profileImageUrl: "",
      isPublic: false,
      creatorNickname: "",
    };
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("avatarFormData", JSON.stringify(formData));
    }
  }, [formData]);

  // Load avatar data for editing
  const loadAvatarForEditing = useCallback(async (id) => {
    setIsEditing(true);
    setIsLoading(true);
    
    try {
      const avatar = await avatarApi.getAvatar(id);
      setFormData({
        name: avatar.name,
        description: avatar.description,
        story: avatar.story,
        persona: avatar.persona,
        profileImageUrl: avatar.profileImageUrl,
        isPublic: avatar.isPublic,
        creatorNickname: avatar.creatorNickname,
      });
    } catch (error) {
      console.error("Failed to load avatar for editing:", error);
      toast.error("Failed to load avatar data");
      router.push("/create-avatar");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSwitchChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      isPublic: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (!formData.story.trim()) {
      toast.error("Story is required");
      return;
    }

    if (!formData.persona.trim()) {
      toast.error("Persona is required");
      return;
    }

    if (!formData.profileImageUrl) {
      toast.error("Profile image is required");
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing) {
        await updateAvatar(editId, formData);
        toast.success("Avatar updated successfully");
      } else {
        await createAvatar(formData);
        toast.success("Avatar created successfully");
      }

      // Clear saved form data on successful submission
      localStorage.removeItem("avatarFormData");

      // Trigger a reload of avatars
      reloadAvatars();

      // Redirect to characters page
      router.push("/characters");
    } catch (error) {
      console.error("Failed to save avatar:", error);
      toast.error(
        isEditing ? "Failed to update avatar" : "Failed to create avatar"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFromGallery = () => {
    // Save current form data before navigating
    localStorage.setItem("avatarFormData", JSON.stringify(formData));

    // Navigate to gallery with callback
    router.push(
      `/gallery?selectMode=true&returnTo=/create-avatar${
        isEditing ? `?edit=${editId}` : ""
      }`
    );
  };

  const handleImageSelected = useCallback((searchParams) => {
    // First check localStorage for direct Firebase Storage URLs
    if (typeof window !== "undefined") {
      const storedImageUrl = localStorage.getItem("selectedImageUrl");
      if (storedImageUrl) {
        console.log("Found image URL in localStorage:", storedImageUrl);

        // Update the form data with the selected image URL
        setFormData((prev) => ({
          ...prev,
          profileImageUrl: storedImageUrl,
        }));

        // Clear the stored image URL
        localStorage.removeItem("selectedImageUrl");

        toast.success("Image selected successfully");
        return;
      }
    }

    // Then check URL params for other image URLs
    const selectedImage = searchParams.get("selectedImage");
    if (selectedImage) {
      try {
        // Decode the URL to handle special characters
        const decodedUrl = decodeURIComponent(selectedImage);
        console.log("Received image URL from params:", decodedUrl);

        // Validate the URL
        try {
          new URL(decodedUrl);
        } catch (urlError) {
          console.error("Invalid URL format:", urlError);
          toast.error("Invalid image URL format");
          return;
        }

        // Update the form data with the selected image URL
        setFormData((prev) => ({
          ...prev,
          profileImageUrl: decodedUrl,
        }));

        // Clear the URL parameter without navigating
        const newUrl =
          window.location.pathname + (isEditing ? `?edit=${editId}` : "");
        window.history.replaceState({}, "", newUrl);

        toast.success("Image selected successfully");
      } catch (error) {
        console.error("Error processing selected image:", error);
        toast.error("Failed to process the selected image");
      }
    }
  }, [isEditing, editId]);

  return {
    isLoading,
    isEditing,
    formData,
    setFormData,
    loadAvatarForEditing,
    handleChange,
    handleSwitchChange,
    handleSubmit,
    handleSelectFromGallery,
    handleImageSelected
  };
}
