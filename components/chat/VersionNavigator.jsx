"use client";

import { useChatVersion } from "@/context/ChatVersionContext";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function VersionNavigator() {
  const {
    chatVersions,
    currentVersionIndex,
    navigateToVersion,
    deleteLastUserMessage,
  } = useChatVersion();

  if (chatVersions.length <= 1) {
    return null; // Don't show navigator if there's only one version
  }

  const currentVersion = chatVersions[currentVersionIndex];
  const isFirstVersion = currentVersionIndex === 0;
  const isLatestVersion = currentVersionIndex === chatVersions.length - 1;

  // Simple function to format the date
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateToVersion(currentVersionIndex - 1)}
                disabled={isFirstVersion}
                className="h-8 w-8"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="sr-only">Previous version</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Previous version</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <span className="text-sm text-slate-600 dark:text-slate-400">
          Version {currentVersionIndex + 1} of {chatVersions.length}
          {currentVersion.timestamp && (
            <span className="ml-2 text-xs">
              ({formatDate(currentVersion.timestamp)})
            </span>
          )}
        </span>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateToVersion(currentVersionIndex + 1)}
                disabled={isLatestVersion}
                className="h-8 w-8"
              >
                <ArrowRightIcon className="h-4 w-4" />
                <span className="sr-only">Next version</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Next version</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={deleteLastUserMessage}
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <TrashIcon className="h-4 w-4" />
              <span className="sr-only">Delete last message</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete last user message</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
