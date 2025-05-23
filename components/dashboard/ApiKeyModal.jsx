"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/context/ChatContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

export function ApiKeyModal({ isOpen, onClose, onApiKeyUpdated }) {
  const { setApiKey } = useChat();
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset input when modal is opened
  useEffect(() => {
    if (isOpen) {
      setApiKeyInput("");
    }
  }, [isOpen]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Handle API key submission
  const handleApiKeySubmit = async (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    setIsSubmitting(true);
    try {
      await setApiKey(apiKeyInput.trim());
      setApiKeyInput("");
      onClose();
      toast.success("API key updated successfully");
      
      // Call the callback function to notify parent components
      if (onApiKeyUpdated) {
        onApiKeyUpdated();
      }
    } catch (error) {
      console.error("Error setting API key:", error);
      toast.error(error.response?.data?.error || "Failed to update API key");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle clicking outside the modal
  const handleBackdropClick = (e) => {
    // Only close if the actual backdrop was clicked, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur effect - added onClick handler */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose} // Close modal when backdrop is clicked
          />

          {/* Modal - using flex for perfect centering */}
          <div 
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
            onClick={handleBackdropClick} // Handle clicks on the container
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-xl mx-auto"
              // No onClick handler here to prevent event propagation issues
            >
              <div
                className="api-key-modal bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full p-7 border border-slate-200 dark:border-slate-700"
                onClick={(e) => e.stopPropagation()} // Prevent clicks from reaching the backdrop
              >
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl font-medium text-slate-900 dark:text-slate-100">
                    OpenRouter API Settings
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <FiX className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  </Button>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
                  Enter your OpenRouter API key to access AI models. You can get a key from{" "}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    openrouter.ai
                  </a>
                </p>

                <form onSubmit={handleApiKeySubmit} className="space-y-5">
                  <div>
                    <Input
                      type="password"
                      placeholder="Enter your API key"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full border-slate-300 dark:border-slate-700 focus:border-indigo-300 dark:focus:border-indigo-600 text-base p-4 h-12"
                      autoFocus
                    />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Your API key is stored securely and never shared.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={onClose}
                      className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 h-11 px-5"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !apiKeyInput.trim()}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 h-11 px-5"
                    >
                      {isSubmitting ? "Updating..." : "Update API Key"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
