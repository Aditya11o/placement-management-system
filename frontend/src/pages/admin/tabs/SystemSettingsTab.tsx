import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Loader2 } from 'lucide-react';
import api from '../../../api';
import { useNotification } from '../../../context/NotificationContext';

const SystemSettingsTab: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [systemToggles, setSystemToggles] = useState({
    studentRegistration: true,
    recruiterRegistration: true,
    jobApproval: true,
    emailNotifications: true,
    maintenanceMode: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/settings');
      setSystemToggles({
        studentRegistration: data.studentRegistration !== false,
        recruiterRegistration: data.recruiterRegistration !== false,
        jobApproval: data.jobApproval !== false,
        emailNotifications: data.emailNotifications !== false,
        maintenanceMode: data.maintenanceMode === true
      });
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to load system settings', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = (key: keyof typeof systemToggles) => {
    setSystemToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await api.patch('/admin/settings', systemToggles);
      showSuccess('System settings have been successfully updated', 'Settings Saved');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to save settings', 'Error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 md:w-12 md:h-12 text-[#000613] animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm group">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#000613]">
          <SettingsIcon size={24} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">System Settings</h2>
      </div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-10 ml-16 italic text-gray-300">Global platform configuration and visibility controls.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 pl-2 lg:pl-16">
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
        <button 
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-10 py-4 bg-[#000613] text-white rounded-2xl font-black text-sm shadow-xl shadow-black/10 hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 transition-all"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SystemSettingsTab;
