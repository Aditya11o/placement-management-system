import React, { useState, useEffect } from 'react';
import { 
  Search, Download, 
  Eye, Calendar
} from 'lucide-react';
import Avatar from '../../components/Avatar';
import api from '../../api';
import ListSkeleton from '../../components/skeletons/ListSkeleton';

const ManageApplications: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/applications/admin', { params: { limit: 0 } });
      const items = data?.data || data;
      const mapped = items.map((app: any) => ({
        id: app._id,
        student: {
          name: app.student?.name || 'Unknown',
          course: app.studentProfile?.studentDetails?.course || 'N/A',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(app.student?.name || 'U')}&background=random`
        },
        job: {
          role: app.job?.title || 'N/A',
          company: app.job?.companyName || 'N/A',
        },
        appliedDate: new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
        rawStatus: app.status,
        interviewLog: {
          status: app.status === 'scheduled' ? 'Scheduled' : 
                  (app.status === 'placed' ? 'Completed' : 'Not Scheduled'),
          date: app.interviewDate ? new Date(app.interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null,
          time: app.interviewDate ? new Date(app.interviewDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null
        }
      }));
      setApplications(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications = applications.filter(app => 
    app.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.job.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-start pt-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Applications Management</h1>
          <p className="text-base text-gray-500 font-bold mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Currently monitoring <span className="text-gray-900 font-black">{applications.length}</span> total active applications
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#000613] text-white rounded-xl font-bold text-sm shadow-xl shadow-black/10 hover:scale-105 transition-all">
          <Download size={18} />
          Export Records
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search by student, company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-bold text-gray-900 shadow-sm outline-none focus:bg-white focus:border-[#000613] transition-all"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden min-h-[500px]">
        {loading ? (
          <ListSkeleton hideHeader={true} />
        ) : (
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
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/40 transition-all duration-300 group">
                    <td className="pl-8 pr-6 py-5">
                      <div className="flex items-center gap-3">
                        <Avatar 
                          name={app.student.name} 
                          profilePhoto={app.studentProfile?.profile_photo} 
                          size="md" 
                          className="rounded-xl" 
                        />
                        <div>
                          <p className="text-sm font-black text-gray-900 leading-tight">{app.student.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-1">{app.student.course}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div>
                        <p className="text-sm font-black text-gray-900 leading-tight">{app.job.company}</p>
                        <p className="text-[10px] font-bold text-gray-500 mt-0.5 uppercase tracking-wide italic">{app.job.role}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-black text-gray-600 tracking-tight">{app.appliedDate}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        app.rawStatus === 'applied' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        app.rawStatus === 'shortlisted' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                        app.rawStatus === 'scheduled' ? 'bg-cyan-50 text-cyan-600 border border-cyan-100' :
                        app.rawStatus === 'placed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {app.interviewLog.status === 'Not Scheduled' ? (
                          <p className="text-[10px] font-bold text-gray-400 italic group-hover:text-gray-500 transition-colors">— Not Scheduled —</p>
                        ) : app.interviewLog.status === 'Completed' ? (
                          <div>
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">COMPLETED</p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gray-100 text-gray-500">
                              <Calendar size={14} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-900 uppercase">
                                {app.interviewLog.date} 
                                <span className="text-gray-300 mx-1">/</span> 
                                <span className="text-[9px] font-bold text-gray-500 tracking-wider font-mono">{app.interviewLog.time}</span>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="pr-8 pl-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-20 group-hover:opacity-100 transition-all duration-300">
                        <button title="View Application" className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-110">
                          <Eye size={18} />
                        </button>
                        <button title="Download Resume" className="p-2 text-[#000613] hover:bg-gray-100 rounded-xl transition-all hover:scale-110">
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredApplications.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-20 text-center font-bold text-gray-400 italic">No applications found matching your search</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-center pt-4 italic">
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] font-mono">
          Secure Academic Portal • Placement Hub v4.0.2
        </p>
      </div>
    </div>
  );
};

export default ManageApplications;
