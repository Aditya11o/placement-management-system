import React from 'react';
import { X, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const NotificationModal: React.FC = () => {
  const { notification, hideNotification } = useNotification();

  if (!notification.isOpen) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'error': return <AlertCircle className="w-12 h-12 text-red-500" />;
      case 'success': return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-12 h-12 text-amber-500" />;
    }
  };

  const getTheme = () => {
    switch (notification.type) {
      case 'error': return 'border-red-100 bg-red-50/30';
      case 'success': return 'border-green-100 bg-green-50/30';
      case 'warning': return 'border-amber-100 bg-amber-50/30';
    }
  };

  const getButtonTheme = () => {
    switch (notification.type) {
      case 'error': return 'bg-red-600 hover:bg-red-700 shadow-red-200';
      case 'success': return 'bg-green-600 hover:bg-green-700 shadow-green-200';
      case 'warning': return 'bg-amber-600 hover:bg-amber-700 shadow-amber-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0B1E3F]/60 backdrop-blur-md"
        onClick={hideNotification}
      ></div>

      {/* Modal Card */}
      <div className={`relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border ${getTheme()} p-8 animate-in zoom-in-95 duration-300`}>
        {/* Close Button UI */}
        <button 
          onClick={hideNotification}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon Section */}
          <div className="mb-2 p-4 rounded-full bg-white shadow-lg">
            {getIcon()}
          </div>

          {/* Text Section */}
          <div className="space-y-2">
            <h2 className="text-xl font-display font-bold text-gray-900 tracking-tight">
              {notification.title}
            </h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              {notification.message}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={hideNotification}
            className={`w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-300 shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${getButtonTheme()}`}
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
