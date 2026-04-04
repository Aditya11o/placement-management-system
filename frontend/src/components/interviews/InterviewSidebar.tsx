import React from 'react';
import { ChevronLeft, ChevronRight, Clock, Trophy, HelpCircle } from 'lucide-react';

interface InterviewSidebarProps {
  interviews: any[];
  viewDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const InterviewSidebar: React.FC<InterviewSidebarProps> = ({ interviews, viewDate, onPrevMonth, onNextMonth }) => {
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const nextInterview = interviews.find(inv => new Date(inv.interviewDate) > new Date());

  return (
    <div className="col-span-12 lg:col-span-4 space-y-6">
      
      {/* Calendar Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black text-gray-900 tracking-tight">
            {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={onPrevMonth}
              className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={onNextMonth}
              className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-y-4 text-center mb-2">
          {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(day => (
            <span key={day} className="text-[10px] font-black text-gray-400 tracking-widest">{day}</span>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-y-2 text-center">
          {(() => {
            const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
            const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
            const startOffset = firstDay === 0 ? 6 : firstDay - 1;
            
            const calendarGrid = [];
            for (let i = 0; i < startOffset; i++) {
              calendarGrid.push(<div key={`empty-${i}`} className="py-1.5" />);
            }
            
            for (let day = 1; day <= daysInMonth; day++) {
              const today = new Date();
              const isToday = day === today.getDate() && viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();
              
              const dateStr = `${viewDate.getFullYear()}-${(viewDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              const hasInterview = interviews.some(inv => inv.interviewDate && inv.interviewDate.includes(dateStr));
              
              calendarGrid.push(
                <div key={day} className="relative py-1.5 flex flex-col items-center">
                  <span className={`text-xs font-bold leading-none ${isToday ? 'w-8 h-8 flex items-center justify-center bg-gray-900 text-white rounded-lg shadow-lg' : 'text-gray-600'}`}>
                    {day}
                  </span>
                  {hasInterview && !isToday && (
                    <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}
                </div>
              );
            }
            return calendarGrid;
          })()}
        </div>
      </div>

      {/* Today's Focus Card */}
      {nextInterview && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5">Next Interview</h3>
          <div className="border-l-[3px] border-gray-900 pl-4 py-1">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 block italic">Upcoming</span>
            <h4 className="text-sm font-black text-gray-900 leading-tight tracking-tight uppercase">
              {nextInterview.job?.title} @ {nextInterview.job?.companyName}
            </h4>
            <div className="flex items-center gap-2 mt-3 text-gray-400">
              <Clock size={12} />
              <span className="text-[10px] font-bold italic">
                {new Date(nextInterview.interviewDate).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Interview Prep Card */}
      <div className="bg-gradient-to-br from-blue-950 to-blue-800 rounded-3xl p-6 relative overflow-hidden group shadow-xl shadow-blue-950/20">
        <div className="relative z-10">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 border border-white/5 transition-transform group-hover:scale-110 drop-shadow-2xl">
            <HelpCircle className="text-white" size={20} />
          </div>
          <h3 className="text-lg font-black text-white tracking-tight uppercase leading-tight">Interview Prep?</h3>
          <p className="text-blue-100/50 text-[11px] font-bold mt-2 leading-relaxed italic pr-4">
            Access our curated library of technical interview questions and mock tests.
          </p>
          <button 
            onClick={() => window.location.href = '/student/mock-interviews'}
            className="w-full mt-6 py-2.5 bg-white text-blue-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 shadow-lg shadow-black/10"
          >
            Go to Resources
          </button>
        </div>
        <Trophy className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 rotate-12 transition-transform group-hover:rotate-0" />
      </div>

    </div>
  );
};

export default InterviewSidebar;
