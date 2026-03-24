import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  RotateCcw,
  CheckCircle, Clock, Calendar, 
  Trophy, XCircle, Download,
  Loader2
} from 'lucide-react';
import Dropdown from '../../components/Dropdown';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

const MyApplications: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredApps, setFilteredApps] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('Any Status');

  const fetchApps = async (status?: string) => {
    try {
      setLoading(true);
      const queryStatus = status || statusFilter;
      const { data } = await api.get('/applications/my', {
        params: { status: queryStatus }
      });
      setApps(data);
      setFilteredApps(data);
    } catch (err: any) {
      console.error(err);
      showError('Failed to fetch applications', 'Fetch Error');
    } finally {
      setLoading(false);
    }
  };

  const handleOfferResponse = async (id: string, response: 'Accepted' | 'Declined') => {
    try {
      if (!window.confirm(`Are you sure you want to ${response.toLowerCase()} this offer?`)) return;
      await api.patch(`/applications/${id}/offer`, { response });
      fetchApps();
      showSuccess(`Offer ${response.toLowerCase()}ed successfully!`, 'Offer Response');
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || `Failed to ${response.toLowerCase()} offer`, 'Response Error');
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    // Component Mount logic
  }, []);

  const stats = [
    { label: 'Total', value: apps.length.toString().padStart(2, '0'), icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Reviewing', value: apps.filter(a => a.status === 'Applied').length.toString().padStart(2, '0'), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Shortlisted', value: apps.filter(a => a.status === 'Shortlisted').length.toString().padStart(2, '0'), icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Interview', value: apps.filter(a => a.interviewDate).length.toString().padStart(2, '0'), icon: Calendar, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Selected', value: apps.filter(a => a.status === 'Selected' || a.status === 'Accepted').length.toString().padStart(2, '0'), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Rejected', value: apps.filter(a => a.status === 'Rejected').length.toString().padStart(2, '0'), icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'applied': return <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded tracking-tighter border border-blue-100 italic">● Applied</span>;
      case 'shortlisted': return <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-black uppercase rounded tracking-tighter border border-purple-100 italic">● Shortlisted</span>;
      case 'selected': return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded tracking-tighter border border-emerald-100 italic font-black">● OFFERED</span>;
      case 'accepted': return <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black uppercase rounded tracking-tighter border border-emerald-700 italic">● Accepted</span>;
      case 'declined': return <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black uppercase rounded tracking-tighter border border-rose-700 italic">● Declined</span>;
      case 'rejected': return <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded tracking-tighter border border-rose-100 italic">● Rejected</span>;
      default: return <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] font-black uppercase rounded tracking-tighter border border-gray-100">● {status}</span>;
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin h-8 w-8 text-blue-900" />
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">My Applications</h1>
          <p className="text-sm font-bold text-gray-400 mt-1 leading-relaxed">
            Track and manage your professional journey. Review status updates, interview schedules, and job offers in real-time.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md border border-gray-200 p-4 flex flex-col items-center text-center hover:shadow-lg transition-all">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-xl font-black text-gray-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="w-56">
            <Dropdown 
              label="Status Filter"
              value={statusFilter}
              onChange={(status) => {
                setStatusFilter(status);
                fetchApps(status);
              }}
              options={[
                'Any Status', 'Applied', 'Reviewing', 
                'Shortlisted', 'Interview', 'Selected', 'Rejected'
              ]}
              italic
            />
          </div>

          <button
            onClick={() => {
              setStatusFilter('Any Status');
              fetchApps('Any Status');
            }}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-900 transition-colors py-2 px-4 italic"
          >
            <RotateCcw size={14} />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Company & Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-center">Date Applied</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Next Step</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredApps.map((app, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform shadow-sm`}>
                        {app.job?.companyName?.[0] || 'C'}
                      </div>
                      <div>
                        <h4 className="text-[13px] font-black text-gray-900 leading-tight uppercase tracking-tight">{app.job?.companyName}</h4>
                        <p className="text-[11px] font-bold text-gray-400 mt-0.5">{app.job?.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center text-xs font-bold text-gray-500 italic">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {getStatusBadge(app.status)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className={`text-[11px] font-black ${app.interviewDate ? 'text-blue-600' : 'text-gray-400'} leading-tight`}>
                        {app.interviewDate ? `Interview: ${new Date(app.interviewDate).toLocaleDateString()}` : 'Awaiting Update'}
                      </span>
                      {app.interviewLink && <span className="text-[10px] font-bold text-blue-400 mt-0.5 leading-none">Meeting Link Shared</span>}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                     <div className="flex justify-end gap-2 items-center">
                       {app.status === 'Selected' && (
                         <>
                           <button
                             onClick={() => handleOfferResponse(app._id, 'Accepted')}
                             className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-sm"
                           >
                             Accept Offer
                           </button>
                           <button
                             onClick={() => handleOfferResponse(app._id, 'Declined')}
                             className="px-3 py-1 border border-rose-200 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all font-black"
                           >
                             Decline
                           </button>
                         </>
                       )}
                       {app.offerLetter && (
                         <a
                           href={app.offerLetter}
                           target="_blank"
                           rel="noreferrer"
                           className="px-3 py-1 bg-blue-950 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-1.5 shadow-sm"
                         >
                           <Download size={10} /> Offer Letter
                         </a>
                       )}
                       <button className="px-4 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                         View Details
                       </button>
                     </div>
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400 font-bold italic">No applications found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default MyApplications;
