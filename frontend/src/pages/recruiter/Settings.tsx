import React, { useState, useEffect, useRef } from 'react';
import { 
  User as UserIcon, Lock, Bell, Building2, 
  Upload, Camera, 
  AlertTriangle, Shield, 
  MapPin, ChevronRight, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../api';
import Avatar from '../../components/Avatar';

const Settings: React.FC = () => {
  const { user, profile, refreshUser, logout } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [activeMenu, setActiveMenu] = useState('Account Settings');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [accountData, setAccountData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: profile?.recruiterDetails?.phone || '',
  });

  const [companyData, setCompanyData] = useState({
    name: profile?.recruiterDetails?.companyName || '',
    website: profile?.recruiterDetails?.companyWebsite || '',
    location: profile?.recruiterDetails?.location || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailSummary: true,
    interviewAlerts: true,
    applicationAlerts: true,
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
      setCompanyData({
        name: profile.recruiterDetails?.companyName || '',
        website: profile.recruiterDetails?.companyWebsite || '',
        location: profile.recruiterDetails?.location || '',
      });
    }
    fetchSettings();
  }, [user, profile]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings/recruiter');
      setNotificationSettings(response.data.notifications);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

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
        companyName: companyData.name,
        companyWebsite: companyData.website,
        location: companyData.location,
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

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      return showError('Please fill in all password fields');
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return showError('Passwords do not match');
    }
    setLoading(true);
    try {
      await api.put('/auth/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      showSuccess('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await api.put('/settings/recruiter', {
        notifications: notificationSettings
      });
      showSuccess('Notification preferences saved!');
    } catch (err: any) {
      showError('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (window.confirm('Are you absolutely sure? This will deactivate your account and log you out.')) {
      try {
        await api.delete('/auth/deactivate');
        logout();
      } catch (err: any) {
        showError('Failed to deactivate account');
      }
    }
  };

  const menuItems = [
    { id: 'Account Settings', icon: <UserIcon size={18} /> },
    { id: 'Security', icon: <Lock size={18} /> },
    { id: 'Notifications', icon: <Bell size={18} /> },
    { id: 'Company Details', icon: <Building2 size={18} /> },
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 text-[15px] mt-1 font-medium">Manage your account preferences and company information.</p>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        
        {/* Left Settings Menu */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white border border-gray-100 rounded-[24px] p-4 shadow-sm space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all group ${
                  activeMenu === item.id 
                    ? 'bg-[#000613] text-white shadow-xl shadow-black/10' 
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`${activeMenu === item.id ? 'text-white' : 'text-gray-300 group-hover:text-gray-900'} transition-colors`}>
                    {item.icon}
                  </div>
                  <span className="text-[13px] font-black tracking-tight">{item.id}</span>
                </div>
                {activeMenu === item.id && <ChevronRight size={14} className="opacity-40" />}
              </button>
            ))}
          </div>
        </div>

        {/* Right Settings Content */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          
          {/* Account Settings Card */}
          <div className={`bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm ${activeMenu !== 'Account Settings' && 'hidden'}`}>
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

          {/* Change Password Card */}
          <div className={`bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm ${activeMenu !== 'Security' && 'hidden'}`}>
            <div className="flex items-center gap-3 mb-8">
              <Shield size={20} className="text-gray-400" />
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Change Password</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Current Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-xl font-bold text-gray-900 text-[14px] outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-xl font-bold text-gray-900 text-[14px] outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-xl font-bold text-gray-900 text-[14px] outline-none transition-all"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleChangePassword}
                disabled={loading}
                className="px-10 py-4 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center gap-3 active:scale-95 group disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : 'Change Password'}
              </button>
            </div>
          </div>

          {/* Settings Grid (Notifications & Company) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Notification Settings Card */}
            <div className={`bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm flex flex-col h-full ${activeMenu !== 'Notifications' && 'hidden md:flex'}`}>
              <div className="flex items-center gap-3 mb-8">
                <Bell size={20} className="text-gray-400" />
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Notification Settings</h2>
              </div>

              <div className="space-y-6 flex-1">
                {[
                  { id: 'emailSummary', label: 'Email Notifications', desc: 'Receive weekly summary emails' },
                  { id: 'interviewAlerts', label: 'Interview Notifications', desc: 'Alerts for upcoming interviews' },
                  { id: 'applicationAlerts', label: 'Application Notifications', desc: 'Real-time new applicant alerts' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between group">
                    <div className="space-y-1">
                      <p className="text-[13px] font-black text-gray-900 tracking-tight leading-none">{item.label}</p>
                      <p className="text-[11px] font-bold text-gray-400">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => setNotificationSettings(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                      className={`w-12 h-6 rounded-full transition-all relative ${notificationSettings[item.id as keyof typeof notificationSettings] ? 'bg-gray-900' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${notificationSettings[item.id as keyof typeof notificationSettings] ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-50 items-center justify-center flex">
                 <button 
                  onClick={handleSaveNotifications}
                  disabled={loading}
                  className="w-full py-4 border-2 border-gray-900 text-gray-900 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin inline mr-2" size={14} /> : 'Save Preferences'}
                </button>
              </div>
            </div>

            {/* Company Settings Card */}
            <div className={`bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm h-full flex flex-col ${activeMenu !== 'Company Details' && 'hidden md:flex'}`}>
              <div className="flex items-center gap-3 mb-8">
                <Building2 size={20} className="text-gray-400" />
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Company Settings</h2>
              </div>

              <div className="space-y-6 flex-1">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Company Name</label>
                  <input 
                    type="text" 
                    value={companyData.name}
                    onChange={e => setCompanyData({...companyData, name: e.target.value})}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-xl font-bold text-gray-900 text-[14px] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Company Website</label>
                  <div className="relative flex items-center">
                    <input 
                      type="text" 
                      value={companyData.website}
                      onChange={e => setCompanyData({...companyData, website: e.target.value})}
                      placeholder="e.g. acme.com"
                      className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-xl font-bold text-gray-900 text-[14px] outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Company Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      value={companyData.location}
                      onChange={e => setCompanyData({...companyData, location: e.target.value})}
                      placeholder="e.g. Bangalore, India"
                      className="w-full pl-11 pr-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-xl font-bold text-gray-900 text-[14px] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-50 items-center justify-center flex">
                 <button 
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="w-full py-4 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-50"
                 >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : 'Update Company Info'}
                </button>
              </div>
            </div>

          </div>

          {/* Deactivate Account */}
          <div className={`bg-red-50 border border-red-100 rounded-[32px] p-8 flex flex-col md:flex-row justify-between items-center gap-6 ${activeMenu !== 'Security' && 'hidden'}`}>
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm border border-red-50 flex-shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-red-900 tracking-tight leading-none">Deactivate Account</h3>
                <p className="text-[13px] font-medium text-red-600 max-w-sm">
                  Permanently deactivate your recruiter account. This will log you out immediately.
                </p>
              </div>
            </div>
            <button 
              onClick={handleDeactivate}
              className="px-10 py-4 bg-red-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 active:scale-95"
            >
              Deactivate
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Settings;
