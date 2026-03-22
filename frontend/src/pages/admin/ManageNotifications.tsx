import React, { useState } from 'react';
import { 
  Send, Eye, Trash2, 
  Paperclip, ArrowUpRight, 
  CheckSquare, Layers, ChevronRight,
  ExternalLink, 
  Target
} from 'lucide-react';

const ManageNotifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Send Notification');

  const sentNotifications = [
    {
      title: 'Goldman Sachs Shortlist',
      message: 'The shortlist for the upcoming summer internship prog...',
      sentTo: 'ALL STUDENTS',
      type: 'PLACEMENT',
      dateTime: 'Oct 24, 2023 | 09:15 AM'
    },
    {
      title: 'Resume Workshop Reminder',
      message: "Don't forget to attend the resume building session tom...",
      sentTo: 'B.TECH CSE',
      type: 'GENERAL',
      dateTime: 'Oct 23, 2023 | 04:30 PM'
    },
    {
      title: 'Adobe Interview Schedule',
      message: 'Individual slots for Adobe technical interviews have be...',
      sentTo: 'SELECTED STUDENTS',
      type: 'INTERVIEW',
      dateTime: 'Oct 22, 2023 | 11:00 AM'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="pt-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Notifications Management</h1>
        <p className="text-base text-gray-500 font-bold mt-2 leading-relaxed max-w-3xl">
          Broadcast critical updates, placement alerts, and interview schedules to students and recruiters across the campus portal.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-100 pb-px">
        {['Send Notification', 'Sent Notifications', 'Scheduled Notifications'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-black transition-all relative ${
              activeTab === tab ? 'text-[#000613]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#000613] rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Compose Broadcast Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#000613] group-hover:scale-110 transition-transform">
                <Layers size={22} />
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Compose New Broadcast</h2>
            </div>

            <div className="space-y-6">
              {/* Notification Title */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notification Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Google Interview Shortlist Released" 
                  className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all placeholder:text-gray-300"
                />
              </div>

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Send To</label>
                  <select className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-black text-sm text-gray-700 cursor-pointer appearance-none">
                    <option>All Students</option>
                    <option>All Recruiters</option>
                    <option>Selected Students</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notification Type</label>
                  <select className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-black text-sm text-gray-700 cursor-pointer appearance-none">
                    <option>General</option>
                    <option>Placement</option>
                    <option>Interview</option>
                    <option>Alert</option>
                  </select>
                </div>
              </div>

              {/* Optional Selectors */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-gray-300 italic">Select Course (Optional)</label>
                  <select className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-black text-sm text-gray-700 cursor-pointer appearance-none">
                    <option>B.Tech CSE</option>
                    <option>MCA</option>
                    <option>BCA</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-gray-300 italic">Select Company (Optional)</label>
                  <select className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-black text-sm text-gray-700 cursor-pointer appearance-none">
                    <option>Google</option>
                    <option>Amazon</option>
                    <option>Microsoft</option>
                  </select>
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message Content</label>
                <textarea 
                  rows={4}
                  placeholder="Detailed message for the recipients..." 
                  className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all placeholder:text-gray-300 resize-none"
                ></textarea>
              </div>

              {/* Attachments */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 group/attach hover:border-[#000613] hover:bg-white transition-all">
                <div className="flex items-center gap-3">
                  <Paperclip size={18} className="text-gray-400 group-hover/attach:text-[#000613] transition-colors" />
                  <span className="text-xs font-black text-gray-400 group-hover/attach:text-gray-600 transition-colors uppercase tracking-widest">Attach related documents (PDF/DOCX)</span>
                </div>
                <button className="px-4 py-1.5 bg-white text-[10px] font-black text-gray-900 border border-gray-100 rounded-lg uppercase tracking-widest hover:bg-[#000613] hover:text-white hover:border-[#000613] transition-all">
                  Browse Files
                </button>
              </div>

              {/* Schedule Toggle */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer shadow-inner">
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"></div>
                  </div>
                  <span className="text-sm font-black text-gray-900 italic">Schedule for later delivery</span>
                </div>
                <button className="flex items-center gap-3 px-8 py-4 bg-[#000613] text-white rounded-2xl font-black text-sm shadow-xl shadow-black/20 hover:scale-105 transition-all active:scale-95 group">
                  <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Stats & Previews */}
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm group">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Sent</p>
              <h3 className="text-3xl font-black text-gray-900 tracking-tighter group-hover:scale-110 origin-left transition-transform">1,284</h3>
              <div className="flex items-center gap-1 text-emerald-500 mt-2 font-black text-[9px] uppercase tracking-widest">
                <ArrowUpRight size={12} />
                <span>12% last month</span>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm group">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Open Rate</p>
              <h3 className="text-3xl font-black text-gray-900 tracking-tighter group-hover:scale-110 origin-left transition-transform">92.4%</h3>
              <div className="flex items-center gap-1 text-blue-500 mt-2 font-black text-[9px] uppercase tracking-widest">
                <Target size={12} />
                <span>High Engagement</span>
              </div>
            </div>
          </div>

          {/* Mobile Preview */}
          <div className="bg-[#000613] rounded-[2.5rem] p-8 shadow-xl shadow-black/20 relative overflow-hidden h-[300px] flex flex-col justify-center border border-white/5">
            <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] absolute top-8 left-8">Mobile Preview</h4>
            <div className="bg-white rounded-2xl p-5 shadow-2xl relative z-10 animate-fade-in mx-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#000613] border border-gray-100 font-bold shadow-sm">
                    <span className="text-sm">U</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900">University Portal</p>
                    <p className="text-[9px] font-black text-gray-400">Just now</p>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              </div>
              <h5 className="text-[13px] font-black text-gray-900 leading-tight mb-2">Interview Shortlist Published</h5>
              <p className="text-[11px] font-bold text-gray-500 leading-relaxed line-clamp-2">
                Congratulations to the students shortlisted for the final round of Microsoft interviews. Please check...
              </p>
              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                <ExternalLink size={14} className="text-gray-300" />
              </div>
            </div>
            <p className="text-[9px] font-black text-white/20 italic absolute bottom-8 left-0 right-0 text-center uppercase tracking-widest">Visual confirmation of student push notification</p>
          </div>

          {/* Broadcast Protocols */}
          <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 space-y-6">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Broadcast Protocols</h4>
            <div className="space-y-5">
              {[
                { text: 'High priority alerts are sent via SMS, Email, and Push.', icon: CheckSquare },
                { text: 'Placement specific notifications only reach registered users.', icon: CheckSquare },
                { text: 'Reports are automatically generated 24h after broadcast.', icon: CheckSquare }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start group">
                  <item.icon size={16} className="text-[#000613] mt-0.5 group-hover:scale-125 transition-transform" />
                  <p className="text-[11px] font-bold text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors uppercase tracking-tight">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Recent Sent Notifications Table */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden mt-8">
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center group">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#000613] rounded-full group-hover:h-8 transition-all"></div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Recent Sent Notifications</h3>
          </div>
          <button className="text-[10px] font-black text-gray-400 hover:text-[#000613] uppercase tracking-widest transition-colors">Export History</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="pl-8 pr-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Title & Message</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sent To</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Type</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</th>
                <th className="pr-8 pl-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sentNotifications.map((notif, idx) => (
                <tr key={idx} className="hover:bg-gray-50/40 transition-all duration-300">
                  <td className="pl-8 pr-6 py-6">
                    <div className="max-w-md">
                      <p className="text-sm font-black text-gray-900 group-hover:text-[#000613] transition-colors">{notif.title}</p>
                      <p className="text-xs font-bold text-gray-400 mt-1 italic line-clamp-1">{notif.message}</p>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="px-3 py-1.5 bg-gray-50 rounded-lg text-[9px] font-black text-gray-600 border border-gray-100 uppercase tracking-widest shadow-sm">
                      {notif.sentTo}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        notif.type === 'PLACEMENT' ? 'bg-blue-500' : 
                        notif.type === 'GENERAL' ? 'bg-gray-400' : 'bg-amber-500'
                      }`}></div>
                      <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em]">{notif.type}</p>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{notif.dateTime}</p>
                  </td>
                  <td className="pr-8 pl-6 py-6 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button className="p-2 text-gray-300 hover:text-[#000613] hover:scale-125 transition-all"><Eye size={18} /></button>
                      <button className="p-2 text-gray-300 hover:text-rose-600 hover:scale-125 transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-8 border-t border-gray-50 flex justify-center bg-gray-50/30">
          <button className="flex items-center gap-2 px-8 py-3 bg-white text-[11px] font-black text-gray-900 border border-gray-100 rounded-xl uppercase tracking-[0.2em] shadow-sm hover:shadow-xl hover:border-[#000613] hover:bg-[#000613] hover:text-white transition-all group">
            View Full Archive
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Institutional Footer */}
      <div className="flex justify-center pt-8 border-t border-gray-100 mt-12 mb-4">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em] font-mono">
          University Intelligence System • Global Broadcast Node • 2024
        </p>
      </div>
    </div>
  );
};

export default ManageNotifications;
