import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../../api';

const ProfileProgress: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/profile/me');
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const calculateProgress = () => {
    if (!profile) return 0;
    const fields = ['full_name', 'email', 'phone', 'university_id', 'course', 'branch', 'batch', 'cgpa', 'skills', 'experience', 'projects'];
    const filled = fields.filter(f => profile[f] && (Array.isArray(profile[f]) ? profile[f].length > 0 : true));
    return Math.round((filled.length / fields.length) * 100);
  };

  const progress = calculateProgress();

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-950 to-blue-800 text-white p-5 rounded-xl shadow-md h-full min-h-[220px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-950 to-blue-800 text-white p-5 rounded-xl shadow-md flex flex-col justify-between h-full min-h-[220px] transition-all hover:shadow-lg border border-blue-900/50">
      <div>
        <p className="text-sm font-medium text-blue-100/80 mb-3 uppercase tracking-wider">PROFILE READINESS</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tight">{progress}%</span>
          <span className="text-xs font-semibold text-blue-100/60 uppercase">COMPLETE</span>
        </div>
        <div className="mt-5">
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
      <button className="bg-white text-blue-950 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all shadow-sm active:scale-95 mt-6">
        {progress === 100 ? 'View Profile' : 'Complete Profile'}
      </button>
    </div>
  );
};

export default ProfileProgress;
