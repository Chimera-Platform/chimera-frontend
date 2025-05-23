import { Button } from "@/components/ui/button";
import ImageCard from "./ImageCard";

export default function ImageGrid({
  images,
  isLoading,
  imageErrors,
  imageLoadStates,
  selectMode,
  onImageLoad,
  onImageError,
  onRetryImage,
  onEditImage,
  onDeleteImage,
  onSelectImage,
  onPreviewImage,
  onCreateNew
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 profile-section">
        <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-200">
          No images yet
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Start creating amazing AI-generated images with our canvas
          tool or upload your own images.
        </p>
        <div className="flex gap-2 justify-center">
          <Button 
            onClick={onCreateNew}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 avatar-upload-button"
          >
            Create Your First Image
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image, index) => (
        <ImageCard
          key={image.ID || image.id}
          image={image}
          index={index}
          selectMode={selectMode}
          error={imageErrors[image.ID || image.id]}
          loading={imageLoadStates[image.ID || image.id]}
          onLoad={() => onImageLoad(image.ID || image.id)}
          onError={() => onImageError(image.ID || image.id, image.URL || image.url)}
          onRetry={() => onRetryImage(image.ID || image.id, image.URL || image.url)}
          onEdit={() => onEditImage(image)}
          onDelete={() => onDeleteImage(image.ID || image.id)}
          onSelect={() => onSelectImage(image.URL || image.url)}
          onPreview={() => onPreviewImage(image)}
        />
      ))}
    </div>
  );
}
