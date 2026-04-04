import React from 'react';
import { Shield, ChevronRight } from 'lucide-react';

const SecuritySection: React.FC = () => {
  return (
    <div className="col-span-12 lg:col-span-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 h-full hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
            <Shield size={20} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Security</h3>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Current Password</label>
            <input type="password" placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-all bg-gray-50/30 outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">New Password</label>
            <input type="password" placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-all bg-gray-50/30 outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Confirm New Password</label>
            <input type="password" placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-all bg-gray-50/30 outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <button className="w-full bg-blue-950 text-white py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-[0.98] mt-4 flex items-center justify-center gap-2 group">
            Update Password
            <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;
