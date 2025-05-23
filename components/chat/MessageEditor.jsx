"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export function MessageEditor({ initialContent, onSave, onCancel }) {
  const [editedContent, setEditedContent] = useState(initialContent || "");
  const textareaRef = useRef(null);

  // Focus the textarea when the component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, []);

  // Auto resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 300); // Max height 300px
      textarea.style.height = `${newHeight}px`;
    }
  }, [editedContent]);

  const handleSave = () => {
    if (editedContent.trim() === "") return;
    onSave(editedContent);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="flex flex-col space-y-2 p-4 border border-indigo-300 dark:border-indigo-700 rounded-lg bg-indigo-50 dark:bg-indigo-950/20">
      <Textarea
        ref={textareaRef}
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[100px] resize-none border-slate-200 dark:border-slate-800 focus:border-indigo-300 dark:focus:border-indigo-700 focus:ring-indigo-500 dark:focus:ring-indigo-600 bg-white dark:bg-slate-900"
        placeholder="Edit your message..."
      />
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="text-slate-600 dark:text-slate-400"
        >
          <XMarkIcon className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={editedContent.trim() === ""}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <CheckIcon className="h-4 w-4 mr-1" />
          Save
        </Button>
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400">
        Press Ctrl+Enter to save, Esc to cancel
      </div>
    </div>
  );
}
