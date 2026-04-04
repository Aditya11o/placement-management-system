import React, { useState } from 'react';
import { User as UserIcon, Lock, Bell, Building2, ChevronRight } from 'lucide-react';

import AccountSettingsCard from '../../components/recruiter/settings/AccountSettingsCard';
import CompanySettingsCard from '../../components/recruiter/settings/CompanySettingsCard';
import SecuritySettingsCard from '../../components/recruiter/settings/SecuritySettingsCard';
import NotificationSettingsCard from '../../components/recruiter/settings/NotificationSettingsCard';
import DeactivateAccountCard from '../../components/recruiter/settings/DeactivateAccountCard';

const Settings: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('Account Settings');

  const menuItems = [
    { id: 'Account Settings', icon: <UserIcon size={18} /> },
    { id: 'Security', icon: <Lock size={18} /> },
    { id: 'Notifications', icon: <Bell size={18} /> },
    { id: 'Company Details', icon: <Building2 size={18} /> },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 text-[15px] mt-1 font-medium">Manage your account preferences and company information.</p>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        
        {/* Left Settings Menu */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white border border-gray-100 rounded-[24px] p-4 shadow-sm space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all group ${
                  activeMenu === item.id 
                    ? 'bg-[#000613] text-white shadow-xl shadow-black/10' 
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`${activeMenu === item.id ? 'text-white' : 'text-gray-300 group-hover:text-gray-900'} transition-colors`}>
                    {item.icon}
                  </div>
                  <span className="text-[13px] font-black tracking-tight">{item.id}</span>
                </div>
                {activeMenu === item.id && <ChevronRight size={14} className="opacity-40" />}
              </button>
            ))}
          </div>
        </div>

        {/* Right Settings Content */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          <div className={activeMenu !== 'Account Settings' ? 'hidden' : 'block'}>
            <AccountSettingsCard />
          </div>
          
          <div className={`space-y-6 ${activeMenu !== 'Security' ? 'hidden' : 'block'}`}>
            <SecuritySettingsCard />
            <DeactivateAccountCard />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={activeMenu !== 'Notifications' ? 'hidden md:block' : 'block'}>
              <NotificationSettingsCard />
            </div>
            
            <div className={activeMenu !== 'Company Details' ? 'hidden md:block' : 'block'}>
              <CompanySettingsCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
