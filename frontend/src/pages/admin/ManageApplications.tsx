import React, { useState } from 'react';
import { 
  Search, Filter, Download, 
  Eye, Calendar, RefreshCw, 
  ChevronLeft, ChevronRight
} from 'lucide-react';

const ManageApplications: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  const applications = [
    {
      id: 1,
      student: {
        name: 'Alex Rivera',
        course: 'B.Tech - Computer Science',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop'
      },
      job: {
        role: 'Software Engineer',
        company: 'Google',
        logo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png'
      },
      appliedDate: 'Oct 12, 2023',
      status: 'Shortlisted',
      interviewLog: {
        status: 'Scheduled',
        date: 'Oct 15',
        time: '10:00 AM'
      }
    },
    {
      id: 2,
      student: {
        name: 'Priya Sharma',
        course: 'M.S - Data Science',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop'
      },
      job: {
        role: 'Data Analyst',
        company: 'Amazon',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg'
      },
      appliedDate: 'Oct 10, 2023',
      status: 'Applied',
      interviewLog: {
        status: 'Not Scheduled'
      }
    },
    {
      id: 3,
      student: {
        name: 'Jordan Davis',
        course: 'B.Tech - Electronics',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop'
      },
      job: {
        role: 'Cloud Architect',
        company: 'Microsoft',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg'
      },
      appliedDate: 'Oct 08, 2023',
      status: 'Interview Scheduled',
      interviewLog: {
        status: 'Today',
        time: '02:30 PM'
      }
    },
    {
      id: 4,
      student: {
        name: 'Li Chen',
        course: 'B.Des - Product Design',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop'
      },
      job: {
        role: 'UX Designer',
        company: 'Apple',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg'
      },
      appliedDate: 'Oct 05, 2023',
      status: 'Selected',
      interviewLog: {
        status: 'Completed',
        date: 'Oct 09'
      }
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-start pt-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Applications Management</h1>
          <p className="text-base text-gray-500 font-bold mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Currently monitoring <span className="text-gray-900 font-black">1,284</span> total active applications
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#000613] text-white rounded-xl font-bold text-sm shadow-xl shadow-black/10 hover:scale-105 transition-all">
          <Download size={18} />
          Export Records
        </button>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Search */}
        <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 group hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Quick Search</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#000613] transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Student name, company or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-transparent rounded-xl text-sm font-bold text-gray-900 shadow-sm outline-none focus:border-[#000613] transition-all"
            />
          </div>
        </div>

        {/* Application Status */}
        <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 group hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Application Status</p>
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-transparent rounded-xl text-sm font-black text-gray-700 shadow-sm outline-none cursor-pointer appearance-none focus:border-[#000613] transition-all"
            >
              <option>All Statuses</option>
              <option>Applied</option>
              <option>Shortlisted</option>
              <option>Interview Scheduled</option>
              <option>Selected</option>
              <option>Rejected</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
            </div>
          </div>
        </div>

        {/* More Filters */}
        <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 group hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">More Filters</p>
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-100 rounded-xl text-sm font-black text-gray-700 hover:border-[#000613] transition-all">
              <Filter size={16} />
              Advanced
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#000613] rounded-xl text-sm font-black text-white hover:bg-gray-800 transition-all">
              <RefreshCw size={16} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="pl-8 pr-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Details</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Entity</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Applied Date</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Interview Log</th>
                <th className="pr-8 pl-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/40 transition-all duration-300 group">
                  {/* Student Details */}
                  <td className="pl-8 pr-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl border-2 border-white shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-300">
                        <img src={app.student.avatar} alt={app.student.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 leading-tight">{app.student.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-1">{app.student.course}</p>
                      </div>
                    </div>
                  </td>

                  {/* Job Entity */}
                  <td className="px-6 py-5">
                    <div>
                      <p className="text-sm font-black text-gray-900 leading-tight">{app.job.company}</p>
                      <p className="text-[10px] font-bold text-gray-500 mt-0.5 uppercase tracking-wide italic">{app.job.role}</p>
                    </div>
                  </td>

                  {/* Applied Date */}
                  <td className="px-6 py-5">
                    <p className="text-xs font-black text-gray-600 tracking-tight">{app.appliedDate}</p>
                  </td>

                  {/* Current Status */}
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      app.status === 'Applied' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                      app.status === 'Shortlisted' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                      app.status === 'Interview Scheduled' ? 'bg-cyan-50 text-cyan-600 border border-cyan-100' :
                      app.status === 'Selected' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {app.status}
                    </span>
                  </td>

                  {/* Interview Log */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {app.interviewLog.status === 'Not Scheduled' ? (
                        <p className="text-[10px] font-bold text-gray-400 italic group-hover:text-gray-500 transition-colors">— Not Scheduled —</p>
                      ) : app.interviewLog.status === 'Completed' ? (
                        <div>
                          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">COMPLETED</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase">{app.interviewLog.date}</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${app.interviewLog.status === 'Today' ? 'bg-amber-50 text-amber-500' : 'bg-gray-100 text-gray-500'}`}>
                            <Calendar size={14} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-900 uppercase">
                              {app.interviewLog.status === 'Today' ? 'Today' : app.interviewLog.date} 
                              <span className="text-gray-300 mx-1">/</span> 
                              <span className="text-[9px] font-bold text-gray-500 tracking-wider font-mono">{app.interviewLog.time}</span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="pr-8 pl-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-20 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                      <button title="View Application" className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-110 active:scale-95">
                        <Eye size={18} />
                      </button>
                      <button title="Change Status" className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-all hover:scale-110 active:scale-95">
                        <RefreshCw size={18} />
                      </button>
                      <button title="Schedule Interview" className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all hover:scale-110 active:scale-95">
                        <Calendar size={18} />
                      </button>
                      <button title="Download Resume" className="p-2 text-[#000613] hover:bg-gray-100 rounded-xl transition-all hover:scale-110 active:scale-95">
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center mt-auto">
          <p className="text-[11px] font-bold text-gray-400 tracking-tight">
            Showing <span className="text-gray-900 font-black">1–10</span> of <span className="text-gray-900 font-black text-xs">1,284</span> results
          </p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"><ChevronLeft size={20} /></button>
            <button className="w-9 h-9 rounded-xl bg-[#000613] text-white text-xs font-black shadow-lg shadow-black/20 flex items-center justify-center hover:scale-105 transition-all">1</button>
            <button className="w-9 h-9 rounded-xl hover:bg-white hover:shadow-md text-gray-500 text-xs font-bold flex items-center justify-center transition-all">2</button>
            <button className="w-9 h-9 rounded-xl hover:bg-white hover:shadow-md text-gray-500 text-xs font-bold flex items-center justify-center transition-all">3</button>
            <span className="text-gray-300 px-2 font-mono tracking-widest">...</span>
            <button className="w-9 h-9 rounded-xl hover:bg-white hover:shadow-md text-gray-500 text-xs font-bold flex items-center justify-center transition-all">128</button>
            <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"><ChevronRight size={20} /></button>
          </div>
        </div>
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

export default ManageApplications;
