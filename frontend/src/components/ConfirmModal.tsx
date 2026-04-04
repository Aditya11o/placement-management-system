import React, { useRef } from 'react';
import { X, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: React.ElementType;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  icon: CustomIcon
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(isOpen, modalRef);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: CustomIcon || Trash2,
          iconBg: 'bg-rose-50 text-rose-500',
          accent: 'bg-rose-500',
          confirmBtn: 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
        };
      case 'info':
        return {
          icon: CustomIcon || Info,
          iconBg: 'bg-blue-50 text-blue-500',
          accent: 'bg-blue-500',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
        };
      default:
        return {
          icon: CustomIcon || AlertTriangle,
          iconBg: 'bg-orange-50 text-orange-500',
          accent: 'bg-orange-500',
          confirmBtn: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
        };
    }
  };

  const styles = getTypeStyles();
  const Icon = styles.icon;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Top Accent Strip */}
        <div className={`h-1.5 w-full ${styles.accent}`} />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center text-center">
            {/* Icon Circle */}
            <div className={`w-16 h-16 ${styles.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-inner`}>
              <Icon size={32} strokeWidth={2.5} aria-hidden="true" />
            </div>

            {/* Content */}
            <h2 id="confirm-title" className="text-xl font-black text-gray-900 tracking-tight mb-2">
              {title}
            </h2>
            <p id="confirm-description" className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
              {message}
            </p>

            {/* Actions */}
            <div className="flex w-full gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-50 text-gray-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-200"
              >
                {cancelText}
              </button>
              <button 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 py-3 px-4 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${styles.confirmBtn}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
