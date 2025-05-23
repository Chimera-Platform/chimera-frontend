import { Button } from "@/components/ui/button";
import { FiUpload } from "react-icons/fi";

export default function GalleryHeader({ 
  onUploadClick, 
  onCreateNewClick, 
  selectMode, 
  fileInputRef, 
  onFileChange 
}) {
  return (
    <div className="profile-section bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">Image Collection</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {selectMode ? "Select an image to use as your avatar" : "Upload, create, and manage your images"}
          </p>
        </div>
        
        {!selectMode && (
          <div className="flex gap-2">
            <Button 
              onClick={onUploadClick} 
              className="avatar-upload-button bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
            >
              <FiUpload className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={onFileChange}
              accept="image/*"
            />
            <Button 
              onClick={onCreateNewClick}
              className="avatar-upload-button bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
            >
              Create New
            </Button>
          </div>
        )}
      </div>
      
      {selectMode && (
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 mt-4">
          <p className="text-center font-medium text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
            <FiUpload className="mr-2 h-5 w-5" />
            Selection Mode: Click on an image to use it for your avatar
          </p>
          <p className="text-center text-sm text-indigo-600 dark:text-indigo-400 mt-1">
            After selecting, you'll be returned to the avatar creation page
          </p>
        </div>
      )}
    </div>
  );
}
