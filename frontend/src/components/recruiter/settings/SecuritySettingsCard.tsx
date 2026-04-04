import React, { useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';
import api from '../../../api';

const SecuritySettingsCard: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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


  return (
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
  );
};

export default SecuritySettingsCard;
