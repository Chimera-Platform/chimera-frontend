"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAvatar } from "@/context/AvatarContext";
// UI Components
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
import Image from "next/image";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
// Icons
import {
  FiPenTool,
} from "react-icons/fi";
// Styles
import "../dashboard/styles.css";
import "./styles.css";

export default function MarketplacePage() {
  const router = useRouter();
  const {
    publicAvatars,
    loadPublicAvatars,
    loading,
    avatarsLoaded,
    reloadAvatars,
  } = useAvatar();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAvatars, setFilteredAvatars] = useState([]);

  // Only load avatars if they haven't been loaded yet
  useEffect(() => {
    if (!avatarsLoaded && !loading) {
      console.log("Marketplace page: Loading avatars");
      reloadAvatars();
    } else {
      console.log(
        "Marketplace page: Avatars already loaded or loading in progress"
      );
    }
  }, [avatarsLoaded, loading, reloadAvatars]);

  useEffect(() => {
    if (publicAvatars) {
      setFilteredAvatars(
        publicAvatars.filter(
          (avatar) =>
            avatar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            avatar.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [publicAvatars, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewDetails = (avatarId) => {
    router.push(`/characters/${avatarId}`);
  };

  return (
    <DashboardShell activePage="marketplace" title="Avatar Marketplace">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Search Section */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
            Search Avatars
          </h2>
          <div className="w-full">
            <Input
              type="text"
              placeholder="Search avatars by name or description..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 marketplace-search"
            />
          </div>
        </div>

        {/* Avatar Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden card-hover border-slate-200 dark:border-slate-800">
                <div className="aspect-square relative">
                  <Skeleton className="h-full w-full" />
                </div>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredAvatars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 avatar-grid">
            {filteredAvatars.map((avatar, index) => (
              <Card 
                key={avatar.id} 
                className="overflow-hidden flex flex-col card-hover border-slate-200 dark:border-slate-800 profile-section marketplace-avatar-card avatar-item"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-square relative profile-avatar">
                  <Image
                    src={avatar.profileImageUrl}
                    alt={avatar.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-slate-800 dark:text-slate-200">{avatar.name}</CardTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    {avatar.description}
                  </p>
                </CardHeader>
                <CardFooter className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-4">
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white"
                    onClick={() => handleViewDetails(avatar.id)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-10 flex flex-col items-center justify-center text-center profile-section">
            <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-200">No avatars found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {searchTerm
                ? "No avatars match your search criteria"
                : "There are no public avatars available yet"}
            </p>
            <Button 
              onClick={() => router.push("/create-avatar")}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white"
            >
              <FiPenTool className="w-5 h-5 mr-2" />
              Create Your Own Avatar
            </Button>
          </div>
        )}

        {/* Create Avatar Prompt */}
        {filteredAvatars.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800/30 p-6 flex flex-col md:flex-row items-center justify-between profile-section">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold mb-1 text-slate-800 dark:text-slate-200">
                Create Your Own Avatar
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Design a unique avatar and share it with the community
              </p>
            </div>
            <Button 
              onClick={() => router.push("/create-avatar")}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white"
            >
              <FiPenTool className="w-5 h-5 mr-2" />
              Get Started
            </Button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
