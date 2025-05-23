"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { chatApi } from "@/lib/api/chat";
import { useAuth } from "./AuthContext";

const CreditsContext = createContext();

export function CreditsProvider({ children }) {
  const { user } = useAuth();
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCredits = async () => {
    if (!user) {
      setLoading(false);
      setError("Not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const creditsData = await chatApi.getCredits();
      setCredits(creditsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching credits:", err);
      setError(err.response?.data?.error || "Failed to load credits data");
    } finally {
      setLoading(false);
    }
  };

  // Get credits on initial load or when user changes
  useEffect(() => {
    if (user) {
      fetchCredits();
    }
  }, [user]);

  // Function to manually refresh credits data
  const refreshCredits = () => {
    fetchCredits();
  };

  return (
    <CreditsContext.Provider value={{ credits, loading, error, refreshCredits }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  return useContext(CreditsContext);
}
