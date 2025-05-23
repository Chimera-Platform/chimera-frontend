"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { avatarApi } from "@/lib/api/avatar";
import { useAuth } from "@/context/AuthContext";
import { useAvatar } from "@/context/AvatarContext";
import { useChat } from "@/context/ChatContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Image from "next/image";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { MessageCircle, User } from "lucide-react";
import { FiArrowLeft } from "react-icons/fi";
// Styles
import "../../dashboard/styles.css";
import "../../characters/styles.css";

export default function CharacterDetailsPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const { user } = useAuth();
  const { selectAvatar } = useAvatar();
  const { selectChat, setManualChatReset } = useChat();
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        setLoading(true);
        const data = await avatarApi.getAvatar(id);
        setAvatar(data);
      } catch (error) {
        console.error("Error fetching avatar:", error);
        setError("Failed to load character details");
        toast.error("Failed to load character details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAvatar();
    }
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleSelectAvatar = () => {
    if (!avatar) return;
    selectAvatar(avatar);
    toast.success(`Selected ${avatar.name} as your active avatar`);
    setManualChatReset(true);
    selectChat(null);
    setTimeout(() => {
      router.push("/chat");
      setTimeout(() => {
        setManualChatReset(false);
      }, 300);
    }, 50);
  };

  // Custom header with back button
  const CustomHeader = () => (
    <div className="flex items-center">
      <Button 
        variant="ghost" 
        onClick={handleBack} 
        className="mr-2 hover:bg-slate-100 dark:hover:bg-slate-800/60"
      >
        <FiArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
        {loading ? "Loading Character..." : avatar?.name || "Character Details"}
      </h1>
    </div>
  );

  return (
    <DashboardShell 
      activePage="characters"
      customHeader={<CustomHeader />}
    >
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 profile-section">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="mt-4 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-6 w-3/4 mx-auto" />
              </div>
            </div>
            <div className="md:col-span-2 space-y-6 profile-section">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        ) : error || !avatar ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 profile-section">
            <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-200">
              Character not found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              The character you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Button 
              onClick={() => router.push("/marketplace")}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 avatar-upload-button"
            >
              Browse Marketplace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Character Image */}
            <div className="md:col-span-1 profile-section bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="sticky top-8">
                <div className="aspect-square relative rounded-lg overflow-hidden profile-avatar">
                  <Image
                    src={avatar.profileImageUrl}
                    alt={avatar.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-4 space-y-4">
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 avatar-upload-button"
                    size="lg"
                    onClick={handleSelectAvatar}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Chat with {avatar.name}
                  </Button>

                  {avatar.creatorNickname && (
                    <div className="flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                      <User className="mr-2 h-4 w-4" />
                      Created by {avatar.creatorNickname}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Character Details */}
            <div className="md:col-span-2 profile-section bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex flex-col space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{avatar.name}</h1>
                  {avatar.isPublic && (
                    <Badge variant="secondary" className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                      Public
                    </Badge>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400">{avatar.description}</p>
              </div>

              <Tabs defaultValue="persona" className="w-full character-tabs">
                <TabsList className="grid w-full grid-cols-3 mb-4 bg-slate-100 dark:bg-slate-800">
                  <TabsTrigger value="persona" className="character-tab">Persona</TabsTrigger>
                  <TabsTrigger value="story" className="character-tab">Background Story</TabsTrigger>
                  <TabsTrigger value="profile" className="character-tab">Profile</TabsTrigger>
                </TabsList>
                <TabsContent value="persona" className="mt-4 space-y-4">
                  <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-slate-800 dark:text-slate-200">Character Persona</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="whitespace-pre-line text-slate-600 dark:text-slate-300">{avatar.persona}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="story" className="mt-4 space-y-4">
                  <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-slate-800 dark:text-slate-200">Background Story</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="whitespace-pre-line text-slate-600 dark:text-slate-300">{avatar.story}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="profile" className="mt-4 space-y-4">
                  <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-slate-800 dark:text-slate-200">Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="whitespace-pre-line text-slate-600 dark:text-slate-300">{avatar.profile}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
