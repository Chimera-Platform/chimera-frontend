"use client";

import { createContext, useContext, useState, useEffect } from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New message from User1", time: "5m ago", unread: true },
    { id: 2, text: "Your avatar was liked by User2", time: "1h ago", unread: true },
    { id: 3, text: "New items available in marketplace", time: "3h ago", unread: false },
  ]);
  
  // Bu fonksiyon, belirli bir bildirimi okundu olarak işaretler
  const handleNotificationRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  // Bu fonksiyon, tüm bildirimleri okundu olarak işaretler
  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, unread: false }))
    );
  };

  // Bu fonksiyon, yeni bir bildirim ekler
  const addNotification = (notification) => {
    setNotifications([notification, ...notifications]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        handleNotificationRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
