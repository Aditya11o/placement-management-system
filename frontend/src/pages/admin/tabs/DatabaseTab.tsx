import React from 'react';
import { Database, RefreshCw, Download, Globe } from 'lucide-react';

const DatabaseTab: React.FC = () => {
  return (
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
  );
};

export default DatabaseTab;
