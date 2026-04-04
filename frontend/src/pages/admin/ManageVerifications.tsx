import React, { useState, useEffect } from 'react';
import { 
  Search, ExternalLink, 
  Shield, User, CheckCircle, XCircle, X
} from 'lucide-react';
import api from '../../api';
import ListSkeleton from '../../components/skeletons/ListSkeleton';
import { useNotification } from '../../context/NotificationContext';

const ManageVerifications: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/verifications');
      setVerifications(data);
    } catch (err: any) {
      console.error(err);
      showError('Failed to fetch verification requests', 'Fetch Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleAction = async (profileId: string, verificationId: string, status: 'Verified' | 'Rejected') => {
    try {
      await api.patch(`/admin/verifications/${profileId}/${verificationId}`, { status });
      fetchVerifications();
      showSuccess(`Skill ${status.toLowerCase()}ed successfully!`, 'Verification');
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || `Failed to ${status.toLowerCase()} skill`, 'Update Error');
    }
  };

  const handleBulkAction = async (status: 'Verified' | 'Rejected') => {
    try {
      setSubmitting(true);
      const requests = selectedIds.map(id => {
        const [profileId, verificationId] = id.split(':');
        return { profileId, verificationId };
      });
      await api.patch('/admin/verifications/bulk', { requests, status });
      showSuccess(`Bulk ${status.toLowerCase()}ed ${selectedIds.length} skills!`, 'Bulk Action Success');
      setSelectedIds([]);
      fetchVerifications();
    } catch (err: any) {
      showError('Failed to process bulk request', 'Bulk Error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(v => `${v.profileId}:${v.verificationId}`));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filtered = verifications.filter(v => 
    v.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.skill.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && verifications.length === 0) {
    return <ListSkeleton />;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-24 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic">Skill <span className="text-blue-600">Verification</span> Center</h1>
          <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest text-[10px]">Validating student technical assertions and credentials.</p>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 italic tabular-nums">Pending: {verifications.length}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by student or skill matrix..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50/50 border border-transparent rounded-2xl pl-12 pr-4 py-3.5 text-sm font-black uppercase tracking-tight focus:bg-white focus:border-blue-600 outline-none transition-all"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 w-12 text-center">
                  <input 
                    type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Identity Control</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-center">Assertion</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-center">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-center">Evidence</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-right">Goverance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((v, i) => {
                const id = `${v.profileId}:${v.verificationId}`;
                return (
                  <tr key={i} className={`hover:bg-gray-50/30 transition-colors group ${selectedIds.includes(id) ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-8 py-6 text-center">
                      <input 
                        type="checkbox"
                        checked={selectedIds.includes(id)}
                        onChange={() => toggleSelect(id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center font-black group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner shadow-black/5">
                          <User size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-gray-900 leading-tight uppercase italic tracking-tighter">{v.userName}</h4>
                          <p className="text-[10px] font-bold text-gray-400 lowercase tracking-tight mt-0.5">{v.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-4 py-2 bg-[#000613] text-white text-[10px] font-black uppercase rounded-xl tracking-[0.2em] shadow-xl shadow-black/20 italic">
                        {v.skill}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center gap-1 text-gray-500 font-black text-[10px] italic uppercase tracking-widest tabular-nums leading-none">
                        <span className="text-gray-900">{new Date(v.appliedAt).toLocaleDateString()}</span>
                        <span className="text-gray-300 text-[8px]">{new Date(v.appliedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center text-[#ff6a00c2]">
                      <a 
                        href={v.certificateUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-3 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] hover:text-blue-900 transition-all italic border-b-2 border-blue-600/10 pb-0.5 group/link"
                      >
                        Verification Object <ExternalLink size={14} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                      </a>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleAction(v.profileId, v.verificationId, 'Verified')}
                          className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-xl shadow-emerald-500/10 active:scale-95"
                          title="Approve Protocol"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button 
                          onClick={() => handleAction(v.profileId, v.verificationId, 'Rejected')}
                          className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-xl shadow-rose-500/10 active:scale-95"
                          title="Reject Assertion"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-24 text-center text-gray-400 font-black italic uppercase tracking-[0.4em]">
                    <Shield size={64} className="mx-auto text-gray-50 mb-6 group-hover:scale-125 transition-transform duration-1000" />
                    Zero pending assertions in system memory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#000613] text-white px-8 py-6 rounded-[32px] shadow-2xl flex items-center gap-10 z-[100] animate-in slide-in-from-bottom-20 duration-700 border border-white/5 ring-1 ring-white/10 group">
          <div className="flex items-center gap-4 pr-10 border-r border-white/10">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner shadow-blue-400/50">{selectedIds.length}</div>
            <div className="flex flex-col">
              <span className="text-[12px] font-black uppercase tracking-[0.3em] text-blue-400">Queue Items</span>
              <span className="text-[9px] font-bold text-gray-500 italic uppercase tracking-widest">Selected cluster</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button 
              onClick={() => handleBulkAction('Verified')}
              disabled={submitting}
              className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-emerald-500/20 disabled:opacity-50"
            >
              <CheckCircle size={18} /> Approve Cluster
            </button>
            <button 
              onClick={() => handleBulkAction('Rejected')}
              disabled={submitting}
              className="flex items-center gap-3 px-8 py-4 bg-rose-600 hover:bg-rose-700 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-rose-500/20 ring-1 ring-white/10 disabled:opacity-50"
            >
              <XCircle size={18} /> Reject Batch
            </button>
          </div>
          <button 
            onClick={() => setSelectedIds([])}
            className="p-3 text-gray-500 hover:text-white transition-colors ml-4 bg-white/5 rounded-full hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>
      )}

    </div>
  );
};

export default ManageVerifications;
