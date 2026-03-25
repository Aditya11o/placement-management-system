import { useState, useEffect } from 'react';
import { 
  User, Lock, FileText, Bell, 
  Shield, AlertCircle, LogOut, ChevronRight, 
  Trash2, Upload, Camera, X, Loader2
} from 'lucide-react';
import api from '../../api';
// @ts-ignore
import { toast } from 'react-hot-toast';

const Settings: React.FC = () => {
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
      setNotifications(notifications); // revert
    }
  };

  const handleTogglePrivacy = async (key: string) => {
    const updatedPrivacy = { ...privacy, [key]: !privacy[key as keyof typeof privacy] };
    setPrivacy(updatedPrivacy);
    try {
      await api.put('/students/privacy-settings', updatedPrivacy);
    } catch (err) {
      toast.error('Failed to update privacy settings');
      setPrivacy(privacy); // revert
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
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (err) {
      toast.error('Failed to deactivate account');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: THIS IS PERMANENT. Are you sure you want to delete your account?')) return;
    try {
      await api.delete('/students/delete-account');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (err) {
      toast.error('Failed to delete account');
    }
  };

  const Toggle = ({ enabled, onClick }: { enabled: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-blue-900' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1 block">Preferences</span>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 font-bold mt-1 tracking-tight">Manage your account preferences, privacy, and notifications.</p>
      </div>

      <div className="grid grid-cols-12 gap-6 mt-6 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-3xl">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        )}
        
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Account Settings Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                <User size={20} className="text-gray-900" />
              </div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Account Settings</h2>
            </div>

            <div className="space-y-8">
              {/* Profile Photo */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                    {profile.profile_photo ? (
                      <img 
                        src={profile.profile_photo.startsWith('/') ? `http://localhost:5000${profile.profile_photo}` : profile.profile_photo} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <User size={40} />
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                    <Camera size={14} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Implement photo upload if needed, for now just placeholder
                        toast('Profile photo upload coming soon with dedicated endpoint');
                      }
                    }} />
                  </label>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-base font-black text-gray-900 tracking-tight mb-1">Update Profile Details</h3>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Maintain your contact information for recruiters</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-bold text-gray-900 outline-none focus:border-blue-200 focus:bg-white transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    type="email" 
                    value={profile.email}
                    disabled
                    className="w-full px-5 py-3.5 bg-gray-100 border border-gray-100 rounded-xl text-[13px] font-bold text-gray-400 outline-none cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-bold text-gray-900 outline-none focus:border-blue-200 focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                <button 
                  onClick={handleUpdateProfile}
                  disabled={saving}
                  className="px-8 py-3 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-black/10 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="animate-spin" size={14} />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Password Settings Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                <Lock size={20} className="text-gray-900" />
              </div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Password Settings</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                <input 
                  type="password" 
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-bold text-gray-900 outline-none focus:border-blue-200 focus:bg-white transition-all shadow-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                  <input 
                    type="password" 
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    placeholder="Min. 8 characters"
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-bold text-gray-900 outline-none focus:border-blue-200 focus:bg-white transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-bold text-gray-900 outline-none focus:border-blue-200 focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-50">
                <button 
                  onClick={handlePasswordUpdate}
                  disabled={saving}
                  className="px-8 py-3 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-black/10 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="animate-spin" size={14} />}
                  Update Password
                </button>
              </div>
            </div>
          </div>

          {/* Resume Settings Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                <FileText size={20} className="text-gray-900" />
              </div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Resume Settings</h2>
            </div>

            <div className="space-y-4">
              {resumes.length > 0 ? (
                resumes.map((resume) => (
                  <div key={resume._id} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                          <FileText className="text-orange-600" size={24} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-gray-900 uppercase truncate max-w-[200px] sm:max-w-xs" title={resume.resume_name}>
                            {resume.resume_name}
                          </h4>
                          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider italic">
                            Uploaded on {new Date(resume.upload_date || resume.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => window.open(resume.resume_url.startsWith('/') ? `http://localhost:5000${resume.resume_url}` : resume.resume_url, '_blank')}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition-all shadow-sm"
                        >
                          <FileText size={14} className="text-blue-600" />
                          <span>View</span>
                        </button>
                        <button 
                          onClick={() => handleResumeDelete(resume._id)}
                          className="p-2 text-gray-300 hover:text-rose-500 transition-colors bg-white border border-gray-100 rounded-lg shadow-sm"
                          title="Delete Resume"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">No resumes uploaded yet</p>
                </div>
              )}
              
              <div className="flex items-center gap-4 pt-4">
                <label className="flex-1 flex items-center justify-center px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-blue-400 hover:bg-blue-50/30 transition-all shadow-sm cursor-pointer gap-2 group">
                  <Upload size={14} className="group-hover:scale-110 transition-transform" />
                  <span>Upload New Resume</span>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
                </label>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
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
                    onClick={() => handleToggleNotification(item.key)} 
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
                      onClick={() => handleTogglePrivacy(item.key)} 
                    />
                  </div>
                  <p className="text-[11px] font-bold text-gray-400 leading-relaxed italic">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Account Actions Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                <AlertCircle size={20} className="text-gray-900" />
              </div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Account Actions</h2>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleDeactivate}
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
                onClick={handleDeleteAccount}
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
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userInfo');
                    window.location.href = '/login';
                  }
                }}
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

        </div>

      </div>

    </div>
  );
};

export default Settings;
