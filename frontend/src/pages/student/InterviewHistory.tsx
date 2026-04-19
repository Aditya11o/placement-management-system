import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, 
  Building2, MapPin, Video, 
  ExternalLink, ChevronLeft, 
  Trophy
} from 'lucide-react';
import ListSkeleton from '../../components/skeletons/ListSkeleton';
import api from '../../api';
import Dropdown from '../../components/Dropdown';
import { useAuth } from '../../context/AuthContext';
import ResponsiveTable from '../../components/ResponsiveTable';

const InterviewHistory: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<any[]>([]);
  
  // Filters state
  const [searchCompany, setSearchCompany] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateFilter, setDateFilter] = useState('');

  const fetchHistory = async () => {
    try {
      if (!user?._id) return;
      const { data } = await api.get(`/interviews/history/${user._id}`);
      setInterviews(data);
      setFilteredInterviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  useEffect(() => {
    let result = interviews;

    if (searchCompany) {
      result = result.filter(inv => {
        const company = inv.application?.job?.companyName || '';
        const role = inv.application?.job?.title || '';
        return company.toLowerCase().includes(searchCompany.toLowerCase()) ||
               role.toLowerCase().includes(searchCompany.toLowerCase());
      });
    }

    if (statusFilter !== 'All Status') {
      result = result.filter(inv => (inv.status || 'scheduled') === statusFilter);
    }

    if (dateFilter) {
      result = result.filter(inv => new Date(inv.date).toISOString().startsWith(dateFilter));
    }

    setFilteredInterviews(result);
  }, [searchCompany, statusFilter, dateFilter, interviews]);

  const getStatusStyle = (status: string) => {
    const s = (status || 'scheduled').toLowerCase();
    switch (s) {
      case 'scheduled': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'missed': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'rejected': return 'bg-gray-50 text-gray-500 border-gray-100';
      case 'selected': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Selected': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  if (loading) {
    return <ListSkeleton />;
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">
            <div className="w-8 h-px bg-blue-600" />
            <span>Learning from the past</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none uppercase">Interview <span className="text-blue-600">History</span></h1>
          <p className="text-gray-500 text-[14px] mt-3 font-medium">Review your performance across all interview rounds and screenings.</p>
        </div>
        
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-all"
        >
          <ChevronLeft size={16} />
          Back to Schedule
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Search Company / Role</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search..."
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-blue-600 outline-none transition-all shadow-sm"
                value={searchCompany}
                onChange={(e) => setSearchCompany(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Filter by Status</label>
            <Dropdown 
              label="Status"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={['All Status', 'scheduled', 'completed', 'missed', 'rejected', 'selected']}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Filter by Date</label>
            <div className="relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="date" 
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-blue-600 outline-none transition-all shadow-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* History Table Card */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">History Records</h3>
          <span className="px-4 py-1.5 bg-gray-50 text-[10px] font-black text-gray-400 rounded-full border border-gray-100 uppercase tracking-widest">
            {filteredInterviews.length} Records
          </span>
        </div>

        <ResponsiveTable>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Company & Role</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Round</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Date & Time</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Mode</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredInterviews.map((inv, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 border border-gray-100 rounded-2xl p-2 bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                        <Building2 className="text-gray-400" size={24} />
                      </div>
                      <div>
                        <h4 className="text-[14px] font-black text-gray-900 leading-tight tracking-tight uppercase">{inv.application?.job?.companyName || 'Company'}</h4>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{inv.application?.job?.title || 'Role'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-gray-100 text-[10px] font-black text-gray-600 uppercase tracking-widest rounded-lg">
                      {inv.type || 'Round'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-gray-900 uppercase">
                        {inv.date ? new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase italic">
                        {inv.date ? new Date(inv.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col items-start gap-1 text-gray-600">
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                        {inv.link ? <Video size={14} className="text-gray-400" /> : <MapPin size={14} className="text-gray-400" />}
                        {inv.link ? 'Online' : 'Offline'}
                      </div>
                      {inv.feedback && (
                        <div className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded leading-tight max-w-[150px] truncate" title={inv.feedback}>
                          Feedback: {inv.feedback}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full italic border ${getStatusStyle(inv.status)}`}>
                      {inv.status || 'Scheduled'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {inv.link ? (
                      <a href={inv.link} target="_blank" rel="noreferrer" className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 hover:text-black transition-all inline-block">
                        <ExternalLink size={16} />
                      </a>
                    ) : (
                      <button disabled className="p-2.5 bg-gray-50 text-gray-300 rounded-xl cursor-not-allowed inline-block">
                        <ExternalLink size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ResponsiveTable>

        {filteredInterviews.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[30px] flex items-center justify-center mx-auto mb-6 border border-gray-100">
              <Trophy className="text-gray-200" size={32} />
            </div>
            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest italic">No interview history available yet.</h4>
          </div>
        )}
      </div>

    </div>
  );
};

export default InterviewHistory;
