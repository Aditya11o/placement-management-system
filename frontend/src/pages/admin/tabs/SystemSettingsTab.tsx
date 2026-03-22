import React, { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

const SystemSettingsTab: React.FC = () => {
  const [systemToggles, setSystemToggles] = useState({
    studentRegistration: true,
    recruiterRegistration: true,
    jobApproval: true,
    emailNotifications: true,
    maintenanceMode: false
  });

  const toggleSetting = (key: keyof typeof systemToggles) => {
    setSystemToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm group">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#000613]">
          <SettingsIcon size={24} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">System Settings</h2>
      </div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-10 ml-16 italic text-gray-300">Global platform configuration and visibility controls.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
        {[
          { key: 'studentRegistration', label: 'Allow Student Registration', sub: 'Enable new student account creation' },
          { key: 'recruiterRegistration', label: 'Allow Recruiter Registration', sub: 'Grant access to new company profiles' },
          { key: 'jobApproval', label: 'Job Approval Required', sub: 'Admin must review jobs before publishing' },
          { key: 'emailNotifications', label: 'Email Notifications', sub: 'Send automated system alerts via email' },
          { key: 'maintenanceMode', label: 'Maintenance Mode', sub: 'Take the portal offline for students/recruiters' }
        ].map((setting) => (
          <div key={setting.key} className="flex items-center justify-between group/row">
            <div>
              <h4 className="text-sm font-black text-gray-900">{setting.label}</h4>
              <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-tight">{setting.sub}</p>
            </div>
            <button 
              onClick={() => toggleSetting(setting.key as keyof typeof systemToggles)}
              className={`w-14 h-7 rounded-full relative transition-all duration-300 ${
                systemToggles[setting.key as keyof typeof systemToggles] ? 'bg-[#000613]' : 'bg-gray-200'
              }`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${
                systemToggles[setting.key as keyof typeof systemToggles] ? 'left-8' : 'left-1'
              }`}></div>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-10 border-t border-gray-50 flex justify-end">
        <button className="px-10 py-4 bg-[#000613] text-white rounded-2xl font-black text-sm shadow-xl shadow-black/10 hover:scale-105 transition-all">
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SystemSettingsTab;
