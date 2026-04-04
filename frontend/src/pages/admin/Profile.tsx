import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Shield, Camera, Save, Loader2 } from 'lucide-react';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import ProfileSkeleton from '../../components/skeletons/ProfileSkeleton';

const AdminProfile: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const { refreshUser } = useAuth();
  
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    } catch (error: any) {
      console.error('Error fetching admin profile:', error);
      showError(error.response?.data?.message || 'Failed to fetch admin profile', 'Fetch Error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profilePhoto: reader.result as string
        });
      };
      reader.readAsDataURL(file);
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
      
      showSuccess('Admin profile updated successfully!', 'Profile Update');
      await fetchProfile();
      await refreshUser(); // Sync navbar photo
    } catch (error: any) {
       console.error('Error updating profile:', error);
       showError(error.response?.data?.message || 'Failed to update admin profile', 'Update Error');
    } finally {
       setSaving(false);
    }
  };

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="w-full flex justify-center py-6 px-4">
      <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-xl border border-gray-100 flex flex-col overflow-hidden">
        {/* Header/Cover - Fixed at top */}
        <div className="h-28 bg-[#000613] relative shrink-0 z-10 w-full">
          {/* Avatar positioned halfway down the cover */}
          <div className="absolute -bottom-10 left-8 md:left-12">
            <div className="relative group">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
              <div className="h-24 w-24 rounded-3xl bg-white p-1 shadow-lg">
                <img 
                  src={formData.profilePhoto || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop"} 
                  className="h-full w-full object-cover rounded-[1.25rem]"
                  alt="Avatar" 
                />
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-1.5 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-110 transition-all z-20"
              >
                <Camera size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="pt-16 px-8 pb-8 md:px-12 md:pb-10 bg-white z-0">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                {adminData.name} <Shield size={20} className="text-blue-600" />
              </h1>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                System Administrator • {adminData.email}
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 transition-all truncate"
              />
            </div>

            <div className="md:col-span-2 pt-4">
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
