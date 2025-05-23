"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { saveToGallery } from "@/services/imageService";
import { toast } from "sonner";
import GallerySelector from "@/components/gallery/GallerySelector";
import { Download } from "lucide-react";

export default function ImageCanvas({
  initialImage,
  onInpaint,
  isProcessing,
  isSaved,
  setIsSaved,
}) {
  const canvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [maskCtx, setMaskCtx] = useState(null);
  const [image, setImage] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [inpaintPrompt, setInpaintPrompt] = useState("");
  const [inpaintedImage, setInpaintedImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [localIsSaved, setLocalIsSaved] = useState(false);
  const [isProcessingLocal, setIsProcessingLocal] = useState(false);
  const [savedState, setSavedState] = useState(null);
  const [galleryDialogOpen, setGalleryDialogOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Sync with parent component's saved state
  useEffect(() => {
    if (isSaved !== undefined) {
      setLocalIsSaved(isSaved);
    }
  }, [isSaved]);

  // Initialize canvas and load image
  useEffect(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;

    if (canvas && maskCanvas) {
      const context = canvas.getContext("2d");
      const maskContext = maskCanvas.getContext("2d");

      setCtx(context);
      setMaskCtx(maskContext);

      // Load the initial image
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = initialImage;

      img.onload = () => {
        // Set canvas dimensions to match image
        canvas.width = 512;
        canvas.height = 512;
        maskCanvas.width = 512;
        maskCanvas.height = 512;

        // Draw image on main canvas
        context.drawImage(img, 0, 0, 512, 512);

        // Clear mask canvas (transparent)
        maskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

        setImage(img);
      };
    }
  }, [initialImage]);

  // Drawing functions for mask
  const startDrawing = (e) => {
    if (!maskCtx) return;

    setIsDrawing(true);
    const { offsetX, offsetY } = getCoordinates(e);
    maskCtx.beginPath();
    maskCtx.arc(offsetX, offsetY, brushSize / 2, 0, Math.PI * 2);
    maskCtx.fillStyle = "white";
    maskCtx.fill();
  };

  const draw = (e) => {
    if (!isDrawing || !maskCtx) return;

    const { offsetX, offsetY } = getCoordinates(e);
    maskCtx.beginPath();
    maskCtx.arc(offsetX, offsetY, brushSize / 2, 0, Math.PI * 2);
    maskCtx.fillStyle = "white";
    maskCtx.fill();
  };

  const stopDrawing = () => {
    if (!maskCtx) return;

    setIsDrawing(false);
    maskCtx.closePath();
  };

  // Helper to get coordinates for both mouse and touch events
  const getCoordinates = (e) => {
    let offsetX, offsetY;
    const canvas = maskCanvasRef.current;

    if (e.type.includes("touch")) {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0] || e.changedTouches[0];
      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;
    } else {
      offsetX = e.nativeEvent.offsetX;
      offsetY = e.nativeEvent.offsetY;
    }

    return { offsetX, offsetY };
  };

  const clearMask = () => {
    if (!maskCtx) return;
    maskCtx.clearRect(
      0,
      0,
      maskCanvasRef.current.width,
      maskCanvasRef.current.height
    );
  };

  // Add a function to use the inpainted result as the new canvas image
  const useInpaintedResult = () => {
    if (!inpaintedImage || !inpaintedImage.url) {
      toast.error("No inpainted image to use");
      return;
    }

    // Load the inpainted image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = inpaintedImage.url;

    img.onload = () => {
      // Draw the inpainted image on the main canvas
      const context = canvasRef.current.getContext("2d");
      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      context.drawImage(
        img,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      // Clear the mask canvas
      clearMask();

      // Clear the inpainted image display
      setInpaintedImage(null);

      // Update the image state
      setImage(img);

      toast.success("Inpainted result is now your canvas image");
    };
  };

  // Update the handleInpaint function to clear the mask after successful inpainting
  const handleInpaint = async () => {
    // Save the current state before inpainting
    setSavedState({
      image: canvasRef.current.toDataURL(),
      mask: maskCanvasRef.current.toDataURL(),
    });

    // Get the mask data
    const maskCtx = maskCanvasRef.current.getContext("2d");
    const maskData = maskCtx.getImageData(
      0,
      0,
      maskCanvasRef.current.width,
      maskCanvasRef.current.height
    ).data;

    // Check if there's a mask drawn
    const hasMask = Array.from(maskData).some((pixel) => pixel > 0);

    if (!hasMask) {
      toast.error("Please draw a mask on the image first");
      return;
    }

    // Convert mask canvas to data URL
    const maskDataUrl = maskCanvasRef.current.toDataURL("image/png");

    // Convert main canvas to data URL
    const imageDataUrl = canvasRef.current.toDataURL("image/png");

    // Show a loading toast that will stay until the process completes
    const loadingToast = toast.loading(
      "Starting inpainting process... This may take up to 2-3 minutes."
    );

    // Set processing state
    setIsProcessingLocal(true);

    // Define a progress handler for the job
    const handleJobProgress = (job) => {
      const status = job.status;
      const elapsedTime = Math.floor(
        (Date.now() - job.createdAt * 1000) / 1000
      );

      if (status === "pending") {
        toast.loading("Job is pending... Please wait.", { id: loadingToast });
      } else if (status === "processing") {
        if (elapsedTime < 30) {
          toast.loading("Processing your image...", { id: loadingToast });
        } else if (elapsedTime < 60) {
          toast.loading(
            "Still working on your image... (30+ seconds elapsed)",
            { id: loadingToast }
          );
        } else if (elapsedTime < 120) {
          toast.loading(
            "Continuing to process your image... (1+ minute elapsed)",
            { id: loadingToast }
          );
        } else {
          toast.loading(
            `Almost there! This is a complex edit... (${Math.floor(
              elapsedTime / 60
            )}+ minutes elapsed)`,
            { id: loadingToast }
          );
        }
      }
    };

    // Call the onInpaint callback with the image, mask, and prompt
    try {
      console.log("Starting inpainting with prompt:", inpaintPrompt);

      // Use the job-based inpainting API
      const result = await onInpaint(
        imageDataUrl,
        maskDataUrl,
        inpaintPrompt,
        handleJobProgress
      );

      if (result && result.success && result.image) {
        setInpaintedImage(result.image);

        // Clear the mask after successful inpainting
        clearMask();

        toast.success("Inpainting completed successfully!", {
          id: loadingToast,
        });
      } else {
        toast.error("Failed to inpaint image: No valid result returned", {
          id: loadingToast,
        });
        console.error("Invalid inpaint result:", result);
      }
    } catch (error) {
      console.error("Error during inpainting:", error);

      // Provide more specific error messages based on the error
      if (error.message && error.message.includes("timed out")) {
        toast.error(
          "Inpainting timed out. The process may be taking too long due to server load or complexity of the edit.",
          {
            id: loadingToast,
            duration: 5000,
          }
        );
      } else if (error.message && error.message.includes("Network")) {
        toast.error(
          "Network error during inpainting. Please check your internet connection and try again.",
          {
            id: loadingToast,
            duration: 5000,
          }
        );
      } else {
        toast.error(`Inpainting failed: ${error.message || "Unknown error"}`, {
          id: loadingToast,
          duration: 5000,
        });
      }
    } finally {
      // Always reset the processing state
      setIsProcessingLocal(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!inpaintedImage) {
      toast.error("No inpainted image to save");
      return;
    }

    if (localIsSaved) {
      toast.info("This image is already saved to your gallery");
      return;
    }

    setIsSaving(true);
    try {
      const data = await saveToGallery(
        inpaintedImage.url,
        inpaintedImage.prompt,
        "inpainted"
      );

      if (!data.success) {
        throw new Error(data.error || "Failed to save image to gallery");
      }

      setLocalIsSaved(true);
      if (setIsSaved) setIsSaved(true);
      toast.success("Inpainted image saved to gallery!");
    } catch (error) {
      console.error("Error saving to gallery:", error);
      toast.error(error.message || "Failed to save image to gallery");
    } finally {
      setIsSaving(false);
    }
  };

  // Add a function to restore the previous state
  const handleRestorePrevious = () => {
    if (!savedState) {
      toast.error("No previous state to restore");
      return;
    }

    // Load the saved image
    const img = new Image();
    img.onload = () => {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(
        img,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    };
    img.src = savedState.image;

    // Load the saved mask
    const maskImg = new Image();
    maskImg.onload = () => {
      const maskCtx = maskCanvasRef.current.getContext("2d");
      maskCtx.clearRect(
        0,
        0,
        maskCanvasRef.current.width,
        maskCanvasRef.current.height
      );
      maskCtx.drawImage(
        maskImg,
        0,
        0,
        maskCanvasRef.current.width,
        maskCanvasRef.current.height
      );
    };
    maskImg.src = savedState.mask;

    // Clear the inpainted image
    setInpaintedImage(null);
    toast.success("Restored previous state");
  };

  // Add a function to load an image from the gallery
  const loadImageFromGallery = (galleryImage) => {
    if (!galleryImage || !galleryImage.url) {
      toast.error("Invalid gallery image");
      return;
    }

    // Load the gallery image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = galleryImage.url;

    img.onload = () => {
      // Draw the gallery image on the main canvas
      const context = canvasRef.current.getContext("2d");
      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      context.drawImage(
        img,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      // Clear the mask canvas
      clearMask();

      // Clear the inpainted image display
      setInpaintedImage(null);

      // Update the image state
      setImage(img);

      // Set the inpaint prompt to the original prompt as a starting point
      if (galleryImage.prompt) {
        setInpaintPrompt(galleryImage.prompt);
      }

      toast.success("Gallery image loaded for inpainting");
    };
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = event.target.result;
        img.onload = () => {
          const context = canvasRef.current.getContext("2d");
          context.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
          context.drawImage(img, 0, 0, 512, 512);
          setImage(img);
          toast.success("Image uploaded successfully");
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearCanvas = () => {
    if (!canvasRef.current || !maskCanvasRef.current) {
      toast.error("Canvas not available");
      return;
    }

    // Get contexts
    const context = canvasRef.current.getContext("2d");
    const maskContext = maskCanvasRef.current.getContext("2d");
    
    // Clear both canvases
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    maskContext.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
    
    // Reset state
    setInpaintedImage(null);
    
    // Make sure we have a blank canvas
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    toast.success("Canvas cleared");
  };

  const handleSaveState = () => {
    if (!canvasRef.current || !maskCanvasRef.current) {
      toast.error("Canvas not available");
      return;
    }
    
    const state = {
      image: canvasRef.current.toDataURL(),
      mask: maskCanvasRef.current.toDataURL(),
    };
    
    setSavedState(state);
    
    // Save the state to local storage
    localStorage.setItem("savedCanvasState", JSON.stringify(state));
    toast.success("State saved");
  };

  const handleRestoreState = () => {
    const savedStateStr = localStorage.getItem("savedCanvasState");
    if (savedStateStr) {
      try {
        const state = JSON.parse(savedStateStr);
        
        // Load the saved image
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = state.image;
        
        img.onload = () => {
          const context = canvasRef.current.getContext("2d");
          context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          context.drawImage(img, 0, 0, 512, 512);
          setImage(img);
          
          // Load the saved mask if it exists
          if (state.mask) {
            const maskImg = new Image();
            maskImg.crossOrigin = "anonymous";
            maskImg.src = state.mask;
            
            maskImg.onload = () => {
              const maskCtx = maskCanvasRef.current.getContext("2d");
              maskCtx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
              maskCtx.drawImage(maskImg, 0, 0, 512, 512);
            };
          }
          
          setSavedState(state);
          toast.success("State restored");
        };
      } catch (error) {
        console.error("Error restoring state:", error);
        toast.error("Failed to restore saved state");
      }
    } else {
      toast.error("No saved state to restore");
    }
  };

  const handleExportImage = async (imageUrl, prompt) => {
    try {
      // Create a loading toast
      const loadingToast = toast.loading("Preparing image for download...");

      // Fetch the image
      const response = await fetch(imageUrl, {
        mode: 'cors',      // Use CORS mode
        cache: 'no-cache'  // Don't use cached version
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch image");
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
        : `inpainted_image_${Date.now()}.jpg`;

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
      toast.error("Failed to download image");
    }
  };

  // GallerySelector bölümünün düzgün çalışması için gerekli değişiklikler
  const openGallerySelector = async () => {
    try {
      // Önce kullanıcının oturum açtığından emin olalım
      const { auth } = await import("@/firebase/firebase");
      if (!auth.currentUser) {
        toast.error("Please sign in to view your gallery");
        return;
      }
      
      // Token'ı yenileyelim
      await auth.currentUser.getIdToken(true);
      
      // Dialog'u açalım
      setGalleryDialogOpen(true);
    } catch (error) {
      console.error("Error opening gallery:", error);
      toast.error("Could not open gallery. Please try signing in again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex gap-2 w-full">
          <Button
            onClick={handleUploadClick}
            className="w-full"
            variant="outline"
          >
            Upload Image
          </Button>
          <Button
            onClick={openGallerySelector}
            className="w-full"
            variant="outline"
          >
            Select from Gallery
          </Button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
          accept="image/*"
        />
        <div className="flex gap-2">
          <Button
            onClick={handleClearCanvas}
            className="w-full"
            variant="outline"
            type="button"
          >
            Clear Canvas
          </Button>
          <Button
            onClick={handleSaveState}
            className="w-full"
            variant="outline"
          >
            Save State
          </Button>
          <Button
            onClick={handleRestoreState}
            className="w-full"
            variant="outline"
          >
            Restore State
          </Button>
        </div>
        <input
          type="text"
          placeholder="Describe what to add or change in the masked area..."
          value={inpaintPrompt}
          onChange={(e) => setInpaintPrompt(e.target.value)}
          className="flex-1 p-2 border rounded"
          disabled={isProcessing || isProcessingLocal}
        />
        <button
          onClick={handleInpaint}
          disabled={isProcessing || isProcessingLocal || !inpaintPrompt.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {isProcessing || isProcessingLocal ? "Processing..." : "Inpaint"}
        </button>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">Brush Size:</span>
        <input
          type="range"
          min="5"
          max="50"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="w-48"
        />
        <span className="text-sm">{brushSize}px</span>
        <button
          onClick={clearMask}
          disabled={isProcessing || isProcessingLocal}
          className="ml-auto px-3 py-1 bg-red-500 text-white rounded disabled:bg-gray-300"
        >
          Clear Mask
        </button>
        {savedState && (
          <button
            onClick={handleRestorePrevious}
            disabled={isProcessing || isProcessingLocal}
            className="px-3 py-1 bg-gray-500 text-white rounded disabled:bg-gray-300"
          >
            Restore Previous
          </button>
        )}
      </div>

      <div className="relative border rounded-lg flex justify-center items-center h-[512px] w-full">
        <div className="relative w-[512px] h-[512px]">
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 z-0"
            width={512}
            height={512}
          />
          <canvas
            ref={maskCanvasRef}
            className="absolute top-0 left-0 z-10"
            width={512}
            height={512}
            style={{ opacity: 0.5 }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-2">
        Draw on the image to create a mask where you want changes to be applied.
      </p>

      {inpaintedImage && (
        <div className="mt-6 border rounded-lg p-4 flex flex-col items-center">
          <h3 className="text-lg font-medium mb-2">Inpainted Result</h3>
          <div className="flex justify-center w-full">
            <img
              src={inpaintedImage.url}
              alt={inpaintedImage.prompt}
              className="max-w-full max-h-[512px] object-contain mb-4"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={useInpaintedResult}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Use as Canvas Image
            </button>
            <button
              onClick={handleSaveToGallery}
              disabled={isSaving || localIsSaved}
              className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
            >
              {isSaving
                ? "Saving..."
                : localIsSaved
                ? "Saved to Gallery"
                : "Save to Gallery"}
            </button>
            <button
              onClick={() =>
                handleExportImage(inpaintedImage.url, inpaintedImage.prompt)
              }
              className="px-4 py-2 bg-purple-500 text-white rounded flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      )}

      <GallerySelector
        open={galleryDialogOpen}
        onOpenChange={setGalleryDialogOpen}
        onSelectImage={loadImageFromGallery}
      />
    </div>
  );
}
