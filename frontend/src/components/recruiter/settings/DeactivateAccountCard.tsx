import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import api from '../../../api';

const DeactivateAccountCard: React.FC = () => {
  const { logout } = useAuth();
  const { showError } = useNotification();

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


  return (
    <div className="bg-red-50 border border-red-100 rounded-[32px] p-8 flex flex-col md:flex-row justify-between items-center gap-6">
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
  );
};

export default DeactivateAccountCard;
