// Image generation and manipulation service

/**
 * Get the authentication token from localStorage
 * @returns {string|null} - The authentication token or null if not found
 */
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Use a fallback URL if the environment variable is not defined
const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
};

/**
 * Generate an image based on a text prompt
 * @param {string} prompt - The text prompt for image generation
 * @returns {Promise<Object>} - The generated image data
 */
export const generateImage = async (prompt) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/api/images/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt }),
      timeout: 120000,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate image");
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

/**
 * Inpaint an image with a mask and prompt
 * @param {string} imageUrl - The URL of the original image
 * @param {string} mask - The mask data URL
 * @param {string} prompt - The text prompt for inpainting
 * @returns {Promise<Object>} - The inpainted image data
 */
export const inpaintImage = async (imageUrl, mask, prompt) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    console.log("Starting inpainting with:", {
      imageUrl: imageUrl.substring(0, 50) + "...",
      promptLength: prompt ? prompt.length : 0,
      maskLength: mask ? mask.length : 0,
    });

    if (imageUrl.length > 1000000) {
      console.warn("Image URL is very large:", imageUrl.length, "characters");
    }
    if (mask.length > 1000000) {
      console.warn("Mask is very large:", mask.length, "characters");
    }

    console.log("Sending inpaint request with:", {
      imageUrl: imageUrl.substring(0, 50) + "...",
      prompt,
    });

    // AbortController to handle fetch timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000); // 5 min timeout

    const startTime = Date.now();
    try {
      const response = await fetch("/api/images/inpaint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageUrl, mask, prompt }),
        signal: controller.signal, // Connect fetch to AbortController
      });

      clearTimeout(timeoutId); // Clear timeout if response comes before 5 min

      const requestTime = Date.now() - startTime;
      console.log(
        `Fetch request completed in ${requestTime}ms with status: ${response.status}`
      );

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Received non-JSON response:", text);
        throw new Error(
          `Server returned non-JSON response: ${text.substring(0, 100)}`
        );
      }

      console.log("Parsing JSON response...");
      const data = await response.json();

      if (!response.ok) {
        console.error("Server returned error:", data);
        throw new Error(
          data.error ||
            `Failed to inpaint image: ${response.status} ${response.statusText}`
        );
      }

      if (!data.success || !data.image || !data.image.url) {
        console.error("Invalid response format:", data);
        throw new Error("Server returned success but with invalid data format");
      }

      console.log("Inpainting successful:", data);
      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        console.error("Fetch request timed out.");
        throw new Error("Request timed out after 5 minutes");
      }
      throw error;
    }
  } catch (error) {
    console.error("Error inpainting image:", error);
    throw error;
  }
};

/**
 * Save an image to the user's gallery
 * @param {string} imageUrl - The URL of the image to save
 * @param {string} prompt - The prompt used to generate the image
 * @param {string} type - The type of image (generated, inpainted, variation)
 * @returns {Promise<Object>} - The saved image data
 */
export const saveToGallery = async (imageUrl, prompt, type) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/api/images/gallery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        imageUrl,
        prompt,
        type,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save image to gallery");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving to gallery:", error);
    throw error;
  }
};

/**
 * Fetch user's image gallery
 * @returns {Promise<Object>} - The gallery data
 */
export const getUserGallery = async () => {
  try {
    // Use direct firebase auth instead of local storage
    const token = await getFirebaseToken();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/api/images/gallery`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    // Check for non-ok response
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch gallery: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching gallery:", error);
    throw error;
  }
};

// Add a new helper to get firebase token directly
const getFirebaseToken = async () => {
  try {
    // This import should be at the top of your file
    const { auth } = await import("@/firebase/firebase");
    
    // If there's no current user, return null
    if (!auth.currentUser) {
      return null;
    }
    
    // Force refresh the token to ensure it's valid
    const token = await auth.currentUser.getIdToken(true);
    return token;
  } catch (error) {
    console.error("Error getting Firebase token:", error);
    return null;
  }
};

/**
 * Start an inpainting job
 * @param {string} imageUrl - The URL of the original image
 * @param {string} mask - The mask data URL
 * @param {string} prompt - The text prompt for inpainting
 * @returns {Promise<Object>} - The job data
 */
export const startInpaintJob = async (imageUrl, mask, prompt) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    // Log the request details for debugging
    console.log("Starting inpainting job with:", {
      imageUrl: imageUrl.substring(0, 50) + "...", // Only log the beginning of the URL
      promptLength: prompt ? prompt.length : 0,
      maskLength: mask ? mask.length : 0,
    });

    // Check if the image or mask is too large
    if (imageUrl && imageUrl.length > 1000000) {
      console.warn("Image URL is very large:", imageUrl.length, "characters");
    }

    if (mask && mask.length > 1000000) {
      console.warn("Mask is very large:", mask.length, "characters");
    }

    console.log("Sending inpaint job request with:", {
      imageUrl: imageUrl.substring(0, 50) + "...",
      prompt,
    });
    console.log("Mask length:", mask ? mask.length : 0);

    const response = await fetch("/api/images/jobs/inpaint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imageUrl, mask, prompt }),
    });

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Received non-JSON response:", text);
      throw new Error(
        `Server returned non-JSON response: ${text.substring(0, 100)}`
      );
    }

    const data = await response.json();

    if (!response.ok) {
      console.error("Server returned error:", data);
      throw new Error(
        data.error ||
          `Failed to start inpainting job: ${response.status} ${response.statusText}`
      );
    }

    console.log("Inpainting job started successfully:", data);
    return data;
  } catch (error) {
    console.error("Error starting inpainting job:", error);
    throw error;
  }
};

/**
 * Get the status of a job
 * @param {string} jobId - The ID of the job
 * @returns {Promise<Object>} - The job data
 */
export const getJobStatus = async (jobId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(`/api/images/jobs/${jobId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Received non-JSON response:", text);
      throw new Error(
        `Server returned non-JSON response: ${text.substring(0, 100)}`
      );
    }

    const data = await response.json();

    if (!response.ok) {
      console.error("Server returned error:", data);
      throw new Error(
        data.error ||
          `Failed to get job status: ${response.status} ${response.statusText}`
      );
    }

    return data;
  } catch (error) {
    console.error("Error getting job status:", error);
    throw error;
  }
};

/**
 * Poll a job until it's completed or failed
 * @param {string} jobId - The ID of the job
 * @param {Object} options - Options for polling
 * @param {number} options.interval - The interval between polls in milliseconds (default: 2000)
 * @param {number} options.timeout - The timeout in milliseconds (default: 5 minutes)
 * @param {Function} options.onProgress - A callback for progress updates
 * @returns {Promise<Object>} - The completed job data
 */
export const pollJobUntilDone = async (
  jobId,
  { interval = 2000, timeout = 5 * 60 * 1000, onProgress } = {}
) => {
  const startTime = Date.now();

  // Create a promise that will reject after the timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(
        new Error(`Job polling timed out after ${timeout / 1000} seconds`)
      );
    }, timeout);
  });

  // Create the polling promise
  const pollingPromise = new Promise(async (resolve, reject) => {
    try {
      while (true) {
        const response = await getJobStatus(jobId);

        if (!response.success || !response.job) {
          reject(new Error("Invalid job response"));
          return;
        }

        const job = response.job;

        // Call the progress callback if provided
        if (onProgress) {
          onProgress(job);
        }

        // Check if the job is completed or failed
        if (job.status === "completed") {
          resolve(job);
          return;
        } else if (job.status === "failed") {
          reject(new Error(job.error || "Job failed"));
          return;
        }

        // Wait for the next poll
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    } catch (error) {
      reject(error);
    }
  });

  // Race the polling promise against the timeout promise
  return Promise.race([pollingPromise, timeoutPromise]);
};

/**
 * Inpaint an image using the job-based API
 * @param {string} imageUrl - The URL of the original image
 * @param {string} mask - The mask data URL
 * @param {string} prompt - The text prompt for inpainting
 * @param {Function} onProgress - A callback for progress updates
 * @returns {Promise<Object>} - The inpainted image data
 */
export const inpaintImageWithJobs = async (
  imageUrl,
  mask,
  prompt,
  onProgress
) => {
  try {
    // Start the inpainting job
    const startResponse = await startInpaintJob(imageUrl, mask, prompt);

    if (!startResponse.success || !startResponse.job || !startResponse.job.id) {
      throw new Error("Invalid job response");
    }

    const jobId = startResponse.job.id;
    console.log("Inpainting job started with ID:", jobId);

    // Poll the job until it's done
    const completedJob = await pollJobUntilDone(jobId, { onProgress });

    console.log("Inpainting job completed:", completedJob);

    // Return the result in the same format as the original inpaintImage function
    return {
      success: true,
      image: completedJob.result,
    };
  } catch (error) {
    console.error("Error inpainting image with jobs:", error);
    throw error;
  }
};

/**
 * Delete an image from the gallery
 * @param {string} imageId - ID of the image to delete
 * @returns {Promise<Object>} Response with success status
 */
export const deleteImage = async (imageId) => {
  try {
    // Get the token from the current user
    const token = await getToken();
    const apiBaseUrl = getApiBaseUrl();
    
    const response = await fetch(`${apiBaseUrl}/api/images/gallery/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload an image to the gallery
 * @param {string} base64Image - Base64 encoded image data
 * @param {string} prompt - Optional description for the image
 * @returns {Promise<Object>} Response with success status and image data
 */
export const uploadImage = async (base64Image, prompt = '') => {
  try {
    // Get the token from the current user
    const token = await getToken();
    const apiBaseUrl = getApiBaseUrl();
    
    const response = await fetch(`${apiBaseUrl}/api/images/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        base64Image,
        prompt,
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Helper function to get the current user's token
 * @returns {Promise<string>} The user's authentication token
 */
const getToken = async () => {
  // Import Firebase auth dynamically to avoid SSR issues
  const { auth } = await import('@/firebase/firebase');
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  
  return await currentUser.getIdToken();
};

/**
 * Check if the user has a Replicate API key set
 * @returns {Promise<{hasKey: boolean}>} - Whether the user has an API key set
 */
export const checkReplicateApiKeyStatus = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/api/images/apikey/status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to check API key status");
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking Replicate API key status:", error);
    throw error;
  }
};

/**
 * Set the user's Replicate API key
 * @param {string} key - The API key to set
 * @returns {Promise<{message: string}>} - Success message
 */
export const setReplicateApiKey = async (key) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/api/images/apikey`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ key }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to set Replicate API key");
    }

    return await response.json();
  } catch (error) {
    console.error("Error setting Replicate API key:", error);
    throw error;
  }
};
