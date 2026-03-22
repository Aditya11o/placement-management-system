import React from 'react';
import { User, Camera, Save, Key } from 'lucide-react';

const AccountTab: React.FC = () => {
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
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic text-gray-300">Admin Name</label>
            <input 
              type="text" 
              defaultValue="Dr. Robert Harrison"
              className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic text-gray-300">Email Address</label>
            <input 
              type="email" 
              defaultValue="robert.h@academic-authority.edu"
              className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic text-gray-300">Phone Number</label>
            <input 
              type="text" 
              defaultValue="+1 (555) 012-3456"
              className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
            />
          </div>
          <button className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-[#000613] text-white rounded-2xl font-black text-sm shadow-xl shadow-black/10 hover:scale-[1.02] transition-all active:scale-[0.98] group mt-8">
            <Save size={20} className="group-hover:rotate-12 transition-transform" />
            Update Profile
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
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic text-gray-300">Current Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic text-gray-300">New Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic text-gray-300">Confirm New Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
            />
          </div>
          <button className="w-full py-5 bg-white text-[#000613] border-4 border-[#000613] rounded-2xl font-black text-sm hover:bg-[#000613] hover:text-white transition-all mt-8">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountTab;
