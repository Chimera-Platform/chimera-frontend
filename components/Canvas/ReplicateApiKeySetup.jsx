"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { setReplicateApiKey } from "@/services/imageService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ReplicateApiKeySetup({ onKeySet }) {
  const { user } = useAuth();
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to continue");
      return;
    }

    if (!key.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    setLoading(true);
    try {
      await setReplicateApiKey(key.trim());
      setKey("");
      toast.success("API key set successfully");
      if (onKeySet) onKeySet();
    } catch (error) {
      console.error("Error setting Replicate API key:", error);
      if (error.response?.status === 401) {
        toast.error("Please sign in to continue");
      } else {
        toast.error(error.response?.data?.error || "Failed to set API key");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-t-lg">
            <CardTitle className="text-slate-800 dark:text-slate-200">Authentication Required</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Please sign in to set up your Replicate API key.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-t-lg">
          <CardTitle className="text-slate-800 dark:text-slate-200">Set Replicate API Key</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            To use the AI image generator, please enter your Replicate API key. You can get
            one from{" "}
            <a
              href="https://replicate.com/account/api-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              replicate.com
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter your API key (r8_...)"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                disabled={loading}
                required
                className="border-slate-200 dark:border-slate-800 focus:border-indigo-300 dark:focus:border-indigo-700 focus:ring-indigo-500 dark:focus:ring-indigo-600 bg-white dark:bg-slate-900"
              />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your API key is stored securely and never shared.
              </p>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              disabled={loading || !key.trim()}
            >
              {loading ? "Setting API Key..." : "Set API Key"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
