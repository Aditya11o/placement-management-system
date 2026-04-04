import React from 'react';
import { User, Camera, Loader2 } from 'lucide-react';

interface AccountSettingsCardProps {
  profile: { full_name: string; email: string; phone: string; profile_photo: string };
  saving: boolean;
  onProfileChange: (updates: Partial<AccountSettingsCardProps['profile']>) => void;
  onSave: () => void;
}

const AccountSettingsCard: React.FC<AccountSettingsCardProps> = ({ profile, saving, onProfileChange, onSave }) => {
  return (
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
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gray-100">
              {profile.profile_photo ? (
                <img 
                  src={profile.profile_photo.startsWith('/') ? `${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${profile.profile_photo}` : profile.profile_photo} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <User size={40} />
                </div>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
              <Camera size={14} />
              <input type="file" className="hidden" accept="image/*" onChange={() => {}} />
            </label>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-base font-black text-gray-900 tracking-tight mb-1">Update Profile Details</h3>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Maintain your contact information for recruiters</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            <input 
              type="text" 
              value={profile.full_name}
              onChange={(e) => onProfileChange({ full_name: e.target.value })}
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-bold text-gray-900 outline-none focus:border-blue-200 focus:bg-white transition-all shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <input 
              type="email" 
              value={profile.email}
              disabled
              className="w-full px-5 py-3.5 bg-gray-100 border border-gray-100 rounded-xl text-[13px] font-bold text-gray-400 outline-none cursor-not-allowed"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
            <input 
              type="text" 
              value={profile.phone}
              onChange={(e) => onProfileChange({ phone: e.target.value })}
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-bold text-gray-900 outline-none focus:border-blue-200 focus:bg-white transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
          <button 
            onClick={onSave}
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-black/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="animate-spin" size={14} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsCard;
