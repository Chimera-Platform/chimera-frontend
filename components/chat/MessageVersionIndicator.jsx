"use client";

import { useState, useEffect } from "react";
import { useChatVersion } from "@/context/ChatVersionContext";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function MessageVersionIndicator({ messageIndex }) {
  const {
    chatVersions,
    currentVersionIndex,
    navigateToVersion,
    waitingForResponse,
  } = useChatVersion();

  // Simple function to format the date
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (chatVersions.length <= 1 || waitingForResponse) {
    return null; // Don't show navigator if there's only one version or if waiting for response
  }

  const currentVersion = chatVersions[currentVersionIndex];
  const isFirstVersion = currentVersionIndex === 0;
  const isLatestVersion = currentVersionIndex === chatVersions.length - 1;

  // Simple navigation to previous/next version
  const goToPreviousVersion = () => {
    if (!isFirstVersion) {
      navigateToVersion(currentVersionIndex - 1);
    }
  };

  const goToNextVersion = () => {
    if (!isLatestVersion) {
      navigateToVersion(currentVersionIndex + 1);
    }
  };

  return (
    <div className="flex items-center mt-2 py-1 px-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-md text-xs border border-indigo-100 dark:border-indigo-800/30">
      <div className="flex items-center space-x-2">
        <ClockIcon className="h-3 w-3 text-indigo-500 dark:text-indigo-400" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousVersion}
                disabled={isFirstVersion}
                className="h-5 w-5 p-0 hover:bg-indigo-100 dark:hover:bg-indigo-800/30"
              >
                <ArrowLeftIcon className="h-3 w-3" />
                <span className="sr-only">Previous version</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Previous version</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
          {currentVersionIndex + 1}/{chatVersions.length}
        </span>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextVersion}
                disabled={isLatestVersion}
                className="h-5 w-5 p-0 hover:bg-indigo-100 dark:hover:bg-indigo-800/30"
              >
                <ArrowRightIcon className="h-3 w-3" />
                <span className="sr-only">Next version</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Next version</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {currentVersion.timestamp && (
          <span className="text-xs text-indigo-600/70 dark:text-indigo-400/70">
            {formatDate(currentVersion.timestamp)}
          </span>
        )}
      </div>
    </div>
  );
}
