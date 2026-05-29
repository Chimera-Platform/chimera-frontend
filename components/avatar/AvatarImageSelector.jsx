import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { FiImage } from "react-icons/fi";
import Image from "next/image";
import { STORAGE_ENABLED, PRESET_AVATARS } from "@/lib/config";

export default function AvatarImageSelector({
  profileImageUrl,
  setFormData,
  onSelectFromGallery,
  isLoading
}) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.error("Error loading image");
    setImageError(true);
    toast.error("Failed to load image. Please select another one.");
    setFormData((prev) => ({
      ...prev,
      profileImageUrl: "",
    }));
  };

  return (
    <div className="space-y-4 form-section">
      <Label className="text-slate-700 dark:text-slate-300 font-medium">Profile Image</Label>
      <div className="flex flex-col items-center space-y-4">
        {profileImageUrl ? (
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-indigo-200 dark:border-indigo-700 avatar-preview shadow-md">
            {profileImageUrl.includes("firebasestorage") ||
             profileImageUrl.includes("storage.googleapis.com") ? (
              // Use regular img tag for Firebase Storage URLs
              <img
                src={profileImageUrl}
                alt="Avatar profile"
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              // Use Next.js Image for other URLs
              <Image
                src={profileImageUrl}
                alt="Avatar profile"
                fill
                className="object-cover"
                onError={handleImageError}
                unoptimized={true}
              />
            )}
          </div>
        ) : (
          <div className="w-40 h-40 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
            <FiImage className="w-12 h-12 text-slate-400 dark:text-slate-500" />
          </div>
        )}

        {STORAGE_ENABLED ? (
          <Button
            type="button"
            onClick={onSelectFromGallery}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white"
          >
            <FiImage className="w-4 h-4 mr-2" />
            {profileImageUrl ? "Change Image" : "Select from Gallery"}
          </Button>
        ) : (
          <div className="w-full space-y-2">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              Choose a preset avatar
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {PRESET_AVATARS.map((url) => {
                const selected = profileImageUrl === url;
                return (
                  <button
                    type="button"
                    key={url}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, profileImageUrl: url }))
                    }
                    disabled={isLoading}
                    className={`relative w-20 h-20 rounded-full overflow-hidden border-2 transition-all ${
                      selected
                        ? "border-indigo-500 ring-2 ring-indigo-300 dark:ring-indigo-700"
                        : "border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                    }`}
                  >
                    <Image
                      src={url}
                      alt="Preset avatar"
                      fill
                      sizes="80px"
                      className="object-cover"
                      unoptimized={true}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
