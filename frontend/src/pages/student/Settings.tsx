import { useState, useEffect } from 'react';
 
import ProfileSkeleton from '../../components/skeletons/ProfileSkeleton';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
// @ts-ignore
import { toast } from 'react-hot-toast';

// Sub-components
import AccountSettingsCard from '../../components/settings/AccountSettingsCard';
import PasswordSettingsCard from '../../components/settings/PasswordSettingsCard';
import ResumeSettingsCard from '../../components/settings/ResumeSettingsCard';
import NotificationPrivacyCards from '../../components/settings/NotificationPrivacyCards';
import AccountActionsCard from '../../components/settings/AccountActionsCard';

const Settings: React.FC = () => {
  const { logout } = useAuth();
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

  const [resumes, setResumes] = useState<any[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [profRes, notifRes, privRes, resumeRes] = await Promise.all([
          api.get('/profile/me'),
          api.get('/students/notification-settings'),
          api.get('/students/privacy-settings'),
          api.get('/students/resume')
        ]);

        setProfile({
          full_name: profRes.data.full_name || '',
          email: profRes.data.email || '',
          phone: profRes.data.phone || '',
          profile_photo: profRes.data.profile_photo || ''
        });

        setNotifications(notifRes.data);
        setPrivacy(privRes.data);
        setResumes(resumeRes.data);
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

  const handleResumeDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await api.delete(`/students/resume/${id}`);
      setResumes(resumes.filter(r => r._id !== id));
      toast.success('Resume deleted successfully');
    } catch (err) {
      toast.error('Failed to delete resume');
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    const uploadToast = toast.loading('Uploading resume...');
    try {
      const { data } = await api.post('/students/upload-resume', formData);
      setResumes([data.resume, ...resumes]);
      toast.success('Resume uploaded successfully', { id: uploadToast });
    } catch (err) {
      toast.error('Failed to upload resume', { id: uploadToast });
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate your account? You will be logged out.')) return;
    try {
      await api.put('/students/deactivate');
      await logout();
      window.location.href = '/login';
    } catch (err) {
      toast.error('Failed to deactivate account');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: THIS IS PERMANENT. Are you sure you want to delete your account?')) return;
    try {
      await api.delete('/students/delete-account');
      await logout();
      window.location.href = '/login';
    } catch (err) {
      toast.error('Failed to delete account');
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      window.location.href = '/login';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1 block">Preferences</span>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 font-bold mt-1 tracking-tight">Manage your account preferences, privacy, and notifications.</p>
      </div>

      <div className="grid grid-cols-12 gap-6 mt-6 relative">
        {loading && <ProfileSkeleton />}
        
        {/* Left Column */}
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
          <ResumeSettingsCard
            resumes={resumes}
            onDelete={handleResumeDelete}
            onUpload={handleResumeUpload}
          />
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <NotificationPrivacyCards
            notifications={notifications}
            privacy={privacy}
            onToggleNotification={handleToggleNotification}
            onTogglePrivacy={handleTogglePrivacy}
          />
          <AccountActionsCard
            onDeactivate={handleDeactivate}
            onDelete={handleDeleteAccount}
            onLogout={handleLogout}
          />
        </div>

      </div>

    </div>
  );
};

export default Settings;
