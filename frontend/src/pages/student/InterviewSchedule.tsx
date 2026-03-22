import React, { useState, useEffect } from 'react';
import { 
  Calendar, List, CheckCircle, XCircle, 
  Clock, Video, ChevronLeft, 
  ChevronRight, Download, Plus, Trophy, 
  HelpCircle, ChevronDown,
  MapPin, Building2, Loader2
} from 'lucide-react';
import api from '../../api';

const InterviewSchedule: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState('All Rounds');
  const [stats, setStats] = useState([
    { label: 'Total Interviews', value: '00', icon: List, color: 'text-gray-600', border: 'border-l-gray-400' },
    { label: 'Upcoming', value: '00', icon: Calendar, color: 'text-blue-600', border: 'border-l-blue-500' },
    { label: 'Completed', value: '00', icon: CheckCircle, color: 'text-emerald-600', border: 'border-l-emerald-500' },
    { label: 'Missed', value: '00', icon: XCircle, color: 'text-rose-600', border: 'border-l-rose-500' },
  ]);

  const fetchInterviews = async () => {
    try {
      const { data } = await api.get('/applications/interviews');
      setInterviews(data);
      
      const now = new Date();
      const upcoming = data.filter((i: any) => new Date(i.interviewDate) > now).length;
      const completed = data.filter((i: any) => new Date(i.interviewDate) <= now).length;
      const total = data.length;

      setStats([
        { label: 'Total Interviews', value: total.toString().padStart(2, '0'), icon: List, color: 'text-gray-600', border: 'border-l-gray-400' },
        { label: 'Upcoming', value: upcoming.toString().padStart(2, '0'), icon: Calendar, color: 'text-blue-600', border: 'border-l-blue-500' },
        { label: 'Completed', value: completed.toString().padStart(2, '0'), icon: CheckCircle, color: 'text-emerald-600', border: 'border-l-emerald-500' },
        { label: 'Missed', value: '00', icon: XCircle, color: 'text-rose-600', border: 'border-l-rose-500' },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">
            <div className="w-8 h-px bg-blue-600" />
            <span>Success Roadmap</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none uppercase">Interview <span className="text-blue-600">Schedule</span></h1>
          <p className="text-gray-500 text-[14px] mt-3 font-medium">Keep track of your interview pipeline and upcoming screenings.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3.5 bg-gray-100 text-gray-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center gap-2 active:scale-95">
            <Download size={16} strokeWidth={3} />
            Export Calendar
          </button>
          <button className="px-6 py-3.5 bg-[#000613] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center gap-2 active:scale-95">
            <Plus size={16} strokeWidth={3} />
            Add Reminder
          </button>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-[28px] border-l-[6px] ${stat.border} shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-gray-50 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} strokeWidth={2.5} />
              </div>
              <span className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</span>
            </div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Side - Interview Table */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-black text-gray-900 tracking-tight capitalize">Upcoming & Recent</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Filter by:</span>
              <div className="relative">
                <select 
                  value={selectedRound}
                  onChange={(e) => setSelectedRound(e.target.value)}
                  className="pl-3 pr-8 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-600 outline-none hover:border-gray-300 transition-all appearance-none cursor-pointer"
                >
                  <option>All Rounds</option>
                  <option>Technical</option>
                  <option>HR</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Company & Role</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Date & Time</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Round</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Mode</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {interviews.map((interview, i) => {
                  const date = new Date(interview.interviewDate);
                  const isUpcoming = date > new Date();
                  
                  return (
                    <tr key={i} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="py-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 border border-gray-100 rounded-lg p-1 bg-white shadow-sm flex items-center justify-center shrink-0">
                            <Building2 className="text-gray-400" size={20} />
                          </div>
                          <div>
                            <h4 className="text-[13px] font-black text-gray-900 leading-tight tracking-tight uppercase">{interview.job?.companyName}</h4>
                            <h4 className="text-[13px] font-bold text-gray-500 leading-tight tracking-tight uppercase">{interview.job?.title}</h4>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 pr-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-gray-900 leading-tight uppercase tracking-widest">
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 mt-0.5">
                            {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="py-6 pr-4">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest bg-gray-100/50 px-2 py-1 rounded">
                          TECHNICAL
                        </span>
                      </td>
                      <td className="py-6 pr-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 text-gray-800 mb-0.5">
                            {interview.interviewLink ? <Video size={12} className="text-gray-400" /> : <MapPin size={12} className="text-gray-400" />}
                            <span className="text-[11px] font-black tracking-widest uppercase">{interview.interviewLink ? 'Online' : 'Offline'}</span>
                          </div>
                          {interview.interviewLink ? (
                            <a href={interview.interviewLink} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline decoration-2 transition-all">Join Link</a>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400">{interview.job?.location || 'On Campus'}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-6 text-center">
                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full italic border
                          ${isUpcoming ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                          {isUpcoming ? 'UPCOMING' : 'COMPLETED'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {interviews.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-gray-400 italic text-sm">
                      No interviews scheduled yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <button className="mt-auto pt-6 border-t border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-black transition-all flex items-center justify-center gap-2 italic">
            <span>View All Interview History</span>
          </button>
        </div>

        {/* Right Side - Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Calendar Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-gray-900 tracking-tight">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <button className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors"><ChevronLeft size={16} /></button>
                <button className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors"><ChevronRight size={16} /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-y-4 text-center mb-2">
              {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(day => (
                <span key={day} className="text-[10px] font-black text-gray-400 tracking-widest">{day}</span>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-y-2 text-center">
              {[...Array(31)].map((_, i) => {
                const day = i + 1;
                const today = new Date();
                const year = today.getFullYear();
                const month = today.getMonth() + 1;
                const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const hasInterview = interviews.some(inv => inv.interviewDate && inv.interviewDate.includes(dateStr));
                const isToday = day === today.getDate() && month === today.getMonth() + 1;
                
                return (
                  <div key={i} className="relative py-1.5 flex flex-col items-center">
                    <span className={`text-xs font-bold leading-none ${isToday ? 'w-8 h-8 flex items-center justify-center bg-gray-900 text-white rounded-lg shadow-lg' : 'text-gray-600'}`}>
                      {day}
                    </span>
                    {hasInterview && !isToday && (
                      <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Focus Card */}
          {interviews.filter(inv => new Date(inv.interviewDate) > new Date()).length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5">Next Interview</h3>
              <div className="border-l-[3px] border-gray-900 pl-4 py-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 block italic">Upcoming</span>
                <h4 className="text-sm font-black text-gray-900 leading-tight tracking-tight uppercase">
                  {interviews.find(inv => new Date(inv.interviewDate) > new Date())?.job?.title} @ {interviews.find(inv => new Date(inv.interviewDate) > new Date())?.job?.companyName}
                </h4>
                <div className="flex items-center gap-2 mt-3 text-gray-400">
                  <Clock size={12} />
                  <span className="text-[10px] font-bold italic">
                    {new Date(interviews.find(inv => new Date(inv.interviewDate) > new Date())?.interviewDate).toLocaleString()}
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
              <button className="w-full mt-6 py-2.5 bg-white text-blue-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 shadow-lg shadow-black/10">
                Go to Resources
              </button>
            </div>
            <Trophy className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 rotate-12 transition-transform group-hover:rotate-0" />
          </div>

        </div>

      </div>

    </div>
  );
};

export default InterviewSchedule;
