import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Maximize2 } from "lucide-react";
import { FiAlertCircle } from "react-icons/fi";

export default function ImageCard({
  image,
  index,
  selectMode,
  error,
  loading,
  onLoad,
  onError,
  onRetry,
  onEdit,
  onDelete,
  onSelect,
  onPreview
}) {
  const imageId = image.ID || image.id;
  const imageUrl = image.URL || image.url;
  const imagePrompt = image.Prompt || image.prompt;
  const imageType = image.Type || image.type || "Image";
  const createdAt = new Date((image.CreatedAt || image.createdAt) * 1000).toLocaleDateString();
  
  const handleCardClick = (e) => {
    if (selectMode) {
      onSelect();
    }
  };

  const handleAction = (e, action) => {
    e.stopPropagation(); // Prevent card click in selection mode
    action();
  };

  return (
    <Card 
      className={`overflow-hidden profile-section gallery-card flex flex-col profile-section:nth-child(${index + 1}) ${
        selectMode ? 'cursor-pointer hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 dark:hover:ring-offset-slate-950 transition-all' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="p-0 relative h-48 gallery-image">
        {error ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 p-4">
            <FiAlertCircle className="w-12 h-12 text-red-500 mb-2" />
            <p className="text-red-500 text-center mb-2">Failed to load image</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => handleAction(e, onRetry)}
              className="border-slate-300 dark:border-slate-600"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </div>
        ) : (
          <>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/50 z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}
            <div 
              className="relative w-full h-full"
              onClick={(e) => {
                e.stopPropagation(); // Prevent double handling
                if (selectMode) {
                  onSelect();
                } else {
                  onEdit();
                }
              }}
            >
              <img
                src={imageUrl}
                alt={imagePrompt || "Gallery image"}
                className="w-full h-full object-cover cursor-pointer transition-transform gallery-thumbnail"
                onLoad={onLoad}
                onError={onError}
                style={{ display: loading ? 'none' : 'block' }}
              />
            </div>
            <button 
              onClick={(e) => handleAction(e, onPreview)}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 p-2 rounded-full text-white transition-all fullscreen-button z-40"
              aria-label="View fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </>
        )}
        
        {/* Selection overlay indicator */}
        {selectMode && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-white dark:bg-slate-800 rounded-md px-3 py-1.5 shadow-lg">
              <span className="text-sm font-medium">Click to select</span>
            </div>
          </div>
        )}
      </CardContent>
      
      {!selectMode && (
        <CardFooter className="flex flex-col items-start p-4 bg-white dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            {createdAt}
          </p>
          <p className="font-medium mb-3 line-clamp-2 text-slate-800 dark:text-slate-200">
            {imagePrompt || "No description"}
          </p>
          <div className="flex justify-between w-full mt-1">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="form-field-transition border-slate-200 dark:border-slate-700"
                onClick={(e) => handleAction(e, onEdit)}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive form-field-transition border-slate-200 dark:border-slate-700"
                onClick={(e) => handleAction(e, onDelete)}
              >
                Delete
              </Button>
            </div>
            <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 flex items-center justify-center">
              {imageType}
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
