import React, { useState } from 'react';
import { 
  Clock, Video, 
  MapPin, CheckCircle2,
  ChevronLeft, ChevronRight,
  Plus, Search,
  Briefcase, X,
  ExternalLink, Edit3, Trash2
} from 'lucide-react';

const InterviewSchedule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const sampleInterviews = [
    {
      id: 1,
      candidate: 'Arjun Mehta',
      role: 'Senior Software Engineer',
      date: 'Oct 24, 2026',
      time: '10:00 AM - 11:00 AM',
      mode: 'Online',
      status: 'Scheduled',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun'
    },
    {
      id: 2,
      candidate: 'Priya Sharma',
      role: 'Product Designer',
      date: 'Oct 24, 2026',
      time: '02:00 PM - 03:00 PM',
      mode: 'In-Person',
      status: 'Completed',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'
    },
    {
      id: 3,
      candidate: 'Rohan Verma',
      role: 'Data Analyst',
      date: 'Oct 25, 2026',
      time: '11:30 AM - 12:30 PM',
      mode: 'Online',
      status: 'Selected',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan'
    },
    {
      id: 4,
      candidate: 'Isha Gupta',
      role: 'Frontend Developer',
      date: 'Oct 26, 2026',
      time: '04:00 PM - 05:00 PM',
      mode: 'Online',
      status: 'Rejected',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isha'
    },
    {
      id: 5,
      candidate: 'Karan Singh',
      role: 'Backend Architect',
      date: 'Oct 27, 2026',
      time: '09:00 AM - 10:00 AM',
      mode: 'In-Person',
      status: 'Scheduled',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karan'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-black uppercase tracking-widest">Scheduled</span>;
      case 'Completed':
        return <span className="px-2.5 py-1 bg-gray-50 text-gray-500 border border-gray-200 rounded-full text-[10px] font-black uppercase tracking-widest">Completed</span>;
      case 'Selected':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest">Selected</span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[10px] font-black uppercase tracking-widest">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Interview Schedule</h1>
          <p className="text-gray-500 text-[14px] mt-1">Coordinate and manage candidate screenings efficiently.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-3.5 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center gap-2 active:scale-95"
        >
          <Plus size={16} strokeWidth={3} />
          Schedule New Interview
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
        {['All', 'Scheduled', 'Completed', 'Selected', 'Rejected'].map((tab) => (
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
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidate Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Date & Time</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Mode</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sampleInterviews.map((interview) => (
                <tr key={interview.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-gray-200 p-0.5 overflow-hidden flex-shrink-0">
                        <img src={interview.photo} alt="" className="w-full h-full rounded-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900 tracking-tight text-[14px]">{interview.candidate}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-gray-600 font-bold">
                      <Briefcase size={14} className="text-gray-300" />
                      {interview.role}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-black text-gray-900">{interview.date}</span>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                        <Clock size={10} />
                        {interview.time}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex justify-center">
                      {interview.mode === 'Online' ? (
                        <span className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <Video size={12} />
                          Online
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <MapPin size={12} />
                          Offline
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      {getStatusBadge(interview.status)}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all" title="View Details">
                        <ExternalLink size={16} />
                      </button>
                      <button className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                        <Edit3 size={16} />
                      </button>
                      <button className="p-2 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Cancel Interview">
                        <Trash2 size={16} />
                      </button>
                      <div className="w-px h-4 bg-gray-200 mx-1" />
                      <button className="px-3 py-1.5 text-[10px] font-black text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all uppercase tracking-widest" title="Mark as Selected">
                        Select
                      </button>
                      <button className="px-3 py-1.5 text-[10px] font-black text-rose-600 hover:bg-rose-50 rounded-lg transition-all uppercase tracking-widest" title="Mark as Rejected">
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
          <p className="text-[12px] font-bold text-gray-400">
            Showing <span className="text-gray-900">1 to 5</span> of <span className="text-gray-900">24</span> interviews
          </p>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:bg-white hover:text-gray-900 transition-all active:scale-95 disabled:opacity-50" disabled>
              <ChevronLeft size={16} />
              Previous
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-black/10 active:scale-95">
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#000613]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-[600px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            
            {/* Modal Header */}
            <div className="px-12 pt-12 pb-6 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Schedule New Interview</h2>
                <p className="text-gray-400 text-[14px] font-medium mt-1 uppercase tracking-wide">Send a calendar invite to the candidate.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-12 pb-8 space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Student Name</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" placeholder="Search and select student..." className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 focus:bg-white focus:border-gray-200 rounded-2xl font-bold text-gray-900 text-[13px] outline-none transition-all placeholder:text-gray-300" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Job Role</label>
                  <select className="w-full px-5 py-4 bg-gray-50 border border-gray-100 focus:bg-white focus:border-gray-200 rounded-2xl font-bold text-gray-900 text-[13px] outline-none transition-all appearance-none cursor-pointer">
                    <option>Senior Full-Stack Dev</option>
                    <option>UI/UX Designer</option>
                    <option>Product Manager</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Date</label>
                  <input type="date" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 focus:bg-white focus:border-gray-200 rounded-2xl font-bold text-gray-900 text-[13px] outline-none transition-all cursor-pointer" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Time Slot</label>
                  <input type="time" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 focus:bg-white focus:border-gray-200 rounded-2xl font-bold text-gray-900 text-[13px] outline-none transition-all cursor-pointer" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Interview Mode</label>
                  <div className="flex p-1 bg-gray-100 rounded-2xl">
                    <button className="flex-1 py-3 bg-white text-[#000613] rounded-xl text-[11px] font-black uppercase tracking-widest shadow-sm">Online</button>
                    <button className="flex-1 py-3 text-gray-400 rounded-xl text-[11px] font-black uppercase tracking-widest">In-Person</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Link / Location</label>
                  <input type="text" placeholder="Meet link or Room number" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 focus:bg-white focus:border-gray-200 rounded-2xl font-bold text-gray-900 text-[13px] outline-none transition-all placeholder:text-gray-300" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Internal Notes (Optional)</label>
                <textarea 
                  rows={4}
                  placeholder="Specific instructions for the interview panel..."
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 focus:bg-white focus:border-gray-200 rounded-2xl font-bold text-gray-900 text-[13px] outline-none transition-all placeholder:text-gray-300 resize-none"
                />
              </div>

              <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-[24px] border border-gray-100 group cursor-pointer transition-all hover:bg-white hover:border-gray-200">
                <div className="w-6 h-6 rounded-lg bg-gray-900 flex items-center justify-center text-white scale-110">
                   <CheckCircle2 size={16} />
                </div>
                <span className="text-[12px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Send email notification to candidate and interviewers immediately</span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-12 py-8 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-6 items-center">
              <button 
                onClick={() => setShowModal(false)}
                className="text-[12px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-all"
              >
                Discard
              </button>
              <button className="px-12 py-4 bg-[#000613] text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/20 active:scale-95">
                Confirm Schedule
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default InterviewSchedule;
