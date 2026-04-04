import React, { useState, useEffect } from 'react';
import { Building2, ExternalLink, MapPin, Search, UserPlus, X, Edit2, Eye, CheckCircle, Mail, XCircle } from 'lucide-react';
import ListSkeleton from '../../components/skeletons/ListSkeleton';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';
import RecruiterFormModal from '../../components/admin/RecruiterFormModal';
import RecruiterHistoryModal from '../../components/admin/RecruiterHistoryModal';
import BulkEmailModal from '../../components/admin/BulkEmailModal';

const ManageRecruiters: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHistory, setSelectedHistory] = useState<any[] | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedRecruiter, setSelectedRecruiter] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', companyName: '', website: '', industry: '', location: '' });

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      const filtered = data.filter((u: any) => u.role === 'recruiter').map((u: any) => ({
        _id: u._id,
        company: { name: u.profile?.companyName || u.profile?.recruiterDetails?.companyName || 'N/A', logo: u.profile?.companyLogo || u.profile?.recruiterDetails?.companyLogo || u.profilePhoto || (u.profile?.companyName || u.profile?.recruiterDetails?.companyName)?.[0] || 'C', website: u.profile?.website || u.profile?.recruiterDetails?.companyWebsite || '' },
        recruiter: { name: u.name, email: u.email },
        industry: u.profile?.industry || u.profile?.recruiterDetails?.industry || 'N/A',
        location: u.profile?.location || u.profile?.recruiterDetails?.location || 'N/A',
        regDate: new Date(u.createdAt).toLocaleDateString(),
        status: u.status === 'blacklisted' ? 'Blacklisted' : (u.isVerified ? 'Approved' : 'Pending'),
        rawStatus: u.status, isVerified: u.isVerified, original: u
      }));
      setRecruiters(filtered);
    } catch (err: any) { showError('Failed to fetch recruiters', 'Fetch Error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRecruiters(); }, []);

  const handleVerify = async (id: string, isVerified: boolean) => {
    try { await api.patch(`/admin/users/${id}/verify`, { isVerified }); fetchRecruiters(); showSuccess(`Recruiter ${isVerified ? 'verified' : 'unverified'} successfully!`, 'Update Status'); }
    catch (err: any) { showError(err.response?.data?.message || 'Failed to update recruiter status', 'Update Error'); }
  };

  const handleBulkStatusUpdate = async (isVerified: boolean, status?: string) => {
    try {
      setSubmitting(true);
      await api.patch('/admin/users/bulk', { userIds: selectedIds, isVerified, status });
      showSuccess(`Updated ${selectedIds.length} recruiters successfully!`, 'Bulk Update');
      setSelectedIds([]);
      fetchRecruiters();
    } catch (err: any) {
      showError('Failed to update recruiters', 'Bulk Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkEmail = async (emailData: { subject: string; message: string; title: string }) => {
    try {
      setSubmitting(true);
      await api.post('/admin/users/bulk-email', { userIds: selectedIds, ...emailData });
      showSuccess(`Sent emails to ${selectedIds.length} recruiters!`, 'Email Sent');
      setIsEmailModalOpen(false);
      setSelectedIds([]);
    } catch (err: any) {
      showError('Failed to send bulk emails', 'Email Error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRecruiters.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecruiters.map(r => r._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleViewHistory = async (id: string) => {
    try { setHistoryLoading(true); setShowHistory(true); const { data } = await api.get(`/admin/recruiters/${id}/history`); setSelectedHistory(data); }
    catch (err: any) { showError('Failed to fetch evaluation history', 'Fetch Error'); setShowHistory(false); }
    finally { setHistoryLoading(false); }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/admin/recruiters', formData); showSuccess('Recruiter added successfully!', 'Success'); setShowAddModal(false); setFormData({ name: '', email: '', password: '', companyName: '', website: '', industry: '', location: '' }); fetchRecruiters(); }
    catch (err: any) { showError(err.response?.data?.message || 'Failed to add recruiter', 'Error'); }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.patch(`/admin/users/${selectedRecruiter._id}/verify`, formData); showSuccess('Recruiter profile updated successfully!', 'Success'); setShowEditModal(false); fetchRecruiters(); }
    catch (err: any) { showError(err.response?.data?.message || 'Failed to update recruiter', 'Error'); }
  };

  const filteredRecruiters = recruiters.filter(item =>
    item.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.recruiter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.recruiter.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in relative pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight uppercase tracking-tighter">Recruitment <span className="text-blue-600">Partners</span></h1>
          <p className="text-sm text-gray-400 font-bold mt-1 max-w-2xl leading-relaxed">Strategic governance and oversight for enterprise recruitment entities.</p>
        </div>
        <button onClick={() => { setFormData({ name: '', email: '', password: '', companyName: '', website: '', industry: '', location: '' }); setShowAddModal(true); }} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#000613] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-105 transition-all"><UserPlus size={18} />Add Partner</button>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="relative flex-1 w-full max-w-lg group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#000613] transition-colors"><Search size={18} /></div>
          <input type="text" placeholder="Search company, recruiter, email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-11 pr-4 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-[#000613] focus:ring-4 focus:ring-[#000613]/5 transition-all" />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Active Nodes: {recruiters.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden min-h-[400px] p-4 lg:p-6">
        {loading ? (
          <ListSkeleton hideHeader={true} rows={8} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="bg-gray-50/50">
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox"
                    checked={selectedIds.length === filteredRecruiters.length && filteredRecruiters.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Entity / Domain</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Authorized Personnel</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sector / HQ</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap text-center">Registry</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Protocol</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Goverance</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRecruiters.map((item) => (
                  <tr key={item._id} className={`hover:bg-gray-50/50 transition-colors group ${selectedIds.includes(item._id) ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox"
                        checked={selectedIds.includes(item._id)}
                        onChange={() => toggleSelect(item._id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-110 transition-transform shadow-inner shadow-black/5">{item.company.logo && item.company.logo.length > 2 ? <img src={item.company.logo} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-xs font-black text-gray-300">{item.company.logo || 'C'}</span>}</div><div><p className="text-sm font-black text-gray-900 leading-tight uppercase tracking-tight">{item.company.name}</p>{item.company.website && item.company.website !== 'N/A' && <a href={item.company.website.startsWith('http') ? item.company.website : `https://${item.company.website}`} target="_blank" rel="noreferrer" className="text-[9px] font-bold text-gray-300 hover:text-blue-600 transition-colors flex items-center gap-1 mt-0.5 w-max tracking-wider">{item.company.website.replace(/^https?:\/\//, '')}<ExternalLink size={8} /></a>}</div></div></td>
                    <td className="px-6 py-4"><div><p className="text-[11px] font-black text-gray-900 leading-tight uppercase tracking-tight">{item.recruiter.name}</p><p className="text-[9px] font-bold text-gray-400 mt-0.5">{item.recruiter.email}</p></div></td>
                    <td className="px-6 py-4"><div><p className="text-[11px] font-black text-gray-900 uppercase tracking-tight italic">{item.industry}</p><div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5"><MapPin size={10} className="text-gray-300" />{item.location}</div></div></td>
                    <td className="px-6 py-4 text-xs font-black text-gray-400 whitespace-nowrap text-center italic tabular-nums">{item.regDate}</td>
                    <td className="px-6 py-4 text-center"><span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest italic ${item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : item.status === 'Blacklisted' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>{item.status}</span></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                        {item.status === 'Pending' && <button onClick={() => handleVerify(item._id, true)} title="Approve" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><CheckCircle size={16} /></button>}
                        {item.status !== 'Blacklisted' ? (
                          <button onClick={async () => { try { await api.patch(`/admin/users/${item._id}/verify`, { status: 'blacklisted' }); fetchRecruiters(); showSuccess('Recruiter blacklisted!', 'Action Success'); } catch (err: any) { showError(err.response?.data?.message || 'Failed', 'Error'); } }} title="Blacklist" className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><XCircle size={16} /></button>
                        ) : (
                          <button onClick={async () => { try { await api.patch(`/admin/users/${item._id}/verify`, { status: 'active' }); fetchRecruiters(); showSuccess('Recruiter activated!', 'Action Success'); } catch (err: any) { showError(err.response?.data?.message || 'Failed', 'Error'); } }} title="Activate" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><CheckCircle size={16} /></button>
                        )}
                        <button onClick={() => { setSelectedRecruiter(item); setFormData({ name: item.recruiter.name, email: item.recruiter.email, password: '', companyName: item.company.name, website: item.company.website !== 'N/A' ? item.company.website : '', industry: item.industry !== 'N/A' ? item.industry : '', location: item.location !== 'N/A' ? item.location : '' }); setShowEditModal(true); }} title="Edit" className="p-1.5 text-blue-900 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                        <button onClick={() => handleViewHistory(item._id)} title="View History" className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Eye size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRecruiters.length === 0 && !loading && <tr><td colSpan={7} className="px-6 py-20 text-center font-bold text-gray-400 italic uppercase tracking-[0.2em]">Zero match results in entity database.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest italic"><p>Showing {filteredRecruiters.length} of {recruiters.length} entities</p></div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#000613] text-white px-8 py-5 rounded-[24px] shadow-2xl flex items-center gap-10 z-[80] animate-in slide-in-from-bottom-10 duration-500 border border-white/10 group">
          <div className="flex items-center gap-3 pr-8 border-r border-white/10 text-[#000613]">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-sm shadow-inner shadow-blue-500/50 text-white">{selectedIds.length}</div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400">Selected</span>
              <span className="text-[9px] font-bold text-gray-400 italic">Partners active</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleBulkStatusUpdate(true, 'active')}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle size={16} /> Bulk Approve
            </button>
            <button 
              onClick={() => handleBulkStatusUpdate(false, 'blacklisted')}
              className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-rose-500/20 border-white/10"
            >
              <XCircle size={16} /> Blacklist Group
            </button>
            <button 
              onClick={() => setIsEmailModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              <Mail size={16} /> Batch Connect
            </button>
          </div>
          <button 
            onClick={() => setSelectedIds([])}
            className="p-2 text-gray-400 hover:text-white transition-colors ml-4"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#000613] rounded-[2rem] p-8 relative overflow-hidden group shadow-2xl border border-white/5"><div className="relative z-10 flex flex-col justify-between h-full"><div><p className="text-[10px] font-black text-blue-400/60 uppercase tracking-[0.4em] mb-3 italic">Authorized Partners</p><h3 className="text-6xl font-black text-white mb-6 tabular-nums tracking-tighter">{recruiters.filter(r => r.status === 'Approved').length}</h3></div></div><div className="absolute bottom-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000 whitespace-nowrap overflow-hidden scale-150 rotate-12"><Building2 size={240} className="text-white" /></div><div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none"></div></div>
        <div className="bg-white border border-gray-100 rounded-[2rem] p-8 flex flex-col justify-between group hover:shadow-2xl transition-all shadow-sm"><div><p className="text-[10px] font-black text-orange-400/60 uppercase tracking-[0.4em] mb-3 italic">Pipeline Queue</p><h3 className="text-5xl font-black text-gray-900 mb-6 tabular-nums tracking-tighter">{recruiters.filter(r => r.status === 'Pending').length}</h3><p className="text-xs text-gray-400 font-bold leading-relaxed max-w-[180px] uppercase tracking-wider italic">Strategic entities awaiting protocol clearance</p></div><div className="absolute top-8 right-8 w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 group-hover:rotate-12 transition-transform shadow-inner shadow-orange-500/10"><Eye size={20} /></div></div>
      </div>

      {/* Modals */}
      <RecruiterHistoryModal isOpen={showHistory} loading={historyLoading} history={selectedHistory} onClose={() => setShowHistory(false)} />
      <RecruiterFormModal isOpen={showAddModal} title="Add Recruiter" subtitle="Create a new partner account" formId="add-recruiter-form" formData={formData} onFormChange={(u) => setFormData(p => ({...p, ...u}))} onSubmit={handleAddSubmit} onClose={() => setShowAddModal(false)} submitLabel="Create Recruiter" showPassword={true} />
      <RecruiterFormModal isOpen={showEditModal && !!selectedRecruiter} title="Edit Profile" subtitle="Update partner details" formId="edit-recruiter-form" formData={formData} onFormChange={(u) => setFormData(p => ({...p, ...u}))} onSubmit={handleEditSubmit} onClose={() => setShowEditModal(false)} submitLabel="Save Changes" submitClassName="px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all text-sm uppercase tracking-widest font-black" />
      <BulkEmailModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} onSubmit={handleBulkEmail} selectedCount={selectedIds.length} submitting={submitting} />
    </div>
  );
};

export default ManageRecruiters;
