import { Progress } from "@/components/ui/progress";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";

export function StatsCards({ stats = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">
                {stat.value}
              </h3>
            </div>
            <span
              className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stat.increase
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}
            >
              {stat.increase ? (
                <FiArrowUp className="w-3 h-3 mr-1" />
              ) : (
                <FiArrowDown className="w-3 h-3 mr-1" />
              )}
              {stat.change}%
            </span>
          </div>
          <div className="mt-2">
            <Progress
              value={stat.increase ? 65 : 40}
              className="h-1.5"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
