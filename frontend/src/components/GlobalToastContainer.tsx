import React from 'react';
import { useNotification, ToastItem } from '../context/NotificationContext';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info, Bell } from 'lucide-react';

const GlobalToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-4 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

interface ToastProps {
  toast: ToastItem;
  onRemove: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTheme = () => {
    switch (toast.type) {
      case 'error': return 'border-red-500/20 bg-red-50/90 dark:bg-red-900/20';
      case 'success': return 'border-green-500/20 bg-green-50/90 dark:bg-green-900/20';
      case 'warning': return 'border-amber-500/20 bg-amber-50/90 dark:bg-amber-900/20';
      default: return 'border-blue-500/20 bg-blue-50/90 dark:bg-blue-900/20';
    }
  };

  return (
    <div 
      className={`pointer-events-auto flex items-start gap-4 p-4 rounded-2xl border backdrop-blur-md shadow-2xl animate-fade-in animate-slide-in-right ${getTheme()}`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
          {toast.title}
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 font-medium leading-relaxed">
          {toast.message}
        </p>
      </div>
      <button 
        onClick={onRemove}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
      >
        <X className="w-4 h-4" />
      </button>
      
      {/* Progress Bar Timer */}
      <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 w-full rounded-b-2xl overflow-hidden">
        <div className="h-full bg-current animate-shrink-width duration-[5000ms] ease-linear" />
      </div>
    </div>
  );
};

export default GlobalToastContainer;
