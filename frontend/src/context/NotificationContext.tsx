import React, { createContext, useState, useContext, ReactNode } from 'react';

export type NotificationType = 'error' | 'success' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: NotificationType;
  title: string;
}

interface NotificationContextType {
  showError: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
  toasts: ToastItem[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: NotificationType, title: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const showError = (message: string, title: string = 'Error') => {
    addToast(message, 'error', title);
  };

  const showSuccess = (message: string, title: string = 'Success') => {
    addToast(message, 'success', title);
  };

  const showWarning = (message: string, title: string = 'Warning') => {
    addToast(message, 'warning', title);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showError, showSuccess, showWarning, removeToast, toasts }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
