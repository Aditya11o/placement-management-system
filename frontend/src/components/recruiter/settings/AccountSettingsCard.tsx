import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import api from '../../../api';
import Avatar from '../../Avatar';

const AccountSettingsCard: React.FC = () => {
  const { user, profile, refreshUser } = useAuth();
  const { showSuccess, showError } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: profile?.recruiterDetails?.phone || '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user && profile) {
      setAccountData({
        name: user.name,
        email: user.email,
        phone: profile.recruiterDetails?.phone || '',
      });
    }
  }, [user, profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      formData.append('recruiterDetails', JSON.stringify({
        ...profile?.recruiterDetails,
        phone: accountData.phone,
      }));

      await api.put('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      await refreshUser();
      setAvatarFile(null);
      setAvatarPreview(null);
      showSuccess('Profile updated successfully!', 'Settings Updated');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Account Settings</h2>
        <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-gray-100">Primary</span>
      </div>

      <div className="flex flex-col md:flex-row gap-10 items-start">
        {/* Profile Photo Upload */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Profile Photo</label>
          <div className="relative group">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 bg-gray-50 rounded-[28px] border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center group-hover:border-gray-900 transition-all cursor-pointer"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Avatar 
                  name={user?.name || ''} 
                  profilePhoto={profile?.profile_photo} 
                  size="xl" 
                  className="w-full h-full object-cover" 
                />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleAvatarChange} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-900 shadow-xl hover:scale-110 active:scale-95 transition-all"
            >
              <Upload size={18} />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 font-bold text-center leading-tight">JPG, PNG up to 5MB</p>
        </div>

        {/* Account Fields */}
        <div className="flex-1 w-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Recruiter Name</label>
              <input 
                type="text" 
                value={accountData.name}
                readOnly
                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-xl font-bold text-gray-400 text-[14px] outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
              <input 
                type="email" 
                value={accountData.email}
                readOnly
                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-xl font-bold text-gray-400 text-[14px] outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
              <input 
                type="tel" 
                value={accountData.phone}
                onChange={e => setAccountData({...accountData, phone: e.target.value})}
                placeholder="+1 (555) 000-0000"
                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-xl font-bold text-gray-900 text-[14px] outline-none transition-all"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <button 
              onClick={handleUpdateProfile}
              disabled={loading}
              className="px-10 py-4 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center gap-3 active:scale-95 group disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : 'Update Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsCard;
