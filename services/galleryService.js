import { toast } from "sonner";

/**
 * Download/export an image from the gallery
 */
export async function exportImage(image) {
  try {
    // Create a loading toast
    const loadingToast = toast.loading("Preparing image for download...");

    // Get the image URL (handle both capitalization formats)
    const imageUrl = image.URL || image.url;
    
    // Fetch the image
    const response = await fetch(imageUrl, {
      mode: 'cors',      // Use CORS mode
      cache: 'no-cache'  // Don't use cached version
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

    // Set filename based on prompt or default (handle both capitalization formats)
    const prompt = image.Prompt || image.prompt;
    const id = image.ID || image.id;
    const filename = prompt
      ? `${prompt.substring(0, 30).replace(/[^a-z0-9]/gi, "_")}.jpg`
      : `image_${id.substring(0, 8)}.jpg`;

    a.download = filename;

    // Trigger download
    document.body.appendChild(a);
    a.click();

    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success("Image downloaded successfully", { id: loadingToast });
    return true;
  } catch (error) {
    console.error("Error exporting image:", error);
    toast.error(`Failed to download image: ${error.message}`);
    return false;
  }
}

/**
 * Process an image before uploading (resize and compress)
 */
export function processImageForUpload(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Invalid file type. Please select an image."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create a canvas to resize and compress the image
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set canvas size (max 512x512, maintain aspect ratio)
        const maxSize = 512;
        let width = img.width;
        let height = img.height;

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

        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas with new dimensions
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression
        let quality = 0.8; // Start with 80% quality
        let base64Data = canvas.toDataURL("image/jpeg", quality);

        // Reduce quality until file size is under 350KB (~256KB in base64)
        while (base64Data.length > 350000 && quality > 0.1) {
          quality -= 0.1;
          base64Data = canvas.toDataURL("image/jpeg", quality);
        }

        resolve(base64Data);
      };

      img.onerror = () => {
        reject(new Error("Failed to process image"));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image file"));
    };

    reader.readAsDataURL(file);
  });
}
