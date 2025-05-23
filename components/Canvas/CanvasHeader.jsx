import { Button } from "@/components/ui/button";
import { FiImage, FiKey } from "react-icons/fi";

export default function CanvasHeader({ onViewGallery, onOpenApiKeyModal }) {
  return (
    <div className="profile-section bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
            AI Image Generator
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create and edit AI-generated images
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={onOpenApiKeyModal}
            className="form-field-transition border-slate-200 dark:border-slate-700"
            variant="outline"
          >
            <FiKey className="mr-2 h-4 w-4" />
            API Settings
          </Button>
          <Button 
            onClick={onViewGallery}
            className="form-field-transition border-slate-200 dark:border-slate-700"
            variant="outline"
          >
            <FiImage className="mr-2 h-4 w-4" />
            View Gallery
          </Button>
        </div>
      </div>
    </div>
  );
}
