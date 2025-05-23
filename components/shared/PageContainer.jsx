import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PageContainer({ 
  children, 
  className = "", 
  fullWidth = false,
  noScroll = false,
  noPadding = false,
}) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  // Set mounted state for theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // If not mounted yet, return a simple loading state
  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  const contentClasses = `
    ${noPadding ? '' : 'p-6'} 
    ${fullWidth ? 'w-full' : 'max-w-7xl mx-auto'} 
    ${className}
  `;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {noScroll ? (
        <div className={contentClasses}>
          {children}
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className={contentClasses}>
            {children}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
