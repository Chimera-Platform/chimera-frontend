import Link from "next/link";
import { FiGrid, FiImage, FiMessageSquare, FiShoppingBag } from "react-icons/fi";

export function QuickActions() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/canvas"
          className="flex flex-col items-center justify-center p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
        >
          <FiGrid className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-2" />
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Canvas
          </span>
        </Link>
        <Link
          href="/gallery"
          className="flex flex-col items-center justify-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
        >
          <FiImage className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Gallery
          </span>
        </Link>
        <Link
          href="/chat"
          className="flex flex-col items-center justify-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
        >
          <FiMessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Chat
          </span>
        </Link>
        <Link
          href="/marketplace"
          className="flex flex-col items-center justify-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        >
          <FiShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Marketplace
          </span>
        </Link>
      </div>
    </div>
  );
}
