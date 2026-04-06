import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProfileSkeleton from '../../components/skeletons/ProfileSkeleton';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

// Sub-components
import AccountSettingsCard from '../../components/settings/AccountSettingsCard';
import PasswordSettingsCard from '../../components/settings/PasswordSettingsCard';
import NotificationPrivacyCards from '../../components/settings/NotificationPrivacyCards';
import AccountActionsCard from '../../components/settings/AccountActionsCard';
import SettingsResumesTab from '../../components/settings/SettingsResumesTab';
import SettingsAlumniTab from '../../components/settings/SettingsAlumniTab';
import ConfirmModal from '../../components/ConfirmModal';
import { LogOut, AlertTriangle, Power, User, Shield, FileText, Users, Bell } from 'lucide-react';

const Settings: React.FC = () => {
  const { logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'general';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    profile_photo: ''
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [notifications, setNotifications] = useState({
    jobs: true,
    apps: true,
    interviews: true,
    email: false,
    sms: false
  });

  const [privacy, setPrivacy] = useState({
    visible: true,
    showPhone: false,
    showEmail: true
  });

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    type: 'danger' | 'warning' | 'info';
    title: string;
    message: string;
    onConfirm: () => void;
    icon?: any;
  }>({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [profRes, notifRes, privRes] = await Promise.all([
          api.get('/profile/me'),
          api.get('/students/notification-settings'),
          api.get('/students/privacy-settings')
        ]);

        setProfile({
          full_name: profRes.data.full_name || '',
          email: profRes.data.email || '',
          phone: profRes.data.phone || '',
          profile_photo: profRes.data.profile_photo || ''
        });

        setNotifications(notifRes.data);
        setPrivacy(privRes.data);
      } catch (err) {
        console.error('Error fetching settings:', err);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      await api.put('/students/profile', {
        full_name: profile.full_name,
        phone: profile.phone
      });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwords.new !== passwords.confirm) {
      return toast.error('Passwords do not match');
    }
    if (passwords.new.length < 8) {
      return toast.error('New password must be at least 8 characters');
    }

    setSaving(true);
    try {
      await api.put('/students/change-password', {
        current_password: passwords.current,
        new_password: passwords.new
      });
      toast.success('Password updated successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNotification = async (key: string) => {
    const updatedNotifs = { ...notifications, [key]: !notifications[key as keyof typeof notifications] };
    setNotifications(updatedNotifs);
    try {
      await api.put('/students/notification-settings', updatedNotifs);
    } catch (err) {
      toast.error('Failed to update notification settings');
      setNotifications(notifications);
    }
  };

  const handleTogglePrivacy = async (key: string) => {
    const updatedPrivacy = { ...privacy, [key]: !privacy[key as keyof typeof privacy] };
    setPrivacy(updatedPrivacy);
    try {
      await api.put('/students/privacy-settings', updatedPrivacy);
    } catch (err) {
      toast.error('Failed to update privacy settings');
      setPrivacy(privacy);
    }
  };

  const handleDeactivate = () => {
    setConfirmState({
      isOpen: true,
      type: 'warning',
      title: 'Deactivate Account',
      message: 'Are you sure you want to deactivate your account? You will be logged out and your profile will be hidden.',
      onConfirm: async () => {
        try {
          await api.put('/students/deactivate');
          await logout();
          window.location.href = '/login';
        } catch (err) {
          toast.error('Failed to deactivate account');
        }
      },
      icon: Power
    });
  };

  const handleDeleteAccount = () => {
    setConfirmState({
      isOpen: true,
      type: 'danger',
      title: 'Delete Account Permanently',
      message: 'WARNING: This action cannot be undone. All your data, applications, and resumes will be permanently erased.',
      onConfirm: async () => {
        try {
          await api.delete('/students/delete-account');
          await logout();
          window.location.href = '/login';
        } catch (err) {
          toast.error('Failed to delete account');
        }
      },
      icon: AlertTriangle
    });
  };

  const handleLogout = () => {
    setConfirmState({
      isOpen: true,
      type: 'warning',
      title: 'Confirm Logout',
      message: 'Are you sure you want to end your session?',
      onConfirm: async () => {
        await logout();
        window.location.href = '/login';
      },
      icon: LogOut
    });
  };

  const tabs = [
    { id: 'general', name: 'General', icon: User },
    { id: 'privacy', name: 'Privacy & Alerts', icon: Bell },
    { id: 'resumes', name: 'My Resumes', icon: FileText },
    { id: 'alumni', name: 'Alumni Network', icon: Users },
  ];

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1 block">Account Management</span>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Settings</h1>
        <p className="text-gray-500 font-bold mt-1 tracking-tight">Configure your profile, security, career assets, and global network visibility.</p>
      </div>

      {/* Modern Tab Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-gray-100 p-1.5 rounded-2xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                isActive 
                  ? 'bg-white text-blue-600 shadow-xl shadow-black/5 scale-[1.02]' 
                  : 'text-gray-400 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
              {tab.name}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <AccountSettingsCard
                profile={profile}
                saving={saving}
                onProfileChange={(updates) => setProfile({ ...profile, ...updates })}
                onSave={handleUpdateProfile}
              />
              <PasswordSettingsCard
                passwords={passwords}
                saving={saving}
                onPasswordChange={(updates) => setPasswords({ ...passwords, ...updates })}
                onSave={handlePasswordUpdate}
              />
            </div>
            <div className="col-span-12 lg:col-span-4 space-y-6">
               <AccountActionsCard
                onDeactivate={handleDeactivate}
                onDelete={handleDeleteAccount}
                onLogout={handleLogout}
              />
            </div>
          </div>
        )}

        {/* Privacy & Notifications Tab */}
        {activeTab === 'privacy' && (
          <div className="grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="col-span-12 lg:col-span-7">
              <NotificationPrivacyCards
                notifications={notifications}
                privacy={privacy}
                onToggleNotification={handleToggleNotification}
                onTogglePrivacy={handleTogglePrivacy}
              />
            </div>
            <div className="col-span-12 lg:col-span-5 space-y-6">
               <div className="p-8 bg-blue-50 rounded-[32px] border border-blue-100/50">
                  <Shield size={32} className="text-blue-600 mb-4" />
                  <h3 className="text-lg font-black text-gray-900 tracking-tight mb-2">Privacy Shield</h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    We take your data privacy seriously. Your phone number and email are hidden by default unless you choose to share them with verified recruiters or the alumni network.
                  </p>
               </div>
            </div>
          </div>
        )}

        {/* Resumes Tab */}
        {activeTab === 'resumes' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <SettingsResumesTab />
          </div>
        )}

        {/* Alumni Network Tab */}
        {activeTab === 'alumni' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <SettingsAlumniTab />
          </div>
        )}

      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(p => ({ ...p, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        icon={confirmState.icon}
      />
    </div>
  );
};

export default Settings;
