import React from 'react';
import { ChevronRight, Send, Clock, UserCheck, Trophy, XCircle } from 'lucide-react';

interface PipelineProps {
  stats?: {
    applied: number;
    underReview: number;
    shortlisted: number;
    selected: number;
    rejected: number;
  };
}

const Pipeline: React.FC<PipelineProps> = ({ stats }) => {
  const steps = [
    { label: 'Applied', val: stats?.applied.toString() || '0', color: 'bg-primary text-on-primary', icon: Send },
    { label: 'Review', val: stats?.underReview.toString() || '0', color: 'bg-secondary-container text-on-surface dark:text-white', icon: Clock },
    { label: 'Shortlist', val: stats?.shortlisted.toString() || '0', color: 'bg-tertiary-fixed text-on-surface dark:text-white', icon: UserCheck },
    { label: 'Selected', val: stats?.selected.toString() || '0', color: 'bg-emerald-500 text-white', icon: Trophy },
    { label: 'Rejected', val: stats?.rejected.toString() || '0', color: 'bg-error-container text-on-surface dark:text-white', icon: XCircle }
  ];

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-surface-tint/5 to-primary/5 rounded-bl-full -z-10 opacity-70"></div>
      <h3 className="text-sm font-black text-on-surface uppercase tracking-tight mb-6 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-surface-tint"></div>
        Application Status Pipeline
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {steps.map((step, i) => (
          <div key={i} className={`${step.color} p-4 rounded-xl shadow-sm flex flex-col items-center justify-center transition-all hover:scale-105 duration-300 relative group min-w-0 overflow-hidden`}>
            <step.icon size={14} className="absolute top-2 right-2 opacity-20 group-hover:opacity-40 transition-opacity" />
            <span className="text-xl md:text-2xl font-black italic tracking-tighter truncate w-full text-center leading-none">{step.val}</span>
            <span className="text-[9px] uppercase font-black mt-2 opacity-90 tracking-widest truncate w-full text-center">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pipeline;
