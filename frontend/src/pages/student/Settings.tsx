import React, { useState } from 'react';
import { 
  User, Lock, FileText, Bell, 
  Shield, AlertCircle, LogOut, ChevronRight, 
  Trash2, Upload, Camera, X
} from 'lucide-react';

const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState({
    jobs: true,
    apps: true,
    interviews: true,
    email: false,
    sms: false
  });

  const [privacy, setPrivacy] = useState({
    visible: true,
    showPhone: false,
    showEmail: true
  });

  const Toggle = ({ enabled, onClick }: { enabled: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-blue-900' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1 block">Preferences</span>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 font-bold mt-1 tracking-tight">Manage your account preferences, privacy, and notifications.</p>
      </div>

      <div className="grid grid-cols-12 gap-6 mt-6">
        
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Account Settings Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                <User size={20} className="text-gray-900" />
              </div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Account Settings</h2>
            </div>

            <div className="space-y-8">
              {/* Profile Photo */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <Camera size={14} />
                  </button>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-base font-black text-gray-900 tracking-tight mb-1">Upload New Photo</h3>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">JPG, GIF or PNG. Max size of 800K</p>
                  <button className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-gray-400 transition-all shadow-sm">
                    Choose File
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue="Alex Henderson"
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-bold text-gray-900 outline-none focus:border-gray-300 focus:bg-white transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue="alex.h@university.edu"
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-bold text-gray-900 outline-none focus:border-gray-300 focus:bg-white transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input 
                    type="text" 
                    defaultValue="+1 (555) 000-1234"
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-bold text-gray-900 outline-none focus:border-gray-300 focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                <button className="px-6 py-3 text-gray-500 text-[11px] font-black uppercase tracking-widest hover:text-gray-900 transition-all">
                  Change Email
                </button>
                <button className="px-8 py-3 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-black/10 active:scale-95">
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Password Settings Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                <Lock size={20} className="text-gray-900" />
              </div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Password Settings</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                <input 
                  type="password" 
                  defaultValue="••••••••"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-bold text-gray-900 outline-none focus:border-gray-300 focus:bg-white transition-all shadow-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                  <input 
                    type="password" 
                    placeholder="Min. 8 characters"
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-bold text-gray-900 outline-none focus:border-gray-300 focus:bg-white transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    placeholder="Confirm new password"
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-bold text-gray-900 outline-none focus:border-gray-300 focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-50">
                <button className="px-8 py-3 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-black/10 active:scale-95">
                  Update Password
                </button>
              </div>
            </div>
          </div>

          {/* Resume Settings Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                <FileText size={20} className="text-gray-900" />
              </div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Resume Settings</h2>
            </div>

            <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                    <FileText className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900 uppercase">Alex_Henderson_Resume_2024.pdf</h4>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Uploaded on March 12, 2024</p>
                  </div>
                </div>
                <button className="text-gray-300 hover:text-rose-500 transition-colors p-2">
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-8">
                <div className="bg-blue-900 h-1.5 rounded-full w-full shadow-[0_0_10px_rgba(30,58,138,0.3)]" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <select className="w-full pl-5 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-[12px] font-bold text-gray-700 outline-none appearance-none cursor-pointer">
                    <option>Alex_Henderson_Resume_2024.pdf</option>
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={16} />
                </div>
                <button className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-gray-400 transition-all shadow-sm flex items-center justify-center gap-2">
                  <Upload size={14} />
                  <span>Upload New Resume</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Notification Settings Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                <Bell size={20} className="text-gray-900" />
              </div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Notification Settings</h2>
            </div>

            <div className="space-y-6">
              {[
                { key: 'jobs', label: 'Job Notifications' },
                { key: 'apps', label: 'Application Status Updates' },
                { key: 'interviews', label: 'Interview Notifications' },
                { key: 'email', label: 'Email Notifications' },
                { key: 'sms', label: 'SMS Notifications' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="text-[13px] font-black text-gray-600 uppercase tracking-tight">{item.label}</span>
                  <Toggle 
                    enabled={notifications[item.key as keyof typeof notifications]} 
                    onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifications] }))} 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Settings Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                <Shield size={20} className="text-gray-900" />
              </div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Privacy Settings</h2>
            </div>

            <div className="space-y-8">
              {[
                { key: 'visible', label: 'Make Profile Visible to Companies', desc: 'Allow recruiters to search for your profile in the database.' },
                { key: 'showPhone', label: 'Show Phone Number to Recruiters', desc: 'Contact information will be visible to matched companies.' },
                { key: 'showEmail', label: 'Show Email to Recruiters', desc: 'Official university email will be visible for outreach.' }
              ].map((item) => (
                <div key={item.key} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-[13px] font-black text-gray-900 leading-tight pr-4">{item.label}</span>
                    <Toggle 
                      enabled={privacy[item.key as keyof typeof privacy]} 
                      onClick={() => setPrivacy(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof privacy] }))} 
                    />
                  </div>
                  <p className="text-[11px] font-bold text-gray-400 leading-relaxed italic">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Account Actions Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                <AlertCircle size={20} className="text-gray-900" />
              </div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Account Actions</h2>
            </div>

            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl group transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400 group-hover:text-gray-900">
                    <X size={18} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-gray-900 tracking-tight">Deactivate Account</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Temporarily hide your profile</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-rose-50 rounded-2xl group transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-rose-100">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-rose-400 group-hover:text-rose-600">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-rose-900 tracking-tight">Delete Account</h4>
                    <p className="text-[10px] font-bold text-rose-300 uppercase tracking-wider mt-0.5">Permanently remove all data</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-rose-300 group-hover:text-rose-500" />
              </button>

              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('userInfo');
                  window.location.href = '/login';
                }}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl group transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400 group-hover:text-gray-900">
                    <LogOut size={18} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-gray-900 tracking-tight">Logout</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Sign out of your session</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Settings;
