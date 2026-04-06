import React from 'react';
import { CheckCircle2, Clock, Calendar, Trophy, AlertCircle, FileText, Star } from 'lucide-react';

interface HistoryItem {
  status: string;
  date: string;
  comment?: string;
}

interface TimelineProps {
  history: HistoryItem[];
}

const Timeline: React.FC<TimelineProps> = ({ history }) => {
  const getIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('applied')) return <FileText size={16} />;
    if (s.includes('review')) return <Clock size={16} />;
    if (s.includes('shortlisted')) return <Trophy size={16} />;
    if (s.includes('interview')) return <Calendar size={16} />;
    if (s.includes('selected') || s.includes('offer')) return <Star size={16} />;
    if (s.includes('rejected')) return <AlertCircle size={16} />;
    return <CheckCircle2 size={16} />;
  };

  const getColor = (status: string, isLast: boolean) => {
    const s = status.toLowerCase();
    if (s.includes('rejected')) return 'text-rose-500 bg-rose-50 border-rose-200';
    if (s.includes('selected') || s.includes('accepted')) return 'text-emerald-500 bg-emerald-50 border-emerald-200';
    if (isLast) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-gray-400 bg-gray-50 border-gray-100';
  };

  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <Clock size={32} className="text-gray-300 mb-3" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">Awaiting first milestone...</p>
      </div>
    );
  }

  // Reverse history so latest is at the top
  const sortedHistory = [...history].reverse();

  return (
    <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-blue-600/50 before:via-gray-100 before:to-gray-50">
      {sortedHistory.map((item, idx) => {
        const isLatest = idx === 0;
        return (
          <div key={idx} className="relative">
            {/* Timeline Dot */}
            <div className={`absolute -left-[30px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-all ${getColor(item.status, isLatest)} ${isLatest ? 'scale-125 shadow-lg shadow-blue-900/10' : ''}`}>
              {getIcon(item.status)}
            </div>

            {/* Content */}
            <div className={`p-4 rounded-2xl border transition-all ${isLatest ? 'bg-white border-blue-100 shadow-sm' : 'bg-gray-50/50 border-transparent opacity-60'}`}>
              <div className="flex justify-between items-start mb-1">
                <h4 className={`text-[11px] font-black uppercase tracking-widest italic ${isLatest ? 'text-blue-900' : 'text-gray-500'}`}>
                   {item.status}
                </h4>
                <span className="text-[9px] font-bold text-gray-400 uppercase">
                  {new Date(item.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <p className={`text-xs font-medium leading-relaxed ${isLatest ? 'text-gray-700' : 'text-gray-400 italic'}`}>
                {item.comment}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
