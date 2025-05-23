"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAvatar } from "@/context/AvatarContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";
import { toast } from "sonner";
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useChat } from "@/context/ChatContext"; // added
// Styles
import "../dashboard/styles.css"; // Reusing dashboard styles
import "./styles.css"; // Character-specific styles

export default function CharactersPage() {
  const router = useRouter();
  const {
    userAvatars,
    loadUserAvatars,
    deleteAvatar,
    selectAvatar,
    loading,
    avatarsLoaded,
    reloadAvatars,
  } = useAvatar();
  const { selectChat, setManualChatReset } = useChat(); // added useChat functions
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAvatars, setFilteredAvatars] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [avatarToDelete, setAvatarToDelete] = useState(null);

  // Only load avatars if they haven't been loaded yet
  useEffect(() => {
    if (!avatarsLoaded && !loading) {
      console.log("Characters page: Loading avatars");
      reloadAvatars();
    } else {
      console.log(
        "Characters page: Avatars already loaded or loading in progress"
      );
    }
  }, [avatarsLoaded, loading, reloadAvatars]);

  useEffect(() => {
    if (userAvatars) {
      setFilteredAvatars(
        userAvatars.filter(
          (avatar) =>
            avatar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            avatar.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [userAvatars, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateAvatar = () => {
    router.push("/create-avatar");
  };

  const handleEditAvatar = (avatarId) => {
    router.push(`/create-avatar?edit=${avatarId}`);
  };

  const handleDeleteClick = (avatar) => {
    setAvatarToDelete(avatar);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!avatarToDelete) return;

    try {
      await deleteAvatar(avatarToDelete.id);
      toast.success("Avatar deleted successfully");
      // Trigger a reload of avatars
      reloadAvatars();
    } catch (error) {
      console.error("Failed to delete avatar:", error);
      toast.error("Failed to delete avatar");
    } finally {
      setDeleteDialogOpen(false);
      setAvatarToDelete(null);
    }
  };

  const handleSelectAvatar = (avatar) => {
    // First select the avatar in the context
    selectAvatar(avatar);
    toast.success(`Selected ${avatar.name} as your active avatar`);

    // Reset current chat to show welcome screen as in ChatStats.jsx
    setManualChatReset(true);
    selectChat(null);
    setTimeout(() => {
      // Navigate to clean chat URL
      router.push("/chat");
      // Reset the manual reset flag after navigation
      setTimeout(() => {
        setManualChatReset(false);
      }, 300);
    }, 50);
  };

  return (
    <DashboardShell activePage="characters" title="Your Characters">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="profile-section bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">Character Collection</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Create and manage your AI chat companions</p>
            </div>
            <div className="flex gap-4">
              <div className="w-full max-w-md">
                <Input
                  type="text"
                  placeholder="Search characters..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="form-field-transition border-slate-200 dark:border-slate-700"
                />
              </div>
              <Button 
                onClick={handleCreateAvatar}
                className="avatar-upload-button bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Create New
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden profile-section character-card">
                <div className="aspect-square relative">
                  <Skeleton className="h-full w-full" />
                </div>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardFooter className="flex justify-between">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredAvatars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAvatars.map((avatar, index) => (
              <Card 
                key={avatar.id} 
                className={`overflow-hidden profile-section character-card flex flex-col profile-section:nth-child(${index + 1})`}
              >
                <div className="aspect-square relative profile-avatar">
                  <Image
                    src={avatar.profileImageUrl}
                    alt={avatar.name}
                    fill
                    className="object-cover transition-transform"
                  />
                  {avatar.isPublic && (
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                      Public
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-slate-800 dark:text-slate-200">{avatar.name}</CardTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    {avatar.description}
                  </p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="default"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 avatar-upload-button"
                      onClick={() => handleSelectAvatar(avatar)}
                    >
                      Select for Chat
                    </Button>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-slate-200 dark:border-slate-700 form-field-transition"
                        onClick={() => handleEditAvatar(avatar.id)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-destructive hover:text-destructive border-slate-200 dark:border-slate-700 form-field-transition"
                        onClick={() => handleDeleteClick(avatar)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 profile-section">
            <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-200">
              No characters found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {searchTerm
                ? "No characters match your search criteria"
                : "You haven't created any characters yet"}
            </p>
            <Button 
              onClick={handleCreateAvatar} 
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 avatar-upload-button"
            >
              Create Your First Character
            </Button>
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Avatar</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{avatarToDelete?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
