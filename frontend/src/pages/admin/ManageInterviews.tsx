import React from 'react';
import { 
  Calendar, Filter, MoreVertical, 
  XCircle, ChevronLeft, ChevronRight, 
  Plus, TrendingUp, CheckSquare, 
  BarChart3, User
} from 'lucide-react';

const ManageInterviews: React.FC = () => {
  const interviews = [
    {
      id: 1,
      student: {
        name: 'Sarah Jenkins',
        id: '#STU-2241',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop'
      },
      job: {
        company: 'Apex Solutions',
        role: 'Data Scientist'
      },
      schedule: {
        date: 'Oct 24, 2023',
        time: '10:30 AM',
        timezone: '(GMT+5:30)'
      },
      mode: 'ONLINE',
      link: 'meet.google.com/xyz-abc',
      status: 'SCHEDULED'
    },
    {
      id: 2,
      student: {
        name: 'Mark Chen',
        id: '#STU-2290',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop'
      },
      job: {
        company: 'Nova Financial',
        role: 'Equity Analyst'
      },
      schedule: {
        date: 'Oct 21, 2023',
        time: '02:00 PM',
        timezone: '(GMT+5:30)'
      },
      mode: 'OFFLINE',
      location: 'Meeting Room B, 4th Floor',
      status: 'SELECTED'
    },
    {
      id: 3,
      student: {
        name: 'Amara Williams',
        id: '#STU-2115',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop'
      },
      job: {
        company: 'Global Tech',
        role: 'Front-end Intern'
      },
      schedule: {
        date: 'Oct 20, 2023',
        time: '04:45 PM',
        timezone: '(GMT+5:30)'
      },
      mode: 'ONLINE',
      link: 'zoom.us/j/98210331',
      status: 'REJECTED'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-start pt-2">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Interviews Management</h1>
          <p className="text-base text-gray-500 font-bold mt-2 leading-relaxed">
            Oversee and coordinate all candidate evaluations. Track progress from initial screening to final selection rounds with real-time status updates.
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#000613] text-white rounded-xl font-bold text-sm shadow-xl shadow-black/10 hover:scale-105 transition-all">
          <Plus size={20} />
          Schedule Interview
        </button>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</p>
          <select className="w-full bg-gray-50 border-none rounded-xl py-2 px-3 text-sm font-bold text-gray-700 focus:ring-0">
            <option>All Statuses</option>
            <option>Scheduled</option>
            <option>Completed</option>
            <option>Selected</option>
            <option>Rejected</option>
          </select>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Company</p>
          <select className="w-full bg-gray-50 border-none rounded-xl py-2 px-3 text-sm font-bold text-gray-700 focus:ring-0">
            <option>All Companies</option>
            <option>Google</option>
            <option>Amazon</option>
            <option>Microsoft</option>
          </select>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Role</p>
          <select className="w-full bg-gray-50 border-none rounded-xl py-2 px-3 text-sm font-bold text-gray-700 focus:ring-0">
            <option>All Roles</option>
            <option>Software Engineer</option>
            <option>Data Analyst</option>
            <option>UX Designer</option>
          </select>
        </div>
        <button className="h-full w-full bg-gray-100/50 border border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-sm font-black text-gray-700 hover:bg-white hover:border-[#000613] transition-all">
          <Filter size={18} />
          More Filters
        </button>
      </div>

      {/* Interviews Table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="pl-8 pr-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Details</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Schedule</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mode & Link</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="pr-8 pl-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {interviews.map((interview) => (
                <tr key={interview.id} className="hover:bg-gray-50/40 transition-all duration-300 group">
                  <td className="pl-8 pr-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full border-2 border-white shadow-sm overflow-hidden hover:scale-110 transition-transform">
                        <img src={interview.student.avatar} alt={interview.student.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">{interview.student.name}</p>
                        <p className="text-[10px] font-bold text-gray-400">ID: {interview.student.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gray-100 text-gray-500 rounded-lg">
                        <BarChart3 size={14} />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 leading-tight">{interview.job.company}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{interview.job.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-black text-gray-800 tracking-tight">{interview.schedule.date}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{interview.schedule.time}</p>
                    <p className="text-[9px] font-bold text-gray-400">{interview.schedule.timezone}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{interview.mode}</p>
                      {interview.mode === 'ONLINE' ? (
                        <a href="#" className="text-xs font-bold text-gray-500 border-b border-gray-300 hover:text-blue-600 hover:border-blue-600 transition-all truncate block max-w-[150px]">
                          {interview.link}
                        </a>
                      ) : (
                        <p className="text-xs font-bold text-gray-500 truncate block max-w-[150px]">
                          {interview.location}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      interview.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm shadow-blue-500/10' :
                      interview.status === 'SELECTED' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                      interview.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {interview.status}
                    </span>
                  </td>
                  <td className="pr-8 pl-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-20 group-hover:opacity-100 transition-all duration-300">
                      <button title="View Details" className="text-gray-400 hover:text-[#000613] hover:scale-125 transition-all"><User size={18} /></button>
                      <button title="Reschedule" className="text-gray-400 hover:text-blue-600 hover:scale-125 transition-all"><Calendar size={18} /></button>
                      <button title="Cancel" className="text-gray-400 hover:text-rose-600 hover:scale-125 transition-all"><XCircle size={18} /></button>
                      <button title="More" className="text-gray-400 hover:text-gray-900 hover:scale-125 transition-all"><MoreVertical size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-8 py-5 border-t border-gray-50 flex justify-between items-center bg-gray-50/30">
          <p className="text-[11px] font-bold text-gray-400 tracking-tight whitespace-nowrap">
            Showing <span className="text-gray-900 font-black italic">1–10</span> of <span className="text-gray-900 font-black">142</span> interviews
          </p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"><ChevronLeft size={20} /></button>
            <button className="w-8 h-8 rounded-lg bg-[#000613] text-white text-xs font-black flex items-center justify-center">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-white text-gray-500 text-xs font-bold flex items-center justify-center transition-all">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-white text-gray-500 text-xs font-bold flex items-center justify-center transition-all">3</button>
            <span className="text-gray-300 px-1 font-mono tracking-widest italic">...</span>
            <button className="w-8 h-8 rounded-lg hover:bg-white text-gray-500 text-xs font-bold flex items-center justify-center transition-all">15</button>
            <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      {/* Bottom Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1: Total Scheduled */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Scheduled</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter">42</h3>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-emerald-500 bg-emerald-50/50 w-fit px-2 py-0.5 rounded-full border border-emerald-100">
              <TrendingUp size={12} />
              <span className="text-[10px] font-black">+12% vs last week</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 text-gray-50 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar size={120} />
          </div>
        </div>

        {/* Card 2: Completed Today */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Completed Today</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter">08</h3>
            </div>
            <p className="mt-4 text-[10px] font-bold text-gray-400 italic">Next in <span className="text-amber-500 font-black">45 mins</span></p>
          </div>
          <div className="absolute -right-4 -bottom-4 text-gray-50 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckSquare size={120} />
          </div>
        </div>

        {/* Card 3: Selection Rate */}
        <div className="bg-[#000613] text-white rounded-3xl p-6 shadow-xl shadow-black/20 hover:scale-[1.02] transition-all duration-500 group">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Selection Rate</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-white tracking-tighter">64%</h3>
          </div>
          <div className="mt-6 space-y-2">
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
              <div className="h-full w-[64%] bg-white rounded-full relative shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
            </div>
          </div>
        </div>

        {/* Card 4: New Interview Plan */}
        <button className="h-full w-full border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-6 bg-gray-50/30 hover:bg-white hover:border-[#000613] transition-all duration-500 group gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#000613] group-hover:scale-110 group-hover:rotate-90 transition-all duration-500 shadow-teal-500/5">
            <Plus size={24} />
          </div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-900 transition-colors">New Interview Plan</p>
        </button>
      </div>

      {/* Institutional Footer Tag */}
      <div className="flex justify-center pt-4">
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] font-mono">
          Secure Academic Portal • Placement Hub v4.0.2
        </p>
      </div>
    </div>
  );
};

export default ManageInterviews;
