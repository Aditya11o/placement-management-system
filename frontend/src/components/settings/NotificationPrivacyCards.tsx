import React from 'react';
import { Bell, Shield } from 'lucide-react';

interface NotificationPrivacyCardsProps {
  notifications: { jobs: boolean; apps: boolean; interviews: boolean; email: boolean; sms: boolean };
  privacy: { visible: boolean; showPhone: boolean; showEmail: boolean };
  onToggleNotification: (key: string) => void;
  onTogglePrivacy: (key: string) => void;
}

const Toggle = ({ enabled, onClick }: { enabled: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-blue-900' : 'bg-gray-200'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const NotificationPrivacyCards: React.FC<NotificationPrivacyCardsProps> = ({
  notifications, privacy, onToggleNotification, onTogglePrivacy
}) => {
  return (
    <>
      {/* Notification Settings Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
            <Bell size={20} className="text-gray-900" />
          </div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight">Notification Settings</h2>
        </div>

        <div className="space-y-6">
          {[
            { key: 'jobs', label: 'Job Notifications' },
            { key: 'apps', label: 'Application Status Updates' },
            { key: 'interviews', label: 'Interview Notifications' },
            { key: 'email', label: 'Email Notifications' },
            { key: 'sms', label: 'SMS Notifications' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-[13px] font-black text-gray-600 uppercase tracking-tight">{item.label}</span>
              <Toggle 
                enabled={notifications[item.key as keyof typeof notifications]} 
                onClick={() => onToggleNotification(item.key)} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Settings Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
            <Shield size={20} className="text-gray-900" />
          </div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight">Privacy Settings</h2>
        </div>

        <div className="space-y-8">
          {[
            { key: 'visible', label: 'Make Profile Visible to Companies', desc: 'Allow recruiters to search for your profile in the database.' },
            { key: 'showPhone', label: 'Show Phone Number to Recruiters', desc: 'Contact information will be visible to matched companies.' },
            { key: 'showEmail', label: 'Show Email to Recruiters', desc: 'Official university email will be visible for outreach.' }
          ].map((item) => (
            <div key={item.key} className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-[13px] font-black text-gray-900 leading-tight pr-4">{item.label}</span>
                <Toggle 
                  enabled={privacy[item.key as keyof typeof privacy]} 
                  onClick={() => onTogglePrivacy(item.key)} 
                />
              </div>
              <p className="text-[11px] font-bold text-gray-400 leading-relaxed italic">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default NotificationPrivacyCards;
