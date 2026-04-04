import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  XCircle, 
  Plus, 
  BarChart3, User
} from 'lucide-react';
import api from '../../api';
import ListSkeleton from '../../components/skeletons/ListSkeleton';

const ManageInterviews: React.FC = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const { data: response } = await api.get('/applications/interviews');
      const mapped = response.data.map((app: any) => ({
        id: app._id,
        student: {
          name: app.student?.name || 'Unknown',
          id: app.application_id || 'N/A',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(app.student?.name || 'U')}&background=random`
        },
        job: {
          company: app.job?.companyName || 'N/A',
          role: app.job?.title || 'N/A'
        },
        schedule: {
          date: new Date(app.interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: new Date(app.interviewDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          timezone: '(GMT+5:30)'
        },
        mode: app.interviewLink ? 'ONLINE' : 'OFFLINE',
        link: app.interviewLink || '',
        location: app.interviewLink ? '' : 'TBA',
        status: app.status.toUpperCase()
      }));
      setInterviews(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-start pt-2">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Interviews Management</h1>
          <p className="text-base text-gray-500 font-bold mt-2 leading-relaxed">
            Oversee and coordinate all candidate evaluations across the platform.
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#000613] text-white rounded-xl font-bold text-sm shadow-xl shadow-black/10 hover:scale-105 transition-all">
          <Plus size={20} />
          Schedule Interview
        </button>
      </div>

      {/* Interviews Table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <ListSkeleton hideHeader={true} />
        ) : (
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
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{interview.mode}</p>
                        {interview.mode === 'ONLINE' ? (
                          <a href={`https://${interview.link}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-gray-500 border-b border-gray-300 hover:text-blue-600 hover:border-blue-600 transition-all truncate block max-w-[150px]">
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
                        interview.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        interview.status === 'SELECTED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        interview.status === 'PLACED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
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
                      </div>
                    </td>
                  </tr>
                ))}
                {interviews.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-20 text-center font-bold text-gray-400 italic">No scheduled interviews found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm group relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Scheduled</p>
            <h3 className="text-4xl font-black text-gray-900 tracking-tighter">
              {interviews.filter(i => i.status === 'SCHEDULED').length}
            </h3>
          </div>
          <div className="absolute -right-4 -bottom-4 text-gray-50 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar size={120} />
          </div>
        </div>

        <div className="bg-[#000613] text-white rounded-3xl p-6 shadow-xl shadow-black/20 group">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 font-bold">Selection Rate</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-white tracking-tighter">
              {interviews.length > 0 ? Math.round((interviews.filter(i => i.status === 'SELECTED' || i.status === 'PLACED').length / interviews.length) * 100) : 0}%
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageInterviews;
