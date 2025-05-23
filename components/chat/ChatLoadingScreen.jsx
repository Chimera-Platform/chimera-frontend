import React from "react";
import { cn } from "@/lib/utils";

export function ChatLoadingScreen({ avatarUrl, characterName }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 animate-fadeIn">
      <div className="w-full max-w-md">
        {/* Chat bubble loading animation */}
        <div className="space-y-8">
          {/* User message skeleton */}
          <div className="flex items-start space-x-4 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
              <div className="space-y-2">
                <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>

          {/* AI message skeleton */}
          <div className="flex items-start space-x-4 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex-shrink-0">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={characterName || "AI Assistant"}
                  className="h-full w-full object-cover rounded-full opacity-50"
                />
              ) : (
                <div className="h-10 w-10 flex items-center justify-center">
                  <span className="text-indigo-500 dark:text-indigo-300 opacity-50 font-medium">
                    {characterName ? characterName.charAt(0) : "AI"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-3 w-4/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>

          {/* Typing indicator */}
          <div className="flex items-start space-x-4">
            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex-shrink-0 flex items-center justify-center">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={characterName || "AI Assistant"}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <span className="text-indigo-500 dark:text-indigo-300 font-medium">
                  {characterName ? characterName.charAt(0) : "AI"}
                </span>
              )}
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-lg">
              <div className="flex space-x-2 items-center h-5">
                <div className="typing-indicator flex space-x-1 items-center">
                  <span className="dot w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span className="dot w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span className="dot w-2 h-2 rounded-full bg-indigo-500"></span>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Loading conversation...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">
          Loading your conversation...
        </p>
      </div>
    </div>
  );
}
