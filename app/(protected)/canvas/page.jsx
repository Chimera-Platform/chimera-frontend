"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/useAuth";
import { useReplicateApiKey } from "@/hooks/useReplicateApiKey";
import ImagePreviewDialog from "@/components/ui/ImagePreviewDialog";
import { ReplicateApiKeySetup } from "@/components/canvas/ReplicateApiKeySetup";
import { ReplicateApiKeyModal } from "@/components/canvas/ReplicateApiKeyModal";

// Modülerleştirilmiş bileşenler
import CanvasHeader from "@/components/canvas/CanvasHeader";
import GenerateTab from "@/components/canvas/GenerateTab";
import InpaintTab from "@/components/canvas/InpaintTab";
import { useCanvasImage } from "@/hooks/useCanvasImage";

// Styles
import "../dashboard/styles.css";
import "./styles.css";

export default function CanvasPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { hasApiKey, isLoading: apiKeyLoading, checkApiKeyStatus } = useReplicateApiKey();
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  
  const {
    prompt, 
    setPrompt,
    generatedImage, 
    setGeneratedImage,
    isSaved,
    setIsSaved,
    isGenerating,
    imageError,
    imageLoading,
    handleGenerateImage,
    handleSaveToGallery,
    handleInpaintImage,
    handleImageLoad,
    handleImageError,
    handleRetryImage,
    handleExportImage
  } = useCanvasImage();

  // Check for edit image from gallery
  useEffect(() => {
    const editImageJson = localStorage.getItem("editImage");
    if (editImageJson) {
      try {
        const editImage = JSON.parse(editImageJson);
        setGeneratedImage(editImage);
        // Images from gallery are already saved
        setIsSaved(true);
        setActiveTab("inpaint");
        // Clear the localStorage item
        localStorage.removeItem("editImage");
      } catch (error) {
        console.error("Error parsing edit image:", error);
      }
    }
  }, [setGeneratedImage, setIsSaved]);

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please log in to use this feature");
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleViewGallery = () => {
    router.push("/gallery");
  };

  const handlePreviewImage = () => {
    if (generatedImage && generatedImage.url) {
      setPreviewDialogOpen(true);
    }
  };

  const handleOpenApiKeyModal = () => {
    setApiKeyModalOpen(true);
  };

  const handleApiKeyUpdated = () => {
    checkApiKeyStatus();
  };

  // Loading state
  if (authLoading || apiKeyLoading) {
    return (
      <DashboardShell activePage="canvas" title="AI Image Canvas">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </DashboardShell>
    );
  }

  // If no API key is set, show the API key setup component
  if (!hasApiKey) {
    return (
      <DashboardShell activePage="canvas" title="AI Image Canvas">
        <ReplicateApiKeySetup onKeySet={checkApiKeyStatus} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell activePage="canvas" title="AI Image Canvas">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <CanvasHeader 
          onViewGallery={handleViewGallery} 
          onOpenApiKeyModal={handleOpenApiKeyModal}
        />

        <div className="canvas-container profile-section bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div className="tabs mb-4 canvas-tabs-list bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button 
              onClick={() => setActiveTab("generate")}
              className={`px-4 py-2 rounded-md transition-all ${activeTab === "generate" 
                ? "bg-white dark:bg-slate-700 shadow-sm" 
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              Generate
            </button>
            <button 
              onClick={() => setActiveTab("inpaint")}
              disabled={!generatedImage}
              className={`px-4 py-2 rounded-md transition-all ${
                activeTab === "inpaint" 
                ? "bg-white dark:bg-slate-700 shadow-sm" 
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              } ${!generatedImage ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Inpaint
            </button>
          </div>

          <div className="tabs-content-container">
            {activeTab === "generate" ? (
              <GenerateTab
                prompt={prompt}
                setPrompt={setPrompt}
                generatedImage={generatedImage}
                isGenerating={isGenerating}
                imageError={imageError}
                imageLoading={imageLoading}
                isSaved={isSaved}
                onGenerateImage={handleGenerateImage}
                onSaveToGallery={handleSaveToGallery}
                onExportImage={handleExportImage}
                onImageLoad={handleImageLoad}
                onImageError={handleImageError}
                onRetryImage={handleRetryImage}
                onPreviewImage={handlePreviewImage}
              />
            ) : (
              <InpaintTab
                generatedImage={generatedImage}
                isGenerating={isGenerating}
                isSaved={isSaved}
                setIsSaved={setIsSaved}
                onInpaint={handleInpaintImage}
              />
            )}
          </div>
        </div>
      </div>
      
      <ImagePreviewDialog
        isOpen={previewDialogOpen}
        onClose={setPreviewDialogOpen}
        image={generatedImage}
      />

      <ReplicateApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        onApiKeyUpdated={handleApiKeyUpdated}
      />
    </DashboardShell>
  );
}
