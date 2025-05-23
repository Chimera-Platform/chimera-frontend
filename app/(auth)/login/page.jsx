"use client";

// React and Next.js imports
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";

// Firebase imports
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  getIdToken,
} from "firebase/auth";
import { auth } from "@/firebase/firebase";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

// Icons
import {
  FiSun,
  FiMoon,
  FiAlertCircle,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

// Styles
import "./styles.css";

export default function LoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if user is already authenticated
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get the ID token and store it in localStorage
        try {
          const token = await user.getIdToken();
          localStorage.setItem("token", token);
          console.log("Token stored in localStorage");
        } catch (error) {
          console.error("Error getting ID token:", error);
        }

        // User is signed in, redirect to dashboard
        router.push("/dashboard");
      } else {
        // No user is signed in, show login page
        setCheckingAuth(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!loginData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(loginData.email))
      newErrors.email = "Email is invalid";

    if (!loginData.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );
      const user = userCredential.user;

      // Get the ID token and store it in localStorage
      const token = await user.getIdToken();
      localStorage.setItem("token", token);

      toast.success("Login successful");
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Failed to login";

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password";
          break;
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Try again later";
          break;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Get the ID token and store it in localStorage
      const token = await user.getIdToken();
      localStorage.setItem("token", token);

      toast.success("Login successful");
      router.push("/dashboard");
    } catch (error) {
      console.error("Google login error:", error);
      let errorMessage = "Failed to login with Google";

      switch (error.code) {
        case "auth/popup-closed-by-user":
          errorMessage = "Sign-in popup was closed before completing";
          break;
        case "auth/cancelled-popup-request":
          errorMessage = "Multiple popup requests were triggered";
          break;
        case "auth/popup-blocked":
          errorMessage = "Popup was blocked by the browser";
          break;
        default:
          errorMessage = "An error occurred during Google sign-in";
      }

      toast.error(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Show loading state while checking auth status
  if (checkingAuth || !mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950 overflow-hidden">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-indigo-600 border-indigo-200 rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-300">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div className="flex h-screen">
      {/* Left side - Logo and Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-slate-900 dark:to-indigo-950 flex-col items-center justify-center p-12 relative">
        <div className="absolute top-6 left-6">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-10 h-10 toggle-button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? (
              <FiSun className="w-5 h-5" />
            ) : (
              <FiMoon className="w-5 h-5" />
            )}
          </Button>
        </div>

        <div className="text-center animate-fade-in">
          <div className="mb-8 flex justify-center">
            <Image
              src="/images/logo.svg"
              alt="AI Avatar App Logo"
              width={180}
              height={180}
              className="dark:invert"
            />
          </div>
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
            Chimera AI
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-md">
            Create, customize, and chat with unique AI avatars. Unlock the power
            of personalized AI interactions.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-sm">
              <h3 className="font-medium text-indigo-600 dark:text-indigo-400">
                Personalized
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Create avatars that match your needs
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-sm">
              <h3 className="font-medium text-indigo-600 dark:text-indigo-400">
                Interactive
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Natural conversations with AI
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-950 h-full">
        <ScrollArea className="w-full max-w-md flex flex-col justify-center px-4 md:px-8 py-6 space-y-8 bg-white dark:bg-slate-950 rounded-lg shadow-md border border-slate-200 dark:border-slate-800">
          <div className="space-y-8 p-2 animate-fade-in">
            {/* Mobile-only theme toggle and logo */}
            <div className="md:hidden flex items-center justify-between mb-8">
              <Image
                src="/images/logo.svg"
                alt="AI Avatar App Logo"
                width={40}
                height={40}
                className="dark:invert"
              />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10 toggle-button"
                onClick={() => setTheme(isDark ? "light" : "dark")}
              >
                {isDark ? (
                  <FiSun className="w-5 h-5" />
                ) : (
                  <FiMoon className="w-5 h-5" />
                )}
              </Button>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                Welcome !
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Sign in to your account to continue
              </p>
            </div>

            {/* Google Sign-in Button */}
            <div className="mb-6">
              <Button
                type="button"
                variant="outline"
                disabled={isGoogleLoading}
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-5 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-500 border-t-indigo-600 rounded-full animate-spin"></div>
                ) : (
                  <Image
                    src="/images/google.svg"
                    alt="Google"
                    width={20}
                    height={20}
                  />
                )}
                <span>
                  {isGoogleLoading ? "Signing in..." : "Log in & Sign up with Google"}
                </span>
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-800 flex-grow"></div>
              <span className="px-3 text-sm text-slate-500 dark:text-slate-400">
                or continue with email
              </span>
              <div className="border-t border-slate-200 dark:border-slate-800 flex-grow"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <div className="space-y-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiMail className="text-slate-400 dark:text-slate-500" />
                  </div>
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Email address"
                    value={loginData.email}
                    onChange={handleChange}
                    className={`pl-10 ${
                      errors.email ? "border-red-500 dark:border-red-500" : ""
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                    <FiAlertCircle />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiLock className="text-slate-400 dark:text-slate-500" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${
                      errors.password
                        ? "border-red-500 dark:border-red-500"
                        : ""
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                    <FiAlertCircle />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember-me" 
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    className="h-4 w-4 border-2 transition-all duration-200 ease-in-out 
                              border-slate-400 dark:border-slate-600 
                              data-[state=checked]:border-transparent 
                              data-[state=checked]:bg-gradient-to-r from-indigo-500 to-purple-500
                              data-[state=checked]:shadow-[0_0_0_2px_rgba(129,140,248,0.3)]
                              dark:data-[state=checked]:shadow-[0_0_0_2px_rgba(129,140,248,0.3)]
                              hover:border-indigo-400 dark:hover:border-indigo-400
                              focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2
                              dark:focus:ring-offset-slate-900 
                              data-[state=checked]:scale-110 data-[state=checked]:animate-pulse-subtle"
                  />
                  <label
                    htmlFor="remember-me"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed 
                              peer-disabled:opacity-70 text-slate-700 dark:text-slate-300 
                              select-none cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 
                              dark:hover:text-indigo-300"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
