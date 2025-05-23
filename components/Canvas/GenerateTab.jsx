import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, RefreshCw, Maximize2 } from "lucide-react";
import { FiImage, FiAlertCircle } from "react-icons/fi";

export default function GenerateTab({
  prompt,
  setPrompt,
  generatedImage,
  isGenerating,
  imageError,
  imageLoading,
  isSaved,
  onGenerateImage,
  onSaveToGallery,
  onExportImage,
  onImageLoad,
  onImageError,
  onRetryImage,
  onPreviewImage
}) {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex gap-2">
        <Input
          placeholder="Enter a prompt for your image..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 form-field-transition border-slate-200 dark:border-slate-700"
        />
        <Button
          onClick={onGenerateImage}
          disabled={isGenerating || !prompt.trim()}
          className="canvas-button bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
        >
          {isGenerating ? "Generating..." : "Generate"}
        </Button>
      </div>

      <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex-1 canvas-output">
        {generatedImage ? (
          imageError ? (
            <ErrorDisplay onRetry={onRetryImage} />
          ) : (
            <ImageDisplay
              image={generatedImage}
              loading={imageLoading}
              isSaved={isSaved}
              onLoad={onImageLoad}
              onError={onImageError}
              onSave={onSaveToGallery}
              onExport={() => onExportImage(generatedImage)}
              onPreview={onPreviewImage}
            />
          )
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function ErrorDisplay({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-3">
      <FiAlertCircle className="w-12 h-12 text-red-500" />
      <p className="text-red-500">Failed to load image</p>
      <Button 
        onClick={onRetry}
        variant="outline" 
        size="sm"
        className="mt-2"
      >
        <RefreshCw className="mr-2 h-4 w-4" /> Retry
      </Button>
    </div>
  );
}

function ImageDisplay({
  image,
  loading,
  isSaved,
  onLoad,
  onError,
  onSave,
  onExport,
  onPreview
}) {
  return (
    <div className="canvas-image-container">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/50 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      <div className="relative">
        <img
          src={image.url}
          alt={image.prompt}
          className="canvas-image reduced-size"
          onLoad={onLoad}
          onError={onError}
          style={{ display: loading ? 'none' : 'block' }}
        />
        <button 
          onClick={onPreview}
          className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 p-1.5 rounded-full text-white transition-all z-20"
          aria-label="View fullscreen"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      <div className="flex gap-2 mt-4">
        <Button
          onClick={onSave}
          disabled={isSaved}
          className="canvas-button bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
        >
          {isSaved ? "Saved to Gallery" : "Save to Gallery"}
        </Button>
        <Button
          onClick={onExport}
          variant="outline"
          className="form-field-transition border-slate-200 dark:border-slate-700"
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-slate-400 dark:text-slate-500 flex flex-col items-center gap-3">
      <FiImage className="w-12 h-12" />
      <p>Generated image will appear here</p>
    </div>
  );
}
