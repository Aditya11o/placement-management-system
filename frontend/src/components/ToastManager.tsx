import React, { useEffect, useContext, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { Bell } from 'lucide-react';
import type { ToastMessage } from '../types';

const ToastManager: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    if (!user) return;

    // Connect to Socket — auth handled via httpOnly cookies
    const socket = io(import.meta.env.VITE_BASE_URL || 'http://localhost:5000', {
      withCredentials: true,
    });
    // Server auto-joins user to their private room via verified token

    // Listeners
    socket.on('notification', (msg) => {
      addToast(msg.title || 'New Notification', msg.message);
    });

    socket.on('new_job', (job) => {
      addToast('New Job Alert', `${job.companyName} is hiring for ${job.title}!`);
    });

    socket.on('broadcast', (data) => {
      addToast('Admin Broadcast', data.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const addToast = (title: string, message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message }]);
    
    // Auto remove
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="relative glass-panel bg-white/90 p-4 rounded-lg shadow-xl border border-[var(--surface-container)] w-80 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[var(--tertiary-fixed)] text-[var(--primary)] rounded-full">
              <Bell size={18} />
            </div>
            <div>
              <h4 className="font-bold text-[var(--on-surface)]">{toast.title}</h4>
              <p className="text-sm text-[var(--on-surface-variant)] mt-1">{toast.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastManager;
