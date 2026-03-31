import React, { useState, useEffect, useRef } from 'react';
import { User, Camera, Save, Key, Loader2 } from 'lucide-react';
import api from '../../../api';
import { useNotification } from '../../../context/NotificationContext';

const AccountTab: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    profilePhoto: ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/me');
      setProfileData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        profilePhoto: data.profilePhoto || ''
      });
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to load profile details', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      await api.patch('/admin/me', profileData);
      
      await fetchAdminProfile();
      showSuccess('Your profile has been updated successfully', 'Profile Updated');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update profile', 'Update Error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New passwords do not match', 'Validation Error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showError('Password must be at least 6 characters long', 'Validation Error');
      return;
    }

    try {
      setPasswordSaving(true);
      await api.put('/auth/update-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      showSuccess('Your password has been changed securely', 'Security Updated');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to change password', 'Security Error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showError('Image size should be less than 2MB', 'File Too Large');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, profilePhoto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 md:w-12 md:h-12 text-[#000613] animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Account Settings Card */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm group relative overflow-hidden">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#000613] group-hover:rotate-12 transition-transform">
            <User size={24} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Admin Account Settings</h2>
        </div>

        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-10 group/photo">
          <div className="relative">
            <div className="w-32 h-32 rounded-[2.5rem] bg-gray-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center relative bg-[#000613]">
              {profileData.profilePhoto ? (
                <img 
                  src={profileData.profilePhoto} 
                  alt="Admin" 
                  className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform duration-500"
                />
              ) : (
                <span className="text-4xl font-black text-white capitalize">{profileData.name?.[0] || 'A'}</span>
              )}
              <div 
                onClick={triggerFileInput}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <div 
              onClick={triggerFileInput}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#000613] rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
            >
              <Camera size={16} />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handlePhotoUpload}
            />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-6 italic">Click icon to upload photo</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 italic text-gray-400">Admin Name</label>
            <input 
              type="text" 
              value={profileData.name}
              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              placeholder="Full Name"
              className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 italic text-gray-400">Email Address</label>
            <input 
              type="email" 
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              placeholder="Email Address"
              className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 italic text-gray-400">Phone Number</label>
            <input 
              type="text" 
              value={profileData.phone}
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              placeholder="+1 (555) 000-0000"
              className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
            />
          </div>
          <button 
            onClick={handleProfileUpdate}
            disabled={saving}
            className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-[#000613] text-white rounded-2xl font-black text-sm shadow-xl shadow-black/10 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 transition-all active:scale-[0.98] group mt-8"
          >
            {saving ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Save size={20} className="group-hover:rotate-12 transition-transform" />
            )}
            {saving ? 'Saving Changes...' : 'Update Profile'}
          </button>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm group h-fit">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#000613] group-hover:rotate-12 transition-transform">
            <Key size={24} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Change Password</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 italic text-gray-400">Current Password</label>
            <input 
              type="password" 
              value={passwordData.oldPassword}
              onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 italic text-gray-400">New Password</label>
            <input 
              type="password" 
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 italic text-gray-400">Confirm New Password</label>
            <input 
              type="password" 
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
            />
          </div>
          <button 
            onClick={handlePasswordUpdate}
            disabled={passwordSaving || !passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            className="w-full py-5 bg-white text-[#000613] border-4 border-[#000613] rounded-2xl font-black text-sm hover:bg-[#000613] hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-[#000613] transition-all mt-8 flex justify-center items-center gap-2"
          >
            {passwordSaving && <Loader2 size={16} className="animate-spin" />}
            {passwordSaving ? 'Updating...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountTab;
