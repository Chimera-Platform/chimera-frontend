"use client";
import { useState, useEffect } from "react";
// Auth & Firebase
import { useAuth } from "@/context/AuthContext";
import { auth, storage } from "@/firebase/firebase";
import { updateProfile } from "firebase/auth";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
// Utilities
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import { useTheme } from "next-themes";
// Icons
import {
  FiSun,
  FiMoon,
  FiUser,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiMessageSquare,
  FiShoppingBag,
  FiPenTool,
  FiSettings,
  FiX,
  FiImage,
  FiSave,
  FiCheck,
} from "react-icons/fi";
// Styles
import "../dashboard/styles.css"; // Reusing dashboard styles
import "./styles.css"; // Profile-specific styles

export default function ProfilePage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("/images/default-avatar.png");
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setDisplayName(user.displayName || "");
      if (user.photoURL) {
        setPhotoURL(user.photoURL);
        setImageError(false);
      }
    }
  }, [user]);

  // If not mounted yet, return a simple loading state
  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  const isDark = theme === "dark";

  const processImage = async (file) => {
    // First check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size too large. Maximum size is 5MB");
    }

    // Create an image element to check dimensions
    const img = document.createElement("img");
    const imageUrl = URL.createObjectURL(file);

    try {
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Check dimensions
      if (img.width > 512 || img.height > 512) {
        console.log("Image needs resizing");
      }

      // Compression options
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 512,
        useWebWorker: true,
        fileType: file.type,
      };

      // Compress the image
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user) {
      toast.error("Please log in to update your profile");
      return;
    }

    try {
      setLoading(true);

      // Process and validate the image
      const processedFile = await processImage(file);

      // Delete the old avatar if it exists and is not the default avatar
      if (user.photoURL && !user.photoURL.includes("default-avatar")) {
        try {
          // Extract the path from the full URL
          const oldAvatarUrl = new URL(user.photoURL);
          const pathSegments = oldAvatarUrl.pathname.split("/");
          const storagePath = pathSegments
            .slice(pathSegments.indexOf("o") + 1)
            .join("/");
          const decodedPath = decodeURIComponent(storagePath);

          // Delete the old file
          const oldAvatarRef = ref(storage, decodedPath);
          await deleteObject(oldAvatarRef);
        } catch (error) {
          console.log("No old avatar to delete or error deleting:", error);
        }
      }

      // Upload the new image
      const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, processedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await updateProfile(auth.currentUser, {
        photoURL: downloadURL,
      });

      setPhotoURL(downloadURL);
      toast.success("Profile photo updated successfully!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error(error.message || "Failed to update profile photo");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to update your profile");
      return;
    }
    if (!displayName.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    try {
      setLoading(true);
      await updateProfile(auth.currentUser, {
        displayName: displayName,
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardShell
        activePage="profile"
        title="Profile Settings"
        subtitle="Manage your personal information and account preferences"
      >
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-32 h-32 mb-4">
                <Image
                  src={imageError ? "/images/default-avatar.png" : photoURL}
                  alt="Profile"
                  fill
                  sizes="(max-width: 128px) 100vw, 128px"
                  className="rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md"
                  priority
                  unoptimized
                  onError={() => {
                    setImageError(true);
                    setPhotoURL("/images/default-avatar.png");
                  }}
                />
                <div className="absolute bottom-0 right-0">
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white p-2 rounded-full shadow-lg transition-colors">
                      <FiImage className="h-5 w-5" />
                    </div>
                    <div className="sr-only">
                      Upload profile photo (max 5MB, will be resized to
                      512x512)
                    </div>
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={loading}
                  />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                {user?.displayName || "Your Name"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                {user?.email}
              </p>
              <div className="flex space-x-2">
                <div className="px-2 py-1 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  Free Account
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Supported formats: JPEG, PNG, WebP (max 5MB)
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
              Personal Information
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-300">
                  Email
                </label>
                <Input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-300">
                  Username
                </label>
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your username"
                  disabled={loading}
                  className="border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FiSave className="mr-2" />
                    Update Profile
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Account Information Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
              Account Information
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">
                  Account type
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  Free
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">
                  Member since
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {user?.metadata?.creationTime
                    ? new Date(
                        user.metadata.creationTime
                      ).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-600 dark:text-slate-400">
                  Last sign in
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {user?.metadata?.lastSignInTime
                    ? new Date(
                        user.metadata.lastSignInTime
                      ).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/upgrade">
                <Button variant="outline" className="w-full">
                  <FiCheck className="mr-2" />
                  Upgrade Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
