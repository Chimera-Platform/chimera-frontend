"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import ImagePreviewDialog from "@/components/ui/ImagePreviewDialog";

// Modülerleştirilmiş bileşenler
import GalleryHeader from "@/components/gallery/GalleryHeader";
import ImageGrid from "@/components/gallery/ImageGrid";
import UploadDialog from "@/components/gallery/UploadDialog";
import { useGalleryImages } from "@/hooks/useGalleryImages";

// Styles
import "../dashboard/styles.css";
import "./styles.css";

export default function GalleryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const selectMode = searchParams.get("selectMode") === "true";
  const returnTo = searchParams.get("returnTo");
  
  // State
  const [previewImage, setPreviewImage] = useState(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const fileInputRef = useRef(null);

  // Custom hook for image operations
  const { 
    images, 
    isLoading, 
    isUploading,
    imageErrors,
    imageLoadStates,
    fetchGallery,
    uploadImage,
    deleteImage,
    handleRetryImage,
    handleImageLoad,
    handleImageError
  } = useGalleryImages();

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please log in to view your gallery");
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch gallery data when user is available
  useEffect(() => {
    if (user && !authLoading) {
      fetchGallery();
    }
  }, [user, authLoading, fetchGallery]);

  const handleCreateNew = () => {
    router.push("/canvas");
  };

  const handleEditImage = (image) => {
    localStorage.setItem("editImage", JSON.stringify(image));
    router.push("/canvas");
  };

  const handleSelectImage = (imageUrl) => {
    if (selectMode && returnTo) {
      try {
        localStorage.setItem("selectedImageUrl", imageUrl);
        toast.success("Image selected successfully!");
        
        // Short delay before redirect to allow toast to appear
        setTimeout(() => {
          router.push(returnTo);
        }, 300);
      } catch (error) {
        console.error("Error handling image selection:", error);
        toast.error("Failed to select image. Please try another one.");
      }
    } else if (!selectMode) {
      const image = images.find(img => (img.URL || img.url) === imageUrl);
      if (image) {
        handleEditImage(image);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Show loading toast
    const loadingToast = toast.loading("Processing image...");

    try {
      // Create an image object to get dimensions
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        // Revoke object URL to free memory
        URL.revokeObjectURL(objectUrl);

        // Create a canvas to resize and compress the image
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set canvas size to 512x512 (maintain aspect ratio)
        const maxSize = 512;
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxSize) {
            height = Math.round(height * (maxSize / width));
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round(width * (maxSize / height));
            height = maxSize;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas with new dimensions
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression
        let quality = 0.8; // Start with 80% quality
        let base64Data = canvas.toDataURL("image/jpeg", quality);

        // Reduce quality until file size is under 256KB
        while (base64Data.length > 350000 && quality > 0.1) {
          quality -= 0.1;
          base64Data = canvas.toDataURL("image/jpeg", quality);
        }

        // Store the base64 data in a ref
        fileInputRef.current.base64Data = base64Data;

        // Update toast and open dialog
        toast.success("Image processed successfully", { id: loadingToast });
        setUploadDialogOpen(true);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        toast.error("Failed to process image", { id: loadingToast });
      };

      img.src = objectUrl;
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image", { id: loadingToast });
    }
  };

  const handleUploadImage = async () => {
    if (!fileInputRef.current.base64Data) {
      toast.error("No image selected");
      return;
    }

    try {
      const base64Data = fileInputRef.current.base64Data;
      const newImage = await uploadImage(base64Data, imagePrompt);
      if (newImage) {
        toast.success("Image uploaded successfully");
        // Reset the form
        setImagePrompt("");
        setUploadDialogOpen(false);
        fileInputRef.current.value = "";
        fileInputRef.current.base64Data = null;
      }
    } catch (error) {
      toast.error(error.message || "Failed to upload image");
    }
  };

  const handlePreviewImage = (image) => {
    setPreviewImage(image);
    setPreviewDialogOpen(true);
  };

  const pageTitle = selectMode ? "Select an Image for Your Avatar" : "Your Image Gallery";

  return (
    <DashboardShell activePage="gallery" title={pageTitle}>
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Gallery Header */}
        <GalleryHeader 
          onUploadClick={handleUploadClick}
          onCreateNewClick={handleCreateNew}
          selectMode={selectMode}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
        />

        {/* Image grid */}
        <ImageGrid 
          images={images}
          isLoading={isLoading}
          imageErrors={imageErrors}
          imageLoadStates={imageLoadStates}
          selectMode={selectMode}
          onImageLoad={handleImageLoad}
          onImageError={handleImageError}
          onRetryImage={handleRetryImage}
          onEditImage={handleEditImage}
          onDeleteImage={deleteImage}
          onSelectImage={handleSelectImage}
          onPreviewImage={handlePreviewImage}
          onCreateNew={handleCreateNew}
        />
      </div>

      {/* Upload Image Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        imagePrompt={imagePrompt}
        setImagePrompt={setImagePrompt}
        onUpload={handleUploadImage}
        isUploading={isUploading}
      />

      {/* Image Preview Dialog */}
      <ImagePreviewDialog
        isOpen={previewDialogOpen} 
        onClose={setPreviewDialogOpen}
        image={previewImage}
      />
    </DashboardShell>
  );
}
