import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import {
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiUser,
  FiGrid,
  FiLogOut,
  FiMessageSquare,
  FiShoppingBag,
  FiPenTool,
  FiImage,
} from "react-icons/fi";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebase";

export function NavigationMenu({ activePage = "dashboard" }) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsOpen(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Navigation items
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: FiGrid, href: "/dashboard" },
    { id: "profile", label: "Profile", icon: FiUser, href: "/profile" },
    { id: "chat", label: "Chat", icon: FiMessageSquare, href: "/chat" },
    { id: "marketplace", label: "Marketplace", icon: FiShoppingBag, href: "/marketplace" },
    { id: "create-avatar", label: "Create Avatar", icon: FiPenTool, href: "/create-avatar" },
    { id: "canvas", label: "Canvas", icon: FiGrid, href: "/canvas" },
    { id: "gallery", label: "Gallery", icon: FiImage, href: "/gallery" },
    { id: "characters", label: "Characters", icon: FiUser, href: "/characters" },
  ];

  return (
    <div className="block lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <FiMenu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[80vw] sm:w-[350px] p-0">
          <div className="flex flex-col h-full bg-white dark:bg-slate-950">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <FiX className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-auto py-2">
              <nav className="px-2">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          className={`flex items-center p-3 rounded-lg ${
                            activePage === item.id
                              ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400" 
                              : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* Footer with theme toggle and logout */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="ghost"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="w-full flex items-center justify-start p-3 mb-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
              >
                {isDark ? (
                  <>
                    <FiSun className="w-5 h-5 mr-3" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <FiMoon className="w-5 h-5 mr-3" />
                    Dark Mode
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full flex items-center justify-center"
              >
                <FiLogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
