import React, { useState } from 'react';
import { 
  User, Lock, Bell, Building2, 
  Upload, Camera, 
  AlertTriangle, Shield, 
  MapPin, ChevronRight
} from 'lucide-react';

const Settings: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('Account Settings');

  const menuItems = [
    { id: 'Account Settings', icon: <User size={18} /> },
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
                  <div className="w-32 h-32 bg-gray-50 rounded-[28px] border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center group-hover:border-gray-900 transition-all">
                    <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alexander" 
                      alt="Profile" 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-900 shadow-xl hover:scale-110 active:scale-95 transition-all">
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
                      defaultValue="Alexander Sterling"
                      className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-xl font-bold text-gray-900 text-[14px] outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue="alexander.sterling@academicauthority.edu"
                      className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-xl font-bold text-gray-900 text-[14px] outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
                    <input 
                      type="tel" 
                      defaultValue="+1 (555) 902-1234"
                      className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-xl font-bold text-gray-900 text-[14px] outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button className="px-10 py-4 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center gap-3 active:scale-95 group">
                    Update Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
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
                  className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-xl font-bold text-gray-900 text-[14px] outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-xl font-bold text-gray-900 text-[14px] outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-xl font-bold text-gray-900 text-[14px] outline-none transition-all"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button className="px-10 py-4 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center gap-3 active:scale-95 group">
                Change Password
              </button>
            </div>
          </div>

          {/* Settings Grid (Notifications & Company) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Notification Settings Card */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm flex flex-col h-full">
              <div className="flex items-center gap-3 mb-8">
                <Bell size={20} className="text-gray-400" />
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Notification Settings</h2>
              </div>

              <div className="space-y-6 flex-1">
                {[
                  { id: 1, label: 'Email Notifications', desc: 'Receive weekly summary emails', active: true },
                  { id: 2, label: 'Interview Notifications', desc: 'Alerts for upcoming interviews', active: true },
                  { id: 3, label: 'Application Notifications', desc: 'Real-time new applicant alerts', active: false },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between group">
                    <div className="space-y-1">
                      <p className="text-[13px] font-black text-gray-900 tracking-tight leading-none">{item.label}</p>
                      <p className="text-[11px] font-bold text-gray-400">{item.desc}</p>
                    </div>
                    <button className={`w-12 h-6 rounded-full transition-all relative ${item.active ? 'bg-gray-900' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${item.active ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-50 items-center justify-center flex">
                 <button className="w-full py-4 border-2 border-gray-900 text-gray-900 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all active:scale-95">
                  Save Preferences
                </button>
              </div>
            </div>

            {/* Company Settings Card */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm h-full flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <Building2 size={20} className="text-gray-400" />
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Company Settings</h2>
              </div>

              <div className="space-y-6 flex-1">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Company Name</label>
                  <input 
                    type="text" 
                    defaultValue="The Academic Authority"
                    className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-xl font-bold text-gray-900 text-[14px] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Company Website</label>
                  <div className="relative flex items-center">
                    <input 
                      type="text" 
                      defaultValue="https://academicauthority.edu"
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
                      defaultValue="San Francisco, CA"
                      className="w-full pl-11 pr-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-xl font-bold text-gray-900 text-[14px] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-50 items-center justify-center flex">
                 <button className="w-full py-4 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 active:scale-95">
                  Update Company Info
                </button>
              </div>
            </div>

          </div>

          {/* Deactivate Account */}
          <div className="bg-red-50 border border-red-100 rounded-[32px] p-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm border border-red-50 flex-shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-red-900 tracking-tight leading-none">Deactivate Account</h3>
                <p className="text-[13px] font-medium text-red-600 max-w-sm">
                  Permanently delete your recruiter account and all associated data. This action cannot be undone.
                </p>
              </div>
            </div>
            <button className="px-10 py-4 bg-red-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 active:scale-95">
              Deactivate
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Settings;
