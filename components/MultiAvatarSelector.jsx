"use client";

import { useState, useEffect } from "react";
import { useAvatar } from "@/context/AvatarContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FiCheck, FiPlus } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function MultiAvatarSelector({ maxSelection = 4, onSelectComplete }) {
  const { userAvatars, selectedAvatars, toggleAvatarSelection, isAvatarSelected } = useAvatar();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  
  // Filtered avatars based on search query
  const filteredAvatars = userAvatars?.filter(
    avatar => avatar.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleAvatarToggle = (avatar) => {
    toggleAvatarSelection(avatar);
  };

  const handleDone = () => {
    if (selectedAvatars.length > 0 && onSelectComplete) {
      onSelectComplete(selectedAvatars);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Select Characters ({selectedAvatars.length}/{maxSelection})
        </h3>
        <Button
          onClick={handleDone}
          disabled={selectedAvatars.length === 0}
          variant="outline"
          className="text-sm"
        >
          Done
        </Button>
      </div>

      {selectedAvatars.length > 0 && (
        <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">
            Selected Characters:
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedAvatars.map(avatar => (
              <div key={avatar.id} className="flex items-center bg-white dark:bg-slate-800 rounded-full pl-1 pr-3 py-1 shadow-sm">
                <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                  <Image
                    src={avatar.profileImageUrl || "/placeholders/avatar-1.png"}
                    alt={avatar.name}
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {avatar.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ScrollArea className="h-[300px] pr-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredAvatars.map(avatar => (
            <div
              key={avatar.id}
              className={`
                relative cursor-pointer rounded-lg transition-all duration-200
                ${isAvatarSelected(avatar.id) 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-400 dark:border-indigo-600' 
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'}
              `}
              onClick={() => handleAvatarToggle(avatar)}
            >
              <div className="p-2 flex flex-col items-center">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden mb-2">
                  <Image
                    src={avatar.profileImageUrl || "/placeholders/avatar-1.png"}
                    alt={avatar.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-xs text-center font-medium text-slate-700 dark:text-slate-300 truncate w-full">
                  {avatar.name}
                </p>
              </div>
              
              {isAvatarSelected(avatar.id) && (
                <div className="absolute top-2 right-2 bg-indigo-500 rounded-full p-1">
                  <FiCheck className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {/* Create New Avatar Button */}
          <div
            className="cursor-pointer rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            onClick={() => router.push('/create-avatar')}
          >
            <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <FiPlus className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Create New</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
