import React from 'react';
import { AlertCircle, X, Trash2, LogOut, ChevronRight } from 'lucide-react';

interface AccountActionsCardProps {
  onDeactivate: () => void;
  onDelete: () => void;
  onLogout: () => void;
}

const AccountActionsCard: React.FC<AccountActionsCardProps> = ({ onDeactivate, onDelete, onLogout }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
          <AlertCircle size={20} className="text-gray-900" />
        </div>
        <h2 className="text-lg font-black text-gray-900 tracking-tight">Account Actions</h2>
      </div>

      <div className="space-y-4">
        <button 
          onClick={onDeactivate}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl group transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100"
        >
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

        <button 
          onClick={onDelete}
          className="w-full flex items-center justify-between p-4 bg-rose-50 rounded-2xl group transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-rose-100"
        >
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
          onClick={onLogout}
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
  );
};

export default AccountActionsCard;
