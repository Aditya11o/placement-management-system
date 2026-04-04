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
    { label: 'Applied', val: stats?.applied.toString() || '0', color: 'bg-gradient-to-br from-blue-500 to-blue-600', icon: Send },
    { label: 'Under Review', val: stats?.underReview.toString() || '0', color: 'bg-gradient-to-br from-orange-400 to-orange-500', icon: Clock },
    { label: 'Shortlisted', val: stats?.shortlisted.toString() || '0', color: 'bg-gradient-to-br from-purple-500 to-purple-600', icon: UserCheck },
    { label: 'Selected', val: stats?.selected.toString() || '0', color: 'bg-gradient-to-br from-green-500 to-green-600', icon: Trophy },
    { label: 'Rejected', val: stats?.rejected.toString() || '0', color: 'bg-gradient-to-br from-red-500 to-red-600', icon: XCircle }
  ];

  return (
    <div className="bg-surface-container-low p-5 rounded-xl shadow-ambient border border-outline-variant w-full hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-on-surface mb-4">Application Status Pipeline</h3>
      <div className="flex flex-wrap items-center justify-between gap-2 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <div className={`${step.color} text-white p-4 rounded-xl flex-1 min-w-[120px] shadow-sm flex flex-col items-center justify-center transition-all hover:scale-105 duration-300 relative group`}>
              <step.icon size={16} className="absolute top-3 right-3 opacity-20 group-hover:opacity-40 transition-opacity" />
              <span className="text-2xl font-bold tracking-tight">{step.val}</span>
              <span className="text-[10px] uppercase font-semibold mt-1 opacity-90 tracking-wide">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className="text-on-surface-variant/30 flex-shrink-0" size={20} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Pipeline;
