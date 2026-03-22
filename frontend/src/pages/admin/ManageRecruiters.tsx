import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Mail, Phone, ExternalLink, Trash2, Eye, ShieldOff, Check, X, Loader2, MapPin, Building2, UserPlus
} from 'lucide-react';
import api from '../../api';

const ManageRecruiters: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHistory, setSelectedHistory] = useState<any[] | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      const filtered = data
        .filter((u: any) => u.role === 'recruiter')
        .map((u: any) => ({
          _id: u._id,
          company: {
            name: u.profile?.companyName || 'N/A',
            logo: u.profile?.companyName?.[0] || 'C',
            website: u.profile?.website || 'N/A',
          },
          recruiter: {
            name: u.name,
            email: u.email,
          },
          industry: u.profile?.industry || 'N/A',
          location: u.profile?.location || 'N/A',
          regDate: new Date(u.createdAt).toLocaleDateString(),
          status: u.status === 'blacklisted' ? 'Blacklisted' : (u.isVerified ? 'Approved' : 'Pending'),
          rawStatus: u.status,
          isVerified: u.isVerified
        }));
      setRecruiters(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const handleVerify = async (id: string, isVerified: boolean) => {
    try {
      await api.patch(`/admin/users/${id}/verify`, { isVerified });
      fetchRecruiters();
    } catch (err) {
      alert('Failed to update recruiter');
    }
  };

  const handleViewHistory = async (id: string) => {
    try {
      setHistoryLoading(true);
      setShowHistory(true);
      const { data } = await api.get(`/admin/recruiters/${id}/history`);
      setSelectedHistory(data);
    } catch (err) {
      alert('Failed to fetch history');
      setShowHistory(false);
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredRecruiters = recruiters.filter(item => 
    item.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.recruiter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.recruiter.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Manage Recruiters</h1>
          <p className="text-sm text-gray-500 font-bold mt-1 max-w-2xl leading-relaxed">
            Approve, monitor, and manage recruitment partners.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#000613] text-white rounded-xl font-bold text-sm shadow-lg shadow-black/10 hover:scale-105 transition-all">
          <UserPlus size={18} />
          Add New Recruiter
        </button>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="relative flex-1 w-full max-w-lg group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#000613] transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search company, recruiter, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-11 pr-4 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-[#000613] focus:ring-4 focus:ring-[#000613]/5 transition-all"
          />
        </div>
      </div>

      {/* Recruiters Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex py-40 items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Company</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Recruiter</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Industry</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Reg. Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRecruiters.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400 border border-gray-50 group-hover:scale-110 transition-transform">
                          {item.company.logo}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 leading-tight">{item.company.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1">
                            {item.company.website}
                            <ExternalLink size={8} />
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs font-black text-gray-700 leading-tight">{item.recruiter.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 italic">{item.recruiter.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-600">{item.industry}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                        <MapPin size={12} className="text-gray-300" />
                        {item.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-400 whitespace-nowrap">
                      <span className="text-gray-900 font-black">{item.regDate}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        item.status === 'Blacklisted' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        'bg-orange-50 text-orange-600 border border-orange-100'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        {item.status === 'Pending' && (
                          <button 
                            onClick={() => handleVerify(item._id, true)}
                            title="Approve" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Check size={16} /></button>
                        )}
                        {item.status !== 'Blacklisted' ? (
                          <button 
                            onClick={async () => {
                              try {
                                await api.patch(`/admin/users/${item._id}/verify`, { status: 'blacklisted' });
                                fetchRecruiters();
                              } catch (err) { alert('Failed to blacklist'); }
                            }}
                            title="Blacklist" className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><X size={16} /></button>
                        ) : (
                          <button 
                            onClick={async () => {
                              try {
                                await api.patch(`/admin/users/${item._id}/verify`, { status: 'active' });
                                fetchRecruiters();
                              } catch (err) { alert('Failed to activate'); }
                            }}
                            title="Activate" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Check size={16} /></button>
                        )}
                        <button 
                          onClick={() => handleViewHistory(item._id)}
                          title="View History" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRecruiters.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center font-bold text-gray-400">No recruiters found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer Placeholder */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center text-xs font-bold text-gray-400">
          <p>Showing {filteredRecruiters.length} records</p>
        </div>
      </div>

      {/* Bottom Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Partners */}
        <div className="bg-[#000613] rounded-3xl p-6 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Partners</p>
              <h3 className="text-5xl font-black text-white mb-4 tracking-tighter">
                {recruiters.filter(r => r.status === 'Approved').length}
              </h3>
            </div>
          </div>
          {/* Decorative Cityscape/Tech Silhouette */}
          <div className="absolute bottom-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity whitespace-nowrap overflow-hidden">
            <Building2 size={120} className="text-white" />
          </div>
        </div>

        {/* Waitlist Queue */}
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 flex flex-col justify-between group hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Waitlist Queue</p>
            <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">
              {recruiters.filter(r => r.status === 'Pending').length}
            </h3>
            <p className="text-xs text-gray-500 font-bold leading-relaxed max-w-[200px]">
              Applications pending review
            </p>
          </div>
        </div>
      </div>
      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#000613]/80 backdrop-blur-sm" onClick={() => setShowHistory(false)}></div>
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-scale-in">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Placement History</h3>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Full engagement trail for this partner</p>
              </div>
              <button 
                onClick={() => setShowHistory(false)}
                className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all shadow-sm">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {historyLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-12 h-12 text-[#000613] animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">Retrieving Data...</p>
                </div>
              ) : selectedHistory && selectedHistory.length > 0 ? (
                <div className="space-y-4">
                  {selectedHistory.map((item: any) => (
                    <div key={item._id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:border-[#000613]/10 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-[#000613] text-white flex items-center justify-center font-black text-lg">
                          {item.student?.name?.[0]}
                        </div>
                        <div>
                          <p className="text-lg font-black text-gray-900 tracking-tight">{item.student?.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.job?.title}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="text-xs font-black text-emerald-600">{item.job?.salary}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          item.status === 'Selected' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-100' :
                          item.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {item.status}
                        </span>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase italic">
                          Updated: {new Date(item.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center font-black text-gray-300 uppercase tracking-widest italic">
                  No placement history found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRecruiters;
