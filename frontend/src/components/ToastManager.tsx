import React, { useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const ToastManager: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { showSuccess, showWarning, showError } = useNotification();

  useEffect(() => {
    if (!user) return;

    // Connect to Socket — auth handled via httpOnly cookies
    const socket = io(import.meta.env.VITE_BASE_URL || 'http://localhost:5000', {
      withCredentials: true,
    });

    // Listeners
    socket.on('notification', (msg) => {
      showSuccess(msg.message, msg.title || 'Notification');
    });

    socket.on('new_job', (job) => {
      showSuccess(`${job.companyName} is hiring for ${job.title}!`, 'New Job Alert');
    });

    socket.on('broadcast', (data) => {
      showWarning(data.message, 'Admin Broadcast');
    });

    socket.on('error', (err) => {
      showError(err.message || 'A socket error occurred');
    });

    return () => {
      socket.disconnect();
    };
  }, [user, showSuccess, showWarning, showError]);

  // This component now acts as a headless listener
  return null;
};

export default ToastManager;
