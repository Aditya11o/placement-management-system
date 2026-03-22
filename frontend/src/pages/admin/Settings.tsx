import React, { useState } from 'react';
import { 
  User, Lock, Settings as SettingsIcon, Database, 
  Upload, Download, RefreshCw, ShieldCheck, 
  Globe, Mail, Bell, Construction, 
  CheckCircle2, HardDrive, Camera,
  Shield, Key, Save, Server
} from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Account');

  const [systemToggles, setSystemToggles] = useState({
    studentRegistration: true,
    recruiterRegistration: true,
    jobApproval: true,
    emailNotifications: true,
    maintenanceMode: false
  });

  const toggleSetting = (key: keyof typeof systemToggles) => {
    setSystemToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="pt-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Settings</h1>
        <p className="text-base text-gray-500 font-bold mt-2 leading-relaxed max-w-3xl">
          Configure system parameters and manage your administrative account.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-100 pb-px">
        {['Account', 'System Settings', 'Database'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-black transition-all relative ${
              activeTab === tab ? 'text-[#000613]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#000613] rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'Account' && (
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
                  <div className="w-32 h-32 rounded-[2.5rem] bg-gray-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center relative">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                      alt="Admin" 
                      className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#000613] rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg">
                    <Camera size={16} />
                  </div>
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-6 italic">Click icon to upload photo</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-gray-300 italic">Admin Name</label>
                  <input 
                    type="text" 
                    defaultValue="Dr. Robert Harrison"
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-gray-300 italic">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue="robert.h@academic-authority.edu"
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-gray-300 italic">Phone Number</label>
                  <input 
                    type="text" 
                    defaultValue="+1 (555) 012-3456"
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
                  />
                </div>
                <button className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-[#000613] text-white rounded-2xl font-black text-sm shadow-xl shadow-black/10 hover:scale-[1.02] transition-all active:scale-[0.98] group mt-8">
                  <Save size={20} className="group-hover:rotate-12 transition-transform" />
                  Update Button
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
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-gray-300 italic">Current Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-gray-300 italic">New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-gray-300 italic">Confirm New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
                  />
                </div>
                <button className="w-full py-5 bg-white text-[#000613] border-4 border-[#000613] rounded-2xl font-black text-sm hover:bg-[#000613] hover:text-white transition-all mt-8">
                  Change Button
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'System Settings' && (
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#000613]">
                <SettingsIcon size={24} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">System Settings</h2>
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-10 ml-16 italic text-gray-300">Global platform configuration and visibility controls.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
              {[
                { key: 'studentRegistration', label: 'Allow Student Registration', sub: 'Enable new student account creation' },
                { key: 'recruiterRegistration', label: 'Allow Recruiter Registration', sub: 'Grant access to new company profiles' },
                { key: 'jobApproval', label: 'Job Approval Required', sub: 'Admin must review jobs before publishing' },
                { key: 'emailNotifications', label: 'Email Notifications', sub: 'Send automated system alerts via email' },
                { key: 'maintenanceMode', label: 'Maintenance Mode', sub: 'Take the portal offline for students/recruiters' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between group/row">
                  <div>
                    <h4 className="text-sm font-black text-gray-900">{setting.label}</h4>
                    <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-tight">{setting.sub}</p>
                  </div>
                  <button 
                    onClick={() => toggleSetting(setting.key as keyof typeof systemToggles)}
                    className={`w-14 h-7 rounded-full relative transition-all duration-300 ${
                      systemToggles[setting.key as keyof typeof systemToggles] ? 'bg-[#000613]' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${
                      systemToggles[setting.key as keyof typeof systemToggles] ? 'left-8' : 'left-1'
                    }`}></div>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-10 border-t border-gray-50 flex justify-end">
              <button className="px-10 py-4 bg-[#000613] text-white rounded-2xl font-black text-sm shadow-xl shadow-black/10 hover:scale-105 transition-all">
                Save Settings
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Database' && (
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm group">
            <div className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#000613]">
                  <Database size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Database Backup</h2>
                  <p className="text-[11px] font-black text-gray-400 mt-1 uppercase tracking-widest italic text-gray-300 italic">Protect institutional data with periodic snapshots.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 items-end">
                <button className="flex items-center gap-3 px-8 py-4 bg-[#000613] text-white rounded-2xl font-black text-sm shadow-xl shadow-black/10 hover:scale-105 transition-all group/btn">
                  <RefreshCw size={18} className="group-hover/btn:rotate-180 transition-transform duration-700" />
                  Backup Database
                </button>
                <button className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-colors mr-4">
                  <Download size={14} />
                  Download Backup File
                </button>
              </div>
            </div>

            <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-50 mb-10">
              <div className="flex items-center justify-center py-4 bg-white/80 rounded-2xl border border-gray-100 mb-10 mx-auto max-w-sm shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                  Last Backup Date: <span className="text-[#000613]">Oct 24, 2023 - 11:45 PM</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/40 p-10 rounded-[2rem] border border-white flex flex-col items-center group/card hover:bg-white transition-all">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Backup Size</p>
                  <h4 className="text-2xl font-black text-gray-900 group-hover:scale-110 transition-transform tracking-tight">1.2 GB</h4>
                </div>
                <div className="bg-white/40 p-10 rounded-[2rem] border border-white flex flex-col items-center group/card hover:bg-white transition-all">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Status</p>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <h4 className="text-2xl font-black text-gray-900">Healthy</h4>
                  </div>
                </div>
                <div className="bg-white/40 p-10 rounded-[2rem] border border-white flex flex-col items-center group/card hover:bg-white transition-all text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Cloud Sync</p>
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-blue-500 animate-[spin_4s_linear_infinite]" />
                    <h4 className="text-2xl font-black text-gray-900">Active</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Institutional Footer */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-100 mt-12 px-2 opacity-30 group">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
          © 2023 Academic Authority Management System. All rights reserved.
        </p>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
          System Version: 4.2.1-STABLE
        </p>
      </div>
    </div>
  );
};

export default AdminSettings;
