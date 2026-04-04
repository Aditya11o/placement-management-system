import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  badge?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, badge }) => {
  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl shadow-ambient border border-outline-variant hover:shadow-lg transition-all duration-300 relative group overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10 transition-transform group-hover:scale-110`}>
          <Icon size={20} />
        </div>
        {badge && (
          <div className={`w-2 h-2 rounded-full ${color.split(' ')[1].replace('text-', 'bg-')} shadow-sm`}></div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-on-surface-variant uppercase tracking-tight">{label}</p>
        <p className="text-2xl font-bold text-on-surface mt-0.5">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
