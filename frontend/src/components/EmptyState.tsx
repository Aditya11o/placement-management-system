import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in-95 duration-500 ${className}`}>
      {/* Icon with glow effect */}
      <div className="relative group mb-8">
        <div className="absolute inset-0 bg-blue-100 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
        <div className="relative w-20 h-20 bg-white border border-gray-100 rounded-3xl flex items-center justify-center text-gray-400 shadow-xl shadow-black/5 group-hover:scale-110 transition-transform duration-500">
          <Icon size={40} strokeWidth={1.5} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-xs space-y-3">
        <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">
          {title}
        </h3>
        <p className="text-sm font-medium text-gray-400 leading-relaxed italic">
          {description}
        </p>
      </div>

      {/* Optional Action Button */}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-10 px-8 py-3 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2 group/btn"
        >
          {actionText}
          <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
