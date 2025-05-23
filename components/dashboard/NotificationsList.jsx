import { Button } from "@/components/ui/button";
import { FiX } from "react-icons/fi";

export function NotificationsList({ notifications = [], onReadNotification, onMarkAllAsRead }) {
  const unreadCount = notifications.filter(n => n.unread).length;
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Notifications
        </h2>
        {unreadCount > 0 && (
          <Button
            variant="link"
            onClick={onMarkAllAsRead}
            className="text-xs text-indigo-600 dark:text-indigo-400"
          >
            Mark all as read
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg transition-colors ${notification.unread
                  ? "bg-indigo-50 dark:bg-indigo-900/20"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
            >
              <div className="flex justify-between">
                <p
                  className={`text-sm ${notification.unread
                      ? "font-medium text-slate-800 dark:text-slate-200"
                      : "text-slate-600 dark:text-slate-300"
                    }`}
                >
                  {notification.text}
                </p>
                {notification.unread && (
                  <Button
                    variant="ghost"
                    className="h-5 w-5 p-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    onClick={() => onReadNotification(notification.id)}
                  >
                    <FiX className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {notification.time}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
            No new notifications
          </p>
        )}
      </div>
    </div>
  );
}
