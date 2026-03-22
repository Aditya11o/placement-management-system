import React, { useState } from 'react';
import AccountTab from './tabs/AccountTab';
import SystemSettingsTab from './tabs/SystemSettingsTab';
import DatabaseTab from './tabs/DatabaseTab';
import SupportTab from './tabs/SupportTab';
import ArchiveTab from './tabs/ArchiveTab';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Account');

  const tabs = [
    'Account', 
    'System Settings', 
    'Database', 
    'Support Inbox', 
    'Data Archiving'
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="pt-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Settings</h1>
        <p className="text-base text-gray-500 font-bold mt-2 leading-relaxed max-w-3xl italic">
          Configure institutional parameters, manage analytics, and handle support requests in one centralized panel.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-8 border-b border-gray-100 pb-px overflow-x-auto custom-scrollbar no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-black transition-all relative whitespace-nowrap ${
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

      {/* Tab Content Rendering */}
      <div className="mt-8">
        {activeTab === 'Account' && <AccountTab />}
        {activeTab === 'System Settings' && <SystemSettingsTab />}
        {activeTab === 'Database' && <DatabaseTab />}
        {activeTab === 'Support Inbox' && <SupportTab />}
        {activeTab === 'Data Archiving' && <ArchiveTab />}
      </div>

      {/* Institutional Footer */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-100 mt-12 px-2 opacity-30 group">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
          © 2026 Placement Management System. All rights reserved.
        </p>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
          Version 5.0.0-PRO
        </p>
      </div>
    </div>
  );
};

export default AdminSettings;
