import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  generateImage,
  inpaintImageWithJobs,
  saveToGallery,
} from "@/services/imageService";

export function useCanvasImage() {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const router = useRouter();

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setImageError(false);
    setImageLoading(true);
    // Reset saved state when generating a new image
    setIsSaved(false);

    try {
      const data = await generateImage(prompt);

      if (!data.success) {
        throw new Error(data.error || "Failed to generate image");
      }

      setGeneratedImage(data.image);
      toast.success("Image generated successfully!");
    } catch (error) {
      console.error("Error generating image:", error);

      // Handle authentication errors
      if (error.message === "Authentication token not found") {
        toast.error("Your session has expired. Please log in again.");
        router.push("/login");
        return;
      }

      toast.error(error.message || "Failed to generate image");
      setImageError(true);
    } finally {
      setIsGenerating(false);
      setImageLoading(false);
    }
  };

  const handleInpaintImage = async (
    imageUrl,
    mask,
    inpaintPrompt,
    onProgress
  ) => {
    if (!imageUrl || !mask || !inpaintPrompt) {
      toast.error("Missing required information for inpainting");
      return null;
    }

    setIsGenerating(true);
    setImageError(false);
    // Reset saved state when inpainting
    setIsSaved(false);

    try {
      console.log("Starting inpainting with:", {
        imageUrl: imageUrl.substring(0, 50) + "...",
        promptLength: inpaintPrompt.length,
        maskLength: mask.length,
      });

      // Use the job-based inpainting API
      const data = await inpaintImageWithJobs(
        imageUrl,
        mask,
        inpaintPrompt,
        onProgress
      );

      if (!data.success) {
        throw new Error(data.error || "Failed to inpaint image");
      }

      // Return the result to the ImageCanvas component
      return data;
    } catch (error) {
      console.error("Error inpainting image:", error);

      // Handle authentication errors
      if (error.message === "Authentication token not found") {
        toast.error("Your session has expired. Please log in again.");
        router.push("/login");
        return null;
      }

      toast.error(error.message || "Failed to inpaint image");
      setImageError(true);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!generatedImage) {
      toast.error("No image to save");
      return;
    }

    if (isSaved) {
      toast.info("This image is already saved to your gallery");
      return;
    }

    setIsSaving(true);
    try {
      const data = await saveToGallery(
        generatedImage.url,
        generatedImage.prompt,
        generatedImage.type
      );

      if (!data.success) {
        throw new Error(data.error || "Failed to save image to gallery");
      }

      setIsSaved(true);
      toast.success("Image saved to gallery!");
    } catch (error) {
      console.error("Error saving to gallery:", error);

      // Handle authentication errors
      if (error.message === "Authentication token not found") {
        toast.error("Your session has expired. Please log in again.");
        router.push("/login");
        return;
      }

      toast.error(error.message || "Failed to save image to gallery");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
    console.error("Failed to load image:", generatedImage?.url);
  }, [generatedImage]);

  const handleRetryImage = useCallback(() => {
    if (generatedImage && generatedImage.url) {
      setImageLoading(true);
      setImageError(false);
      // Force reload the image by appending a cache-busting query parameter
      const timestamp = new Date().getTime();
      setGeneratedImage({
        ...generatedImage,
        url: generatedImage.url.includes('?') 
          ? `${generatedImage.url}&t=${timestamp}`
          : `${generatedImage.url}?t=${timestamp}`
      });
    }
  }, [generatedImage]);

  const handleExportImage = async (image) => {
    try {
      // Create a loading toast
      const loadingToast = toast.loading("Preparing image for download...");

      // Get image properties, handling both naming conventions
      const imageUrl = image.URL || image.url;
      const prompt = image.Prompt || image.prompt;

      // Fetch the image
      const response = await fetch(imageUrl, {
        mode: 'cors',        // Use CORS mode
        cache: 'no-cache'    // Don't use cached version
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      // Get the blob
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;

      // Set filename based on prompt or default
      const filename = prompt
        ? `${prompt.substring(0, 30).replace(/[^a-z0-9]/gi, "_")}.jpg`
        : `generated_image_${Date.now()}.jpg`;

      a.download = filename;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Image downloaded successfully", { id: loadingToast });
    } catch (error) {
      console.error("Error exporting image:", error);
      toast.error(`Failed to download image: ${error.message}`);
    }
  };

  return {
    prompt,
    setPrompt,
    generatedImage,
    setGeneratedImage,
    isSaved,
    setIsSaved,
    isGenerating,
    isSaving,
    imageError,
    imageLoading,
    handleGenerateImage,
    handleInpaintImage,
    handleSaveToGallery,
    handleImageLoad,
    handleImageError,
    handleRetryImage,
    handleExportImage
  };
}
