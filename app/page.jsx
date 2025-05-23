"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { FiSun, FiMoon, FiArrowRight, FiCode, FiUsers, FiMic, FiImage, FiMessageCircle, FiCpu } from "react-icons/fi";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

// Static avatar data instead of dynamic loading
const staticAvatars = [
  {
    id: 1,
    name: "Eren Kaçar",
    imagePath: "/images/ErenKacar.webp",
    creator: "AI Nexus Team",
    category: "Productivity",
    rating: 4.8
  },
  {
    id: 2,
    name: "ChatGPT but Girlfriend!",
    imagePath: "/images/ChatGPTGirlFriend.webp",
    creator: "Design Studio",
    category: "Creative",
    rating: 4.6
  },
  {
    id: 3,
    name: "EmirGPT",
    imagePath: "/images/EmirHoca.jpg",
    creator: "Dev Community",
    category: "Programming",
    rating: 4.9
  },
  {
    id: 4,
    name: "Vladilena Milizé",
    imagePath: "/images/AnimeGirl.webp",
    creator: "Social AI",
    category: "Companion",
    rating: 4.7
  }
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mount check to ensure hydration completes before rendering theme-dependent UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // If not mounted yet, return a simple loading state
  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-xl">Initializing AI Systems...</div>
      </div>
    );
  }

  const isDark = theme === "dark";

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-10 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Image
                src="/images/logo.svg"
                alt="Chimera Logo"
                width={40}
                height={40}
                className="dark:invert"
              />
              <span className="ml-2 font-bold text-xl text-slate-800 dark:text-slate-200">
                <span className="text-indigo-600 dark:text-indigo-400">Chimera</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10"
                onClick={() => setTheme(isDark ? "light" : "dark")}
              >
                {isDark ? (
                  <FiSun className="w-5 h-5" />
                ) : (
                  <FiMoon className="w-5 h-5" />
                )}
              </Button>

              {!loading && (
                <>
                  {user ? (
                    <Link href="/dashboard">
                      <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white">
                        Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <div className="flex gap-2">
                      <Link href="/login">
                        <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950">
                          Log in
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white">
                          Sign up
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Wrap the main content in ScrollArea */}
      <ScrollArea className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-800 [mask-image:linear-gradient(to_bottom,transparent,white)]"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent)]"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div 
              className="text-center"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 dark:from-indigo-400 dark:via-purple-400 dark:to-blue-400 mb-6">
                Next Gen AI Companions
              </h1>
              <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto mb-10">
                Create intelligent companions with advanced LLM, voice cloning, and image generation. 
                Your digital partners for coding, roleplay, and everyday assistance.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                {!loading &&
                  (user ? (
                    <Link href="/chat">
                      <Button
                        size="lg"
                        className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white group"
                      >
                        Start Creating <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/signup">
                        <Button
                          size="lg"
                          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white group"
                        >
                          Get Started <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      <Link href="/demo">
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950"
                        >
                          Try Demo
                        </Button>
                      </Link>
                    </>
                  ))}
              </div>
            </motion.div>

            {/* Demo Video/Screenshot */}
            <motion.div 
              className="relative w-full max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
                <div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                  {/* Replace with actual screenshot or video */}
                  <div className="absolute inset-0 flex items-center justify-center p-5">
                    <div className="w-full h-full rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        <div className="flex justify-center mb-4">
                          <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center">
                            <FiCpu className="w-10 h-10 text-white" />
                          </div>
                        </div>
                        <p className="text-white text-2xl font-medium">
                          Chimera Experience Demo
                        </p>
                        <Button className="mt-4 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
                          Play Demo
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* UI Decorations */}
                <div className="absolute top-5 left-5 flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute -bottom-4 -left-4 bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-lg">
                AI-Powered
              </div>
              <div className="absolute -bottom-4 right-20 bg-purple-600 text-white py-2 px-4 rounded-lg shadow-lg">
                Advanced ML Models
              </div>
              <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white py-2 px-4 rounded-lg shadow-lg">
                Pay As You Go
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Features Showcase */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Advanced AI <span className="text-indigo-600 dark:text-indigo-400">Platform</span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Unleash the power of cutting-edge artificial intelligence with our comprehensive suite of tools
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {/* LLM Bot */}
              <motion.div 
                className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 group hover:shadow-xl transition-all"
                variants={fadeIn}
              >
                <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                  <FiMessageCircle className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
                  Advanced LLM Bot
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Create conversational AI avatars with deep knowledge and personality using state-of-the-art language models.
                </p>
                <ul className="space-y-2 text-slate-500 dark:text-slate-400">
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span> Contextual memory
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span> Character customization
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span> Knowledge integration
                  </li>
                </ul>
              </motion.div>

              {/* Voice Clone */}
              <motion.div 
                className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 group hover:shadow-xl transition-all"
                variants={fadeIn}
              >
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                  <FiMic className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
                  Voice Clone
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Give your AI avatar a unique voice that sounds just like you or any voice you choose.
                </p>
                <ul className="space-y-2 text-slate-500 dark:text-slate-400">
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span> Natural intonation
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span> Multiple languages
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span> Voice customization
                  </li>
                </ul>
              </motion.div>

              {/* Image Canvas */}
              <motion.div 
                className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 group hover:shadow-xl transition-all"
                variants={fadeIn}
              >
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                  <FiImage className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
                  Image Canvas
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Design stunning visual avatars with our AI-powered image generation and editing tools.
                </p>
                <ul className="space-y-2 text-slate-500 dark:text-slate-400">
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span> Style customization
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span> Photo-realistic rendering
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span> Animated avatars
                  </li>
                </ul>
              </motion.div>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {/* Role Play */}
              <motion.div 
                className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 group hover:shadow-xl transition-all"
                variants={fadeIn}
              >
                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                  <FiUsers className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
                  Advanced Roleplay
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Create interactive scenarios with AI avatars for entertainment, training, or therapeutic purposes.
                </p>
                <ul className="space-y-2 text-slate-500 dark:text-slate-400">
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span> Character immersion
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span> Scenario building
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span> Multi-character interactions
                  </li>
                </ul>
              </motion.div>

              {/* Code Assistant */}
              <motion.div 
                className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 group hover:shadow-xl transition-all"
                variants={fadeIn}
              >
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                  <FiCode className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
                  Code Assistant
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Get help with programming from specialized AI avatars trained on coding best practices and documentation.
                </p>
                <ul className="space-y-2 text-slate-500 dark:text-slate-400">
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span> Multi-language support
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span> Debugging assistance
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span> Code optimization
                  </li>
                </ul>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Avatar Marketplace/Community */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Avatar <span className="text-indigo-600 dark:text-indigo-400">Marketplace</span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Share, discover, and interact with AI avatars created by our growing community
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {staticAvatars.map((avatar) => (
                <motion.div 
                  key={avatar.id}
                  variants={fadeIn}
                  className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all group"
                >
                  <div className="aspect-square bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                    <Image 
                      src={avatar.imagePath} 
                      alt={avatar.name}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Add a subtle overlay for better text readability */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate">
                      {avatar.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
                      Created by {avatar.creator}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <div className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded">
                        {avatar.category}
                      </div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        ⭐ {avatar.rating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="mt-12 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href="/marketplace">
                <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white">
                  Explore Marketplace
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Pay As You <span className="text-indigo-600 dark:text-indigo-400">Grow</span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Only pay for what you use with our flexible usage-based pricing
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {/* Starter */}
              <motion.div 
                className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700"
                variants={fadeIn}
              >
                <div className="text-indigo-600 dark:text-indigo-400 font-medium mb-2">Starter</div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  Free <span className="text-slate-500 dark:text-slate-400 text-lg font-normal">/ start</span>
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Perfect for trying out our AI avatars and basic features.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-slate-700 dark:text-slate-300">
                    <span className="mr-2 text-green-500">✓</span> 100 message credits
                  </li>
                  <li className="flex items-center text-slate-700 dark:text-slate-300">
                    <span className="mr-2 text-green-500">✓</span> 5 basic avatars
                  </li>
                  <li className="flex items-center text-slate-700 dark:text-slate-300">
                    <span className="mr-2 text-green-500">✓</span> Text-based chat
                  </li>
                </ul>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white">
                  Get Started
                </Button>
              </motion.div>

              {/* Pro */}
              <motion.div 
                className="bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 p-8 rounded-xl shadow-xl border border-indigo-500 dark:border-indigo-600 relative"
                variants={fadeIn}
              >
                <div className="absolute -top-4 right-4 bg-yellow-500 text-white text-sm px-3 py-1 rounded-full">
                  Most Popular
                </div>
                <div className="text-white font-medium mb-2">Pro</div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  $0.01 <span className="text-white/80 text-lg font-normal">/ credit</span>
                </h3>
                <p className="text-white/90 mb-6">
                  Pay as you go for AI interactions with premium features.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-white">
                    <span className="mr-2 text-yellow-300">✓</span> Unlimited avatars
                  </li>
                  <li className="flex items-center text-white">
                    <span className="mr-2 text-yellow-300">✓</span> Voice cloning
                  </li>
                  <li className="flex items-center text-white">
                    <span className="mr-2 text-yellow-300">✓</span> Image generation
                  </li>
                  <li className="flex items-center text-white">
                    <span className="mr-2 text-yellow-300">✓</span> Advanced roleplay
                  </li>
                </ul>
                <Button className="w-full bg-white hover:bg-white/90 text-indigo-600">
                  Choose Pro
                </Button>
              </motion.div>

              {/* Enterprise */}
              <motion.div 
                className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700"
                variants={fadeIn}
              >
                <div className="text-indigo-600 dark:text-indigo-400 font-medium mb-2">Enterprise</div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  Custom <span className="text-slate-500 dark:text-slate-400 text-lg font-normal">/ plan</span>
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Tailored solutions for businesses with custom requirements.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-slate-700 dark:text-slate-300">
                    <span className="mr-2 text-green-500">✓</span> Custom avatar development
                  </li>
                  <li className="flex items-center text-slate-700 dark:text-slate-300">
                    <span className="mr-2 text-green-500">✓</span> Private avatar marketplace
                  </li>
                  <li className="flex items-center text-slate-700 dark:text-slate-300">
                    <span className="mr-2 text-green-500">✓</span> API access
                  </li>
                  <li className="flex items-center text-slate-700 dark:text-slate-300">
                    <span className="mr-2 text-green-500">✓</span> Volume discounts
                  </li>
                </ul>
                <Button variant="outline" className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950">
                  Contact Sales
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(120,119,198,0.3),transparent)] dark:bg-[radial-gradient(circle_at_70%_50%,rgba(120,119,198,0.15),transparent)]"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Start Building Your AI Companions Today
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
                Join thousands of users creating and sharing AI avatars on our platform
              </p>
              {!loading &&
                (user ? (
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white text-lg px-8"
                    >
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white text-lg px-8"
                    >
                      Create Free Account
                    </Button>
                  </Link>
                ))}
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <Image
                  src="/images/logo.svg"
                  alt="Chimera Logo"
                  width={32}
                  height={32}
                  className="dark:invert"
                />
                <span className="ml-2 font-bold text-slate-800 dark:text-slate-200">
                  <span className="text-indigo-600 dark:text-indigo-400">Chimera</span>
                </span>
              </div>
              <div className="flex flex-wrap justify-center space-x-6">
                <a
                  href="#"
                  className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  About
                </a>
                <a
                  href="#"
                  className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Features
                </a>
                <a
                  href="#"
                  className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Pricing
                </a>
                <a
                  href="#"
                  className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Blog
                </a>
                <a
                  href="#"
                  className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Privacy
                </a>
                <a
                  href="#"
                  className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Terms
                </a>
              </div>
            </div>
            <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              &copy; {new Date().getFullYear()} Chimera. All rights
              reserved.
            </div>
          </div>
        </footer>
      </ScrollArea>
    </div>
  );
}
