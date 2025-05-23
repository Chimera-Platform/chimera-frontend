"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { getUserGallery } from "@/services/imageService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/firebase/firebase";

export default function GallerySelector({ open, onOpenChange, onSelectImage }) {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);

  // Available image types for filtering
  const imageTypes = ["generated", "uploaded", "inpainted", "variation"];

  // Fetch gallery when dialog opens
  useEffect(() => {
    const fetchGallery = async () => {
      if (!open) return;

      try {
        setIsLoading(true);
        
        // Ensure we have a valid token before making the request
        const user = auth.currentUser;
        if (!user) {
          throw new Error("You must be logged in to view your gallery");
        }
        
        // Force token refresh to ensure we have a valid token
        await user.getIdToken(true);
        
        const response = await getUserGallery();
        if (response.success) {
          setImages(response.images || []);
        } else {
          toast.error(response.error || "Failed to load gallery");
        }
      } catch (error) {
        console.error("Error fetching gallery:", error);
        toast.error(error.message || "Failed to load gallery");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGallery();
  }, [open]);

  // Filter images based on search query and selected types
  const filteredImages = useMemo(() => {
    return images.filter(image => {
      // Type filter
      const typeMatch = selectedTypes.length === 0 || 
        (image.type && selectedTypes.includes(image.type));
      
      // Search query filter (check prompt and other text fields)
      const searchMatch = !searchQuery || 
        (image.prompt && 
          image.prompt.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return typeMatch && searchMatch;
    });
  }, [images, selectedTypes, searchQuery]);

  const handleSelectImage = (image) => {
    onSelectImage(image);
    onOpenChange(false);
    toast.success("Image selected for inpainting");
  };

  const toggleTypeFilter = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTypes([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select an Image from Your Gallery</DialogTitle>
        </DialogHeader>

        {/* Search and filter section */}
        <div className="flex flex-col gap-3 mb-4 p-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by prompt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500 self-center">Filter by type:</span>
            {imageTypes.map(type => (
              <Badge 
                key={type}
                variant={selectedTypes.includes(type) ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => toggleTypeFilter(type)}
              >
                {type}
              </Badge>
            ))}
            {(selectedTypes.length > 0 || searchQuery) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-xs ml-1"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-t-indigo-600 border-indigo-200 rounded-full animate-spin"></div>
            <p className="ml-2">Loading your gallery...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-8">
            <p>
              {images.length === 0 
                ? "No images found in your gallery." 
                : "No images match your current filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="relative border rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity group"
                onClick={() => handleSelectImage(image)}
              >
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-40 object-cover"
                />
                {image.type && (
                  <span className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded capitalize">
                    {image.type}
                  </span>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-xs truncate group-hover:whitespace-normal group-hover:line-clamp-3 transition-all">
                  {image.prompt}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
