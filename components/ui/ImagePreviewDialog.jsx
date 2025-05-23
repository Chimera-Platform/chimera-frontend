import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, ZoomIn, ZoomOut } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const ImagePreviewDialog = ({ isOpen, onClose, image }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const transformComponentRef = useRef(null);
  const lastClickTimeRef = useRef(0);
  const doubleClickTimeoutRef = useRef(null);

  // Reset zoom level when dialog opens/closes
  useEffect(() => {
    if (!isOpen && transformComponentRef.current) {
      resetZoom();
    }
  }, [isOpen]);

  // Handle download function
  const handleDownload = async () => {
    if (!image) return;
    
    try {
      const imageUrl = image.URL || image.url;
      const response = await fetch(imageUrl, {
        credentials: 'include',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;

      const prompt = image.Prompt || image.prompt;
      const id = image.ID || image.id || "image";
      const filename = prompt
        ? `${prompt.substring(0, 30).replace(/[^a-z0-9]/gi, "_")}.jpg`
        : `image_${typeof id === 'string' ? id.substring(0, 8) : Date.now()}.jpg`;

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  // Zoom functions
  const handleZoomIn = () => {
    if (transformComponentRef.current) {
      transformComponentRef.current.zoomIn(0.25);
    }
  };
  
  const handleZoomOut = () => {
    if (transformComponentRef.current) {
      transformComponentRef.current.zoomOut(0.25);
    }
  };
  
  const resetZoom = () => {
    if (transformComponentRef.current) {
      transformComponentRef.current.resetTransform();
    }
  };

  // Handle double click with custom implementation
  const handleDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!transformComponentRef.current) return;
    
    try {
      const currentZoom = transformComponentRef.current.instance.transformState.scale;
      
      // If already zoomed in to 200% or more, reset to 100%
      if (currentZoom >= 2) {
        transformComponentRef.current.resetTransform();
        return;
      }
      
      // Otherwise zoom to 200% at the clicked point
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      
      // Calculate the position in the image space
      const container = transformComponentRef.current.instance.contentComponent;
      const containerWidth = container.width;
      const containerHeight = container.height;
      
      // Calculate the center point of the clicked area
      const centerX = (offsetX / rect.width) * containerWidth;
      const centerY = (offsetY / rect.height) * containerHeight;
      
      // Perform the zoom to the specific point (2 = 200% zoom)
      transformComponentRef.current.zoomToPoint(2, { x: centerX, y: centerY });
    } catch (error) {
      console.error("Error handling double click:", error);
      
      // Fallback approach
      if (zoomLevel >= 2) {
        resetZoom();
      } else {
        transformComponentRef.current.zoomIn(1);
      }
    }
  };
  
  // Custom click handler to detect double clicks
  const handleImageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentTime = new Date().getTime();
    const timeSinceLastClick = currentTime - lastClickTimeRef.current;
    
    // Update the last click time
    lastClickTimeRef.current = currentTime;
    
    // If double click (within 300ms)
    if (timeSinceLastClick < 300) {
      // Clear any existing timeout
      if (doubleClickTimeoutRef.current) {
        clearTimeout(doubleClickTimeoutRef.current);
        doubleClickTimeoutRef.current = null;
      }
      
      // Handle double click
      handleDoubleClick(e);
    }
  };

  // More reliable way to track zoom level changes
  const handleTransform = (ref) => {
    if (ref?.instance?.transformState) {
      const newZoom = ref.instance.transformState.scale;
      setZoomLevel(newZoom);
    }
  };

  if (!image) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black/80 flex items-center justify-center transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => onClose(false)}
    >
      {/* Main Content Container */}
      <div 
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Positioned top right */}
        <Button 
          onClick={() => onClose(false)}
          className="absolute -top-14 right-0 bg-black/60 hover:bg-black/80 text-white rounded-full h-12 w-12 z-[100]"
        >
          <X size={24} />
        </Button>
        
        {/* Image Container with TransformWrapper */}
        <div className="overflow-hidden bg-transparent max-h-[85vh] max-w-[90vw]">
          <TransformWrapper
            ref={transformComponentRef}
            initialScale={1}
            initialPositionX={0}
            initialPositionY={0}
            minScale={0.5}
            maxScale={3}
            limitToBounds={true}
            doubleClick={{ disabled: true }} // Disable built-in double-click
            onTransformed={handleTransform}
            centerOnInit={true}
            wheel={{
              step: 0.1, // Smaller step for smoother zooming
              wheelEnabled: true,
              touchPadEnabled: true,
              activationKeys: [], // No modifier keys required for wheel zoom
            }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <TransformComponent
                  wrapperStyle={{ width: '100%', height: '100%' }}
                  contentStyle={{ width: '100%', height: '100%' }}
                >
                  <div 
                    className="w-full h-full relative cursor-pointer"
                    onClick={handleImageClick}
                  >
                    <img
                      src={image.URL || image.url}
                      alt={image.Prompt || image.prompt || "Preview image"}
                      className="max-w-full max-h-[85vh] object-contain"
                      draggable={false}
                      style={{ pointerEvents: 'none' }}  // Prevent image from capturing events
                    />
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
        
        {/* Control Bar */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/60 p-2 rounded-full">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleZoomOut} 
            className="text-white h-8 w-8 hover:bg-black/40"
            disabled={zoomLevel <= 0.5}
          >
            <ZoomOut size={16} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={resetZoom} 
            className="text-white h-8 w-8 hover:bg-black/40"
          >
            <span className="text-xs">{Math.round(zoomLevel * 100)}%</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleZoomIn} 
            className="text-white h-8 w-8 hover:bg-black/40"
            disabled={zoomLevel >= 3}
          >
            <ZoomIn size={16} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDownload} 
            className="text-white h-8 w-8 hover:bg-black/40"
          >
            <Download size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewDialog;
