import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { toast } from "sonner";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setLoading(true);

      if (authUser) {
        try {
          // Get a fresh token and store it
          const token = await authUser.getIdToken(true);
          localStorage.setItem("token", token);

          setUser(authUser);
        } catch (error) {
          console.error("Error refreshing token:", error);
          toast.error("Authentication error. Please log in again.");
          router.push("/login");
        }
      } else {
        // No user is signed in
        setUser(null);
        localStorage.removeItem("token");
      }

      setLoading(false);
    });

    // Set up token refresh every 30 minutes (1800000 ms)
    const refreshInterval = setInterval(async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken(true);
          localStorage.setItem("token", token);
          console.log("Token refreshed");
        } catch (error) {
          console.error("Error refreshing token:", error);
        }
      }
    }, 1800000);

    // Clean up on unmount
    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [router]);

  return { user, loading };
}
