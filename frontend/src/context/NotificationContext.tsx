import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type NotificationType = 'error' | 'success' | 'warning';

interface NotificationContextType {
  showError: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  hideNotification: () => void;
  notification: {
    isOpen: boolean;
    message: string;
    type: NotificationType;
    title: string;
  };
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    message: string;
    type: NotificationType;
    title: string;
  }>({
    isOpen: false,
    message: '',
    type: 'error',
    title: '',
  });

  const showError = (message: string, title: string = 'Error Occurred') => {
    setNotification({ isOpen: true, message, type: 'error', title });
  };

  const showSuccess = (message: string, title: string = 'Success') => {
    setNotification({ isOpen: true, message, type: 'success', title });
  };

  const showWarning = (message: string, title: string = 'Warning') => {
    setNotification({ isOpen: true, message, type: 'warning', title });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  // Prevent scrolling when notification is open
  useEffect(() => {
    if (notification.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [notification.isOpen]);

  return (
    <NotificationContext.Provider value={{ showError, showSuccess, showWarning, hideNotification, notification }}>
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
