import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Camera, Save, Loader2 } from 'lucide-react';
import api from '../../api';

const AdminProfile: React.FC = () => {
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profilePhoto: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/admin/me');
      setAdminData(data);
      setFormData({
        name: data.name,
        email: data.email,
        profilePhoto: data.profilePhoto || ''
      });
    } catch (error) {
      console.error('Error fetching admin profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/admin/me', {
         name: formData.name,
         profilePhoto: formData.profilePhoto
      });
      alert('Profile updated successfully!');
      fetchProfile();
    } catch (error) {
       console.error('Error updating profile:', error);
    } finally {
       setSaving(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
        {/* Header/Cover */}
        <div className="h-40 bg-[#000613] relative">
          <div className="absolute -bottom-16 left-12">
            <div className="relative group">
              <div className="h-32 w-32 rounded-3xl bg-white p-1 shadow-2xl">
                <img 
                  src={formData.profilePhoto || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop"} 
                  className="h-full w-full object-cover rounded-[1.25rem]"
                  alt="Avatar" 
                />
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-110 transition-all">
                <Camera size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-20 px-12 pb-12">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                {adminData.name} <Shield size={24} className="text-blue-600" />
              </h1>
              <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">
                System Administrator • {adminData.email}
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-2xl text-sm font-medium text-gray-500"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Profile Photo URL</label>
              <input 
                type="text"
                value={formData.profilePhoto}
                onChange={(e) => setFormData({...formData, profilePhoto: e.target.value})}
                placeholder="Enter image URL..."
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div className="md:col-span-2 pt-6">
              <button 
                type="submit"
                disabled={saving}
                className="w-full md:w-auto px-10 py-4 bg-[#000613] text-white rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-gray-800 hover:scale-[1.02] transition-all shadow-xl shadow-black/10 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
