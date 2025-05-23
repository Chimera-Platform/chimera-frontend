import ImageCanvas from "@/components/canvas/ImageCanvas";

export default function InpaintTab({
  generatedImage,
  isGenerating,
  isSaved,
  setIsSaved,
  onInpaint
}) {
  if (!generatedImage) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Please generate an image first</p>
      </div>
    );
  }

  return (
    <div className="canvas-content">
      <ImageCanvas
        initialImage={generatedImage.url}
        onInpaint={onInpaint}
        isProcessing={isGenerating}
        isSaved={isSaved}
        setIsSaved={setIsSaved}
      />
    </div>
  );
}
