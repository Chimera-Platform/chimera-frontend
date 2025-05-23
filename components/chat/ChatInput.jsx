"use client";

import { useState, useRef, useEffect } from "react";
import { SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ChatInput({ onSend, disabled }) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting || disabled) return;

    setIsSubmitting(true);
    try {
      await onSend(message);
      setMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 200); // Max height 200px
      textarea.style.height = `${newHeight}px`;
    }
  }, [message]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`border-t border-slate-200 dark:border-slate-800 p-4 flex gap-2 bg-white dark:bg-slate-950 transition-all ${
        disabled ? "bg-slate-50/50 dark:bg-slate-900/50" : ""
      }`}
    >
      <Textarea
        ref={textareaRef}
        className={`flex-grow resize-none min-h-[40px] max-h-[200px] border-slate-200 dark:border-slate-800 focus:border-indigo-300 dark:focus:border-indigo-700 focus:ring-indigo-500 dark:focus:ring-indigo-600 bg-white dark:bg-slate-900 transition-all ${
          disabled ? "bg-slate-50 dark:bg-slate-800/50 cursor-wait" : ""
        }`}
        placeholder={disabled ? "AI is thinking..." : "Type a message..."}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSubmitting || disabled}
        rows={1}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!message.trim() || isSubmitting || disabled}
        className={`${
          disabled
            ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        } text-white transition-colors`}
      >
        <SendIcon className="h-4 w-4" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}
