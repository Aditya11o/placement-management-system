import React, { useState, useEffect } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';
import api from '../../../api';

const NotificationSettingsCard: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState({
    emailSummary: true,
    interviewAlerts: true,
    applicationAlerts: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings/recruiter');
        setNotificationSettings(response.data.notifications);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await api.put('/settings/recruiter', {
        notifications: notificationSettings
      });
      showSuccess('Notification preferences saved!');
    } catch (err: any) {
      showError('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-3 mb-8">
        <Bell size={20} className="text-gray-400" />
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Notification Settings</h2>
      </div>

      <div className="space-y-6 flex-1">
        {[
          { id: 'emailSummary', label: 'Email Notifications', desc: 'Receive weekly summary emails' },
          { id: 'interviewAlerts', label: 'Interview Notifications', desc: 'Alerts for upcoming interviews' },
          { id: 'applicationAlerts', label: 'Application Notifications', desc: 'Real-time new applicant alerts' },
        ].map((item) => (
          <div key={item.id} className="flex items-center justify-between group">
            <div className="space-y-1">
              <p className="text-[13px] font-black text-gray-900 tracking-tight leading-none">{item.label}</p>
              <p className="text-[11px] font-bold text-gray-400">{item.desc}</p>
            </div>
            <button 
              onClick={() => setNotificationSettings(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
              className={`w-12 h-6 rounded-full transition-all relative ${notificationSettings[item.id as keyof typeof notificationSettings] ? 'bg-gray-900' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${notificationSettings[item.id as keyof typeof notificationSettings] ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-gray-50 items-center justify-center flex">
          <button 
          onClick={handleSaveNotifications}
          disabled={loading}
          className="w-full py-4 border-2 border-gray-900 text-gray-900 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin inline mr-2" size={14} /> : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettingsCard;
