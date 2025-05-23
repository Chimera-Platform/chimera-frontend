import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useGalleryImages() {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [imageLoadStates, setImageLoadStates] = useState({});
  const { user } = useAuth();

  // Fetch all gallery images
  const fetchGallery = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check if user exists and has authentication information
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Get the token from Firebase auth
      const token = await user.getIdToken();
      
      // Use a fallback URL if the environment variable is not defined
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${apiBaseUrl}/api/images/gallery`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.images)) {
        // Initialize loading and error states for all images
        const initialLoadStates = {};
        const initialErrorStates = {};
        
        data.images.forEach(image => {
          const imageId = image.ID || image.id;
          initialLoadStates[imageId] = false;
          initialErrorStates[imageId] = false;
        });
        
        setImageLoadStates(initialLoadStates);
        setImageErrors(initialErrorStates);
        setImages(data.images);
      } else {
        console.error('Failed to load gallery:', data.error || 'Unknown error');
        toast.error("Failed to load gallery. Please try again later.");
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast.error("Failed to load gallery. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Upload an image
  const uploadImage = async (base64Data, prompt) => {
    if (!base64Data) {
      toast.error("No image data to upload");
      return null;
    }

    setIsUploading(true);
    try {
      // Get the token from Firebase auth
      const token = await user.getIdToken();
      
      // Use a fallback URL if the environment variable is not defined
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${apiBaseUrl}/api/images/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          base64Image: base64Data,  // Changed from imageBase64 to base64Image
          prompt: prompt 
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.image) {
        // Add the new image to the state
        setImages(prevImages => [data.image, ...prevImages]);
        
        // Initialize loading and error states for the new image
        const imageId = data.image.ID || data.image.id;
        setImageLoadStates(prev => ({...prev, [imageId]: true}));
        setImageErrors(prev => ({...prev, [imageId]: false}));
        
        return data.image;
      } else {
        throw new Error(data.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Delete an image
  const deleteImage = async (imageId) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return false;
    }

    setIsDeleting(true);
    try {
      // Get the token from Firebase auth
      const token = await user.getIdToken();
      
      // Use a fallback URL if the environment variable is not defined
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${apiBaseUrl}/api/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the deleted image from the state
        setImages(prevImages => prevImages.filter(img => 
          (img.ID || img.id) !== imageId
        ));
        toast.success("Image deleted successfully");
        return true;
      } else {
        throw new Error(data.error || "Failed to delete image");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error(error.message || "Failed to delete image");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  // Image loading handlers
  const handleImageLoad = useCallback((imageId) => {
    setImageLoadStates(prev => ({...prev, [imageId]: false}));
    setImageErrors(prev => ({...prev, [imageId]: false}));
  }, []);

  const handleImageError = useCallback((imageId, url) => {
    console.error(`Failed to load image ${imageId}`);
    setImageLoadStates(prev => ({...prev, [imageId]: false}));
    setImageErrors(prev => ({...prev, [imageId]: true}));
  }, []);

  const handleRetryImage = useCallback((imageId, url) => {
    // Reset loading and error states
    setImageLoadStates(prev => ({...prev, [imageId]: true}));
    setImageErrors(prev => ({...prev, [imageId]: false}));
    
    // Force image reload by updating the image URL with a cache-busting parameter
    setImages(prevImages => 
      prevImages.map(img => 
        (img.ID || img.id) === imageId 
          ? {
              ...img, 
              URL: url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`,
              url: url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`
            }
          : img
      )
    );
  }, []);

  return {
    images,
    isLoading,
    isUploading,
    isDeleting,
    imageErrors,
    imageLoadStates,
    fetchGallery,
    uploadImage,
    deleteImage,
    handleImageLoad,
    handleImageError,
    handleRetryImage
  };
}
