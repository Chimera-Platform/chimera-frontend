import { Button } from "@/components/ui/button";

export function ActivityList({ activities = [] }) {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
        Recent Activity
      </h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg transition-colors"
          >
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400 mr-3">
              <activity.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {activity.action}
              </p>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {activity.time}
              </span>
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="ghost"
        className="w-full mt-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
      >
        View All Activity
      </Button>
    </div>
  );
}
