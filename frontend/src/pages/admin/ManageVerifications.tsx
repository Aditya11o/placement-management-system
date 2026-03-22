import React, { useState, useEffect } from 'react';
import { 
  Check, X, Search, ExternalLink, 
  Clock, Shield, User, Loader2 
} from 'lucide-react';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

const ManageVerifications: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filtered = verifications.filter(v => 
    v.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.skill.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic">Skill <span className="text-blue-600">Verification</span> Requests</h1>
        <p className="text-sm font-bold text-gray-400 mt-1">Review and validate student skill claims by checking their certificates.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by student or skill..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Student</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Skill to Verify</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Applied On</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Certificate</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((v, i) => (
                <tr key={i} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black group-hover:scale-110 transition-transform shadow-sm">
                        <User size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-gray-900 leading-tight uppercase italic">{v.userName}</h4>
                        <p className="text-[10px] font-bold text-gray-400 lowercase">{v.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1.5 bg-blue-950 text-white text-[10px] font-black uppercase rounded-lg tracking-widest shadow-lg shadow-blue-900/10 italic">
                      {v.skill}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-gray-500 font-bold text-xs italic">
                      <Clock size={14} />
                      {new Date(v.appliedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <a 
                      href={v.certificateUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline group-hover:gap-3 transition-all"
                    >
                      View Cert <ExternalLink size={14} />
                    </a>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => handleAction(v.profileId, v.verificationId, 'Verified')}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        onClick={() => handleAction(v.profileId, v.verificationId, 'Rejected')}
                        className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400 font-bold italic uppercase tracking-widest">
                    <Shield size={48} className="mx-auto text-gray-100 mb-4" />
                    No pending verification requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ManageVerifications;
