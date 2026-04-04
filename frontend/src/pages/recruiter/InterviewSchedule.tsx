import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Calendar
} from 'lucide-react';
import api from '../../api';
import ListSkeleton from '../../components/skeletons/ListSkeleton';

const InterviewSchedule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/applications/interviews');
      setInterviews(res.data.data);
    } catch (err) {
      console.error('Error fetching interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  // getStatusBadge removed as unused
  const filteredInterviews = interviews.filter(inv => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Scheduled') return inv.status === 'shortlisted';
    if (activeTab === 'Selected') return inv.status === 'accepted';
    if (activeTab === 'Rejected') return inv.status === 'rejected';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Interview Schedule</h1>
          <p className="text-gray-500 text-[14px] mt-2">Coordinate screenings and manage your timeline.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button 
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
            >
              List
            </button>
            <button 
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
        {['All', 'Scheduled', 'Selected', 'Rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Interview Table */}
      <div className="bg-white border border-gray-200 rounded-[24px] shadow-sm overflow-hidden text-[13px]">
        {loading ? (
          <ListSkeleton hideHeader={true} rows={6} />
        ) : viewMode === 'list' ? (
          <div className="overflow-x-auto">
            {/* ... table content remains same as before ... */}
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidate Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Role</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Date & Time</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Mode</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredInterviews.map((interview) => (
                  <tr key={interview._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-gray-200 p-0.5 overflow-hidden flex-shrink-0">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${interview.student?.name}`} alt="" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <span className="font-black text-gray-900 tracking-tight text-[14px]">{interview.student?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-gray-600 font-bold">
                        <Briefcase size={14} className="text-gray-300" />
                        {interview.job?.title}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="font-black text-gray-900">{new Date(interview.interviewDate).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {interview.interviewLink ? (
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black tracking-widest uppercase">Online</span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black tracking-widest uppercase">Offline</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => {
                          const date = new Date(interview.interviewDate);
                          const end = new Date(date.getTime() + 60 * 60 * 1000);
                          const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Interview with ${interview.student?.name}\nDTSTART:${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nDTEND:${end.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nDESCRIPTION:Job: ${interview.job?.title}\nEND:VEVENT\nEND:VCALENDAR`;
                          const blob = new Blob([ics], { type: 'text/calendar' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `interview_${interview._id}.ics`;
                          a.click();
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Add to Calendar"
                      >
                         <Calendar size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-3xl overflow-hidden border border-gray-100 shadow-inner">
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                 <div key={day} className="bg-gray-50/50 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{day}</div>
               ))}
               {Array.from({ length: 35 }).map((_, i) => {
                 const day = i - 2; // Simulation for current month
                 const dayInterviews = filteredInterviews.filter(inv => new Date(inv.interviewDate).getDate() === day);
                 return (
                   <div key={i} className="bg-white min-h-[120px] p-4 group hover:bg-gray-50/30 transition-all border border-gray-50/50">
                      <span className={`text-xs font-black ${day === new Date().getDate() ? 'text-blue-600 bg-blue-50 px-2 py-1 rounded-lg' : 'text-gray-300'}`}>
                        {day > 0 && day <= 30 ? day : ''}
                      </span>
                      <div className="mt-2 space-y-1">
                        {dayInterviews.map((inv, idx) => (
                          <div key={idx} className="p-2 bg-blue-950 text-white rounded-lg text-[9px] font-bold leading-tight shadow-sm animate-in fade-in slide-in-from-left-2 transition-transform hover:scale-105 cursor-pointer">
                            {new Date(inv.interviewDate).getHours()}:{new Date(inv.interviewDate).getMinutes() === 0 ? '00' : '30'} - {inv.student?.name.split(' ')[0]}
                          </div>
                        ))}
                      </div>
                   </div>
                 );
               })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default InterviewSchedule;
