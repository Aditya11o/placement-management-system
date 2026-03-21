import React, { useState } from 'react';
import { 
  Calendar, List, CheckCircle, XCircle, 
  Clock, Video, ChevronLeft, 
  ChevronRight, Download, Plus, Trophy, 
  HelpCircle, ChevronDown,
  MapPinOff
} from 'lucide-react';

const InterviewSchedule: React.FC = () => {
  const [selectedRound, setSelectedRound] = useState('All Rounds');

  const stats = [
    { label: 'Total Interviews', value: '08', icon: List, color: 'text-gray-600', border: 'border-l-gray-400' },
    { label: 'Upcoming', value: '03', icon: Calendar, color: 'text-blue-600', border: 'border-l-blue-500' },
    { label: 'Completed', value: '04', icon: CheckCircle, color: 'text-emerald-600', border: 'border-l-emerald-500' },
    { label: 'Missed', value: '01', icon: XCircle, color: 'text-rose-600', border: 'border-l-rose-500' },
  ];

  const interviews = [
    {
      company: 'Google',
      role: 'SDE I',
      logo: 'https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png',
      date: 'Oct 28, 2024',
      time: '10:30 AM',
      round: 'TECHNICAL',
      mode: 'Online',
      link: 'Zoom Link',
      status: 'UPCOMING'
    },
    {
      company: 'Microsoft',
      role: 'Product Intern',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
      date: 'Oct 25, 2024',
      time: '02:00 PM',
      round: 'HR ROUND',
      mode: 'Offline',
      location: 'Building 4, HQ',
      status: 'COMPLETED'
    },
    {
      company: 'Adobe',
      role: 'UI/UX Designer',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Adobe_Corporate_Logo.png',
      date: 'Oct 20, 2024',
      time: '11:00 AM',
      round: 'PORTFOLIO REVIEW',
      mode: 'Online',
      link: 'Meet Link',
      status: 'MISSED'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1 block">Academic Authority</span>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Interview Schedule</h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all">
            <Download size={16} />
            <span>Export Calendar</span>
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95">
            <Plus size={16} />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white rounded-xl shadow-sm border border-gray-200 border-l-[6px] ${stat.border} p-5 flex items-center gap-5 hover:shadow-md transition-all`}>
            <div className={`w-12 h-12 bg-gray-50 ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
              <stat.icon size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 leading-none">{stat.value}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">{stat.label}</p>
            </div>
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
                {interviews.map((interview, i) => (
                  <tr key={i} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="py-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border border-gray-100 rounded-lg p-1 bg-white shadow-sm flex items-center justify-center shrink-0">
                          <img src={interview.logo} alt={interview.company} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div>
                          <h4 className="text-[13px] font-black text-gray-900 leading-tight tracking-tight uppercase">{interview.company}</h4>
                          <p className="text-[11px] font-bold text-gray-400 mt-0.5">{interview.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 pr-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-gray-900 leading-tight uppercase tracking-widest">{interview.date.split(',')[0]}</span>
                        <span className="text-[10px] font-bold text-gray-400 mt-0.5">{interview.time}</span>
                      </div>
                    </td>
                    <td className="py-6 pr-4">
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest bg-gray-100/50 px-2 py-1 rounded">
                        {interview.round}
                      </span>
                    </td>
                    <td className="py-6 pr-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-gray-800 mb-0.5">
                          {interview.mode === 'Online' ? <Video size={12} className="text-gray-400" /> : <MapPinOff size={12} className="text-gray-400" />}
                          <span className="text-[11px] font-black tracking-widest uppercase">{interview.mode}</span>
                        </div>
                        {interview.link ? (
                          <a href="#" className="text-[10px] font-bold text-blue-600 hover:underline decoration-2 transition-all">{interview.link}</a>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400">{interview.location}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-6 text-center">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full italic border
                        ${interview.status === 'UPCOMING' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                          interview.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          'bg-rose-50 text-rose-600 border-rose-100'}`}>
                        {interview.status}
                      </span>
                    </td>
                  </tr>
                ))}
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
              <h3 className="text-sm font-black text-gray-900 tracking-tight">October 2024</h3>
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
                const isUpcoming = day === 28;
                const isCompleted = day === 25;
                const isMissed = day === 20;
                
                return (
                  <div key={i} className="relative py-1.5 flex flex-col items-center">
                    <span className={`text-xs font-bold leading-none ${day === 28 ? 'w-8 h-8 flex items-center justify-center bg-gray-900 text-white rounded-lg shadow-lg' : 'text-gray-600'}`}>
                      {day}
                    </span>
                    {(isUpcoming || isCompleted || isMissed) && day !== 28 && (
                      <div className={`absolute bottom-0 w-1 h-1 rounded-full ${isUpcoming ? 'bg-blue-500' : isCompleted ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    )}
                    {day === 28 && <div className="absolute -bottom-1 text-[8px] font-black text-gray-600 leading-none">●</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Focus Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5">Today's Focus</h3>
            <div className="border-l-[3px] border-gray-900 pl-4 py-1">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 block italic">Next Event</span>
              <h4 className="text-sm font-black text-gray-900 leading-tight tracking-tight uppercase">Technical Round @ Google</h4>
              <div className="flex items-center gap-2 mt-3 text-gray-400">
                <Clock size={12} />
                <span className="text-[10px] font-bold italic">10:30 AM <span className="text-gray-300 font-medium tracking-tight whitespace-nowrap">(In 2 hours)</span></span>
              </div>
            </div>
          </div>

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
