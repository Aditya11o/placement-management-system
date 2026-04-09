import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Users, Mail, Shield, MapPin, Plus, Edit2, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminMember {
  id: string;
  name: string;
  email: string;
  status: string;
  adminProfile: {
    level: 'SUPER_ADMIN' | 'DEPT_ADMIN' | 'PLACEMENT_OFFICER';
    scope: string | null;
  } | null;
}

const AdminTeam: React.FC = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    level: 'DEPT_ADMIN' as any,
    scope: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const branches = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'MBA', 'MCA'];

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const { data } = await api.get('/admin/team');
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/invite', formData);
      setMessage({ type: 'success', text: `Invitation sent to ${formData.email}` });
      setIsInviteModalOpen(false);
      setFormData({ name: '', email: '', level: 'DEPT_ADMIN', scope: '' });
      fetchTeam();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send invitation' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    setLoading(true);
    try {
      await api.patch(`/admin/team/${selectedAdmin.id}`, {
        level: formData.level,
        scope: formData.level === 'DEPT_ADMIN' ? formData.scope : null
      });
      setMessage({ type: 'success', text: 'Admin permissions updated successfully' });
      setIsEditModalOpen(false);
      fetchTeam();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update' });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (admin: AdminMember) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      level: admin.adminProfile?.level || 'DEPT_ADMIN',
      scope: admin.adminProfile?.scope || ''
    });
    setIsEditModalOpen(true);
  };

  const filteredAdmins = admins.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="pt-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admin Team</h1>
          <p className="text-base text-gray-500 font-bold mt-2 leading-relaxed max-w-3xl italic">
            Manage your administrative hierarchy, invite departmental heads, and designate placement officers.
          </p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-[#000613] text-white px-6 py-3 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-2xl shadow-black/10 shrink-0"
        >
          <Plus size={18} />
          Invite Admin
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-slide-up ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-extrabold text-sm uppercase tracking-wider">{message.text}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#000613] transition-colors" size={20} />
        <input
          type="text"
          placeholder="Search admins by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-[#000613] outline-none transition-all shadow-sm"
        />
      </div>

      {/* Team Table */}
      <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-200/50">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b-2 border-gray-100">Administrator</th>
              <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b-2 border-gray-100">Level</th>
              <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b-2 border-gray-100">Scope</th>
              <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b-2 border-gray-100">Status</th>
              <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b-2 border-gray-100">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center italic text-gray-400 font-bold">Loading team members...</td>
              </tr>
            ) : filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center italic text-gray-400 font-bold">No administrators found.</td>
              </tr>
            ) : filteredAdmins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50/30 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-900 font-black text-lg group-hover:scale-110 transition-transform">
                      {admin.name[0]}
                    </div>
                    <div>
                      <div className="font-black text-gray-900 text-sm tracking-tight">{admin.name}</div>
                      <div className="text-xs font-bold text-gray-400 lowercase">{admin.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                    admin.adminProfile?.level === 'SUPER_ADMIN' ? 'bg-indigo-50 text-indigo-600' :
                    admin.adminProfile?.level === 'DEPT_ADMIN' ? 'bg-amber-50 text-amber-600' :
                    'bg-cyan-50 text-cyan-600'
                  }`}>
                    {admin.adminProfile?.level?.replace('_', ' ') || 'LEGACY ADMIN'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-widest">
                    <MapPin size={14} className="text-gray-400" />
                    {admin.adminProfile?.scope || 'Institutional'}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`w-2 h-2 rounded-full inline-block mr-2 ${
                    admin.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}></span>
                  <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{admin.status}</span>
                </td>
                <td className="px-8 py-6">
                  <button 
                    onClick={() => openEditModal(admin)}
                    disabled={admin.id === user?.id}
                    className={`p-3 rounded-xl transition-all ${
                      admin.id === user?.id ? 'opacity-20 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    <Edit2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-on-surface">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-scale-up border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Invite Administrator</h2>
            <p className="text-sm font-bold text-gray-400 mt-2 italic">Send a secure invitation to join the admin team.</p>
            
            <form onSubmit={handleInvite} className="mt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#000613] focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#000613] focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all"
                    placeholder="john@institution.edu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Access Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value as any})}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#000613] rounded-2xl py-4 px-4 text-sm font-bold outline-none"
                  >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="DEPT_ADMIN">Dept Admin</option>
                    <option value="PLACEMENT_OFFICER">Placement Officer</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Branch Scope</label>
                  <select
                    disabled={formData.level !== 'DEPT_ADMIN'}
                    value={formData.scope}
                    onChange={(e) => setFormData({...formData, scope: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#000613] rounded-2xl py-4 px-4 text-sm font-bold outline-none disabled:opacity-30"
                  >
                    <option value="">N/A</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-black text-sm text-gray-500 hover:bg-gray-100 transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#000613] text-white px-6 py-4 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest shadow-xl shadow-black/10"
                >
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-on-surface">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-scale-up border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Edit Permissions</h2>
            <p className="text-sm font-bold text-gray-400 mt-2 italic">Update access level and scope for {formData.name}.</p>
            
            <form onSubmit={handleUpdate} className="mt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Access Level</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value as any})}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#000613] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all"
                  >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="DEPT_ADMIN">Dept Admin</option>
                    <option value="PLACEMENT_OFFICER">Placement Officer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Branch Scope</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    disabled={formData.level !== 'DEPT_ADMIN'}
                    value={formData.scope}
                    onChange={(e) => setFormData({...formData, scope: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#000613] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all disabled:opacity-30"
                  >
                    <option value="">Institutional (All)</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-black text-sm text-gray-500 hover:bg-gray-100 transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#000613] text-white px-6 py-4 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest shadow-xl shadow-black/10"
                >
                  {loading ? 'Saving...' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeam;
