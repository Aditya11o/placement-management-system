import React, { useState, useEffect } from 'react';
import { Briefcase, GraduationCap, Globe, Linkedin, Github, CheckCircle2, Loader2, Award } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-hot-toast';

const AlumniProfileEditor: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    company: '',
    designation: '',
    expertise: [] as string[],
    graduationYear: new Date().getFullYear(),
    github: '',
    linkedin: '',
    isAvailableForMentorship: true,
  });

  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/alumni/dashboard');
        if (data.profile) {
          setProfile({
            company: data.profile.company || '',
            designation: data.profile.designation || '',
            expertise: data.profile.expertise || [],
            graduationYear: data.profile.graduationYear || new Date().getFullYear(),
            github: data.profile.socialLinks?.github || '',
            linkedin: data.profile.socialLinks?.linkedin || '',
            isAvailableForMentorship: data.profile.isAvailableForMentorship ?? true,
          });
        }
      } catch (err) {
        console.error('Error fetching alumni profile:', err);
        toast.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/alumni/profile', {
        company: profile.company,
        designation: profile.designation,
        expertise: profile.expertise,
        graduationYear: parseInt(profile.graduationYear as any),
        socialLinks: {
          github: profile.github,
          linkedin: profile.linkedin
        },
        isAvailableForMentorship: profile.isAvailableForMentorship
      });
      toast.success('Professional profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill && !profile.expertise.includes(newSkill)) {
      setProfile({ ...profile, expertise: [...profile.expertise, newSkill] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, expertise: profile.expertise.filter(s => s !== skill) });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 bg-gray-50/50 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
            <Award className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase italic">Professional <span className="text-blue-600">Persona</span></h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5">Define your industry presence & mentorship availability</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Work Details */}
          <div className="space-y-6">
             <div className="flex items-center gap-2 mb-2">
                <Briefcase size={14} className="text-blue-600" />
                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Work Experience</span>
             </div>
             
             <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Company</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Google, Microsoft"
                    value={profile.company}
                    onChange={e => setProfile({...profile, company: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Designation</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Senior Software Engineer"
                    value={profile.designation}
                    onChange={e => setProfile({...profile, designation: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                  />
                </div>
             </div>
          </div>

          {/* Education & Social */}
          <div className="space-y-6">
             <div className="flex items-center gap-2 mb-2">
                <Globe size={14} className="text-blue-600" />
                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Digital Footprint</span>
             </div>

             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Graduation Year</label>
                    <input 
                      type="number" 
                      value={profile.graduationYear}
                      onChange={e => setProfile({...profile, graduationYear: parseInt(e.target.value)})}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-900 focus:bg-white focus:border-blue-600 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">LinkedIn URL</label>
                    <div className="relative">
                      <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                      <input 
                        type="text" 
                        placeholder="linkedin.com/in/..."
                        value={profile.linkedin}
                        onChange={e => setProfile({...profile, linkedin: e.target.value})}
                        className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-900 focus:bg-white focus:border-blue-600 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">GitHub Profile</label>
                  <div className="relative">
                    <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                    <input 
                      type="text" 
                      placeholder="github.com/..."
                      value={profile.github}
                      onChange={e => setProfile({...profile, github: e.target.value})}
                      className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-900 focus:bg-white focus:border-blue-600 transition-all outline-none"
                    />
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Expertise / Skills */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={14} className="text-blue-600" />
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Areas of Expertise</span>
           </div>
           
           <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl">
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.expertise.map(skill => (
                  <span key={skill} className="group px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 flex items-center gap-2 hover:border-red-200 hover:text-red-500 transition-all cursor-pointer" onClick={() => removeSkill(skill)}>
                    {skill}
                    <span className="opacity-0 group-hover:opacity-100 text-[10px]">×</span>
                  </span>
                ))}
                {profile.expertise.length === 0 && (
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest py-2">No skills added yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Add a skill (e.g. Distributed Systems, Career Growth)"
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addSkill()}
                  className="flex-1 px-5 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:border-blue-600 outline-none transition-all"
                />
                <button 
                  onClick={addSkill}
                  className="px-6 py-3 bg-[#000613] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                >
                  Add
                </button>
              </div>
           </div>
        </div>

        {/* Mentorship Settings */}
        <div className="p-6 bg-blue-50/50 border border-blue-100/50 rounded-3xl flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                 <GraduationCap size={20} />
              </div>
              <div>
                 <h4 className="text-sm font-black text-gray-900 tracking-tight">Mentorship Availability</h4>
                 <p className="text-[10px] font-bold text-blue-600/60 uppercase tracking-widest">Toggle your visibility for 1:1 sessions</p>
              </div>
           </div>
           
           <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={profile.isAvailableForMentorship}
                onChange={e => setProfile({...profile, isAvailableForMentorship: e.target.checked})}
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
           </label>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-12 py-5 bg-[#000613] text-white rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl shadow-black/10 active:scale-95 disabled:opacity-50 flex items-center gap-3"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
            Synchronize Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlumniProfileEditor;
