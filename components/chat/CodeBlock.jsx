import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import { ClipboardIcon, CheckIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export function EnhancedCodeBlock({ language, code, isDark, collapsedCodeBlocks, toggleCodeBlock }) {
  const [copied, setCopied] = useState(false);
  
  // Create a stable ID based on the code content (first 50 chars for brevity)
  const stableContent = code.slice(0, 50).replace(/\s+/g, '');
  const blockId = `${language}-${stableContent}`;
  const isCollapsed = collapsedCodeBlocks[blockId] || false;
  
  const isLongCode = code.split('\n').length > 15;
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <div className="relative my-4 inline-block min-w-[12rem] max-w-full rounded-md overflow-hidden border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 dark:bg-slate-900 text-xs text-slate-100">
        <span>{language}</span>
        <div className="flex items-center gap-2">
          {isLongCode && (
            <button
              onClick={() => toggleCodeBlock(blockId)}
              className="flex items-center gap-1 text-xs text-slate-300 hover:text-white transition-colors"
              aria-label={isCollapsed ? "Expand code" : "Collapse code"}
              title={isCollapsed ? "Expand code" : "Collapse code"}
            >
              {isCollapsed ? (
                <ChevronDownIcon className="h-3 w-3" />
              ) : (
                <ChevronUpIcon className="h-3 w-3" />
              )}
              <span>{isCollapsed ? "Show more" : "Show less"}</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-slate-300 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <CheckIcon className="h-3 w-3" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <ClipboardIcon className="h-3 w-3" />
                <span>Copy code</span>
              </>
            )}
          </button>
        </div>
      </div>
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out",
          isCollapsed && isLongCode ? "max-h-36 overflow-hidden relative" : ""
        )}
      >
        {isCollapsed && isLongCode && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-100 dark:from-slate-800 to-transparent z-10"></div>
        )}
        <SyntaxHighlighter
          language={language}
          style={isDark ? vscDarkPlus : vs}
          customStyle={{
            margin: 0,
            padding: "1rem",
            borderRadius: "0 0 0.375rem 0.375rem",
            display: "inline-block",
            minWidth: "100%",
            overflowX: "auto",
          }}
          wrapLines={true}
          wrapLongLines={false}
          showLineNumbers={true}
          lineNumberStyle={{
            minWidth: '2.5em',
            paddingRight: '1em',
            color: isDark ? '#506882' : '#a4b5c6',
            textAlign: 'right',
            userSelect: 'none',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export function CodeBlock({ language, code, isDark }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <div className="relative my-4 inline-block min-w-[12rem] max-w-full rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 dark:bg-slate-900 text-xs text-slate-100">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-slate-300 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <CheckIcon className="h-3 w-3" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <ClipboardIcon className="h-3 w-3" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={isDark ? vscDarkPlus : vs}
        customStyle={{
          margin: 0,
          padding: "1rem",
          borderRadius: "0 0 0.375rem 0.375rem",
          display: "inline-block",
          minWidth: "100%",
          overflowX: "auto",
        }}
        wrapLines={true}
        wrapLongLines={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
