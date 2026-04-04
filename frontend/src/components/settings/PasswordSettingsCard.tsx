import React from 'react';
import { Lock, Loader2 } from 'lucide-react';

interface PasswordSettingsCardProps {
  passwords: { current: string; new: string; confirm: string };
  saving: boolean;
  onPasswordChange: (updates: Partial<PasswordSettingsCardProps['passwords']>) => void;
  onSave: () => void;
}

const PasswordSettingsCard: React.FC<PasswordSettingsCardProps> = ({ passwords, saving, onPasswordChange, onSave }) => {
  return (
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
            value={passwords.current}
            onChange={(e) => onPasswordChange({ current: e.target.value })}
            placeholder="••••••••"
            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-bold text-gray-900 outline-none focus:border-blue-200 focus:bg-white transition-all shadow-sm"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
            <input 
              type="password" 
              value={passwords.new}
              onChange={(e) => onPasswordChange({ new: e.target.value })}
              placeholder="Min. 8 characters"
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-bold text-gray-900 outline-none focus:border-blue-200 focus:bg-white transition-all shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
            <input 
              type="password" 
              value={passwords.confirm}
              onChange={(e) => onPasswordChange({ confirm: e.target.value })}
              placeholder="Confirm new password"
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-bold text-gray-900 outline-none focus:border-blue-200 focus:bg-white transition-all shadow-sm"
            />
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-gray-50">
          <button 
            onClick={onSave}
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-black/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="animate-spin" size={14} />}
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordSettingsCard;
