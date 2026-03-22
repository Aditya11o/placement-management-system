import React, { useState, useEffect } from 'react';
import { 
  User, GraduationCap, Award, Shield, FileText, Plus, Trash2, 
  Edit2, Camera, ChevronRight, Download, Loader2
} from 'lucide-react';
import api from '../../api';
import { useAutosave } from '../../hooks/useAutosave';

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  const { clearAutosave } = useAutosave('student-profile', profile, setProfile);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile/me');
      setProfile(data);
      setSkills(data.studentDetails?.skills || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      await api.put('/profile', {
        studentDetails: {
          ...profile.studentDetails,
          skills: skills
        }
      });
      alert('Profile updated successfully!');
      clearAutosave();
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteResume = async (id: string) => {
    try {
      await api.delete(`/profile/resumes/${id}`);
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDefaultResume = async (id: string) => {
    try {
      const updatedResumes = profile.studentDetails.resumes.map((r: any) => ({
        ...r,
        isDefault: r._id === id
      }));
      await api.put('/profile', {
        studentDetails: {
          ...profile.studentDetails,
          resumes: updatedResumes
        }
      });
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      if (!skills.includes(newSkill.trim())) {
        const updatedSkills = [...skills, newSkill.trim()];
        setSkills(updatedSkills);
      }
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleInputChange = (field: string, value: any, section: 'studentDetails' | 'recruiterDetails' | 'root' = 'studentDetails') => {
    if (section === 'root') {
      setProfile({ ...profile, [field]: value });
    } else {
      setProfile({
        ...profile,
        [section]: {
          ...profile[section],
          [field]: value
        }
      });
    }
  };

  const handleRequestVerification = async (skill: string) => {
    const certificateUrl = prompt(`Enter certificate URL for ${skill}:`);
    if (!certificateUrl) return;

    try {
      await api.post('/profile/verify-skill', { skill, certificateUrl });
      fetchProfile();
      alert('Verification request sent!');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  const student = profile?.studentDetails || {};

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fade-in">
      <div className="grid grid-cols-12 gap-6">
        
        {/* Row 1: Profile Header & Performance */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-gray-50 shadow-sm transition-transform duration-500 group-hover:scale-105">
                <img 
                  src={profile?.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop"} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 bg-blue-950 text-white rounded-lg shadow-lg hover:bg-black transition-all active:scale-90">
                <Camera size={16} />
              </button>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{profile?.user?.name}</h2>
              <p className="text-gray-500 font-medium mt-1 flex items-center justify-center md:justify-start gap-2">
                {student.branch || 'Add Branch'} <span className="text-gray-300">•</span> Class of {student.passingYear || '202X'}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                {skills.slice(0, 4).map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-[11px] font-bold uppercase rounded-md tracking-wider">
                    {skill}
                  </span>
                ))}
                {skills.length > 4 && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold uppercase rounded-md tracking-wider">
                    +{skills.length - 4} More
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                <button 
                  onClick={() => handleUpdate()}
                  className="bg-blue-950 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  Save Profile
                </button>
                <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs flex items-center gap-2">
                  <Shield size={14} /> {student.placementStatus || 'Unplaced'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-xl shadow-md p-6 text-white h-full flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform duration-1000 group-hover:scale-150"></div>
            <div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-4">Academic Performance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-white tracking-tighter">{student.cgpa || '0.0'}</span>
                <span className="text-xl font-bold text-blue-300">CGPA</span>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm font-medium text-blue-100">Profile Completion</p>
                <p className="text-lg font-black text-white">85%</p>
              </div>
              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div className="bg-blue-400 h-full rounded-full w-[85%] shadow-[0_0_12px_rgba(96,165,250,0.5)] transition-all duration-1000"></div>
              </div>
              <p className="text-[10px] text-blue-200/60 mt-3 font-medium">Complete your academic & contact details</p>
            </div>
          </div>
        </div>

        {/* Row 2: Personal & Academic Info */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 h-full hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <User size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Full Name</label>
                <input type="text" value={profile?.user?.name || ''} readOnly className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-all bg-gray-50 opacity-70" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Email</label>
                <input type="email" value={profile?.user?.email || ''} readOnly className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-all bg-gray-50 opacity-70" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Phone</label>
                <input 
                  type="text" 
                  value={student.phone || ''} 
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">DOB</label>
                <input 
                  type="date" 
                  value={student.dob ? new Date(student.dob).toISOString().split('T')[0] : ''} 
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Gender</label>
                <select 
                  value={student.gender || 'Male'}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30 appearance-none"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Address</label>
                <input 
                  type="text" 
                  value={student.address || ''} 
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">City</label>
                <input 
                  type="text" 
                  value={student.city || ''} 
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">State</label>
                <input 
                  type="text" 
                  value={student.state || ''} 
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 h-full hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <GraduationCap size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Academic Information</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Department</label>
                <input 
                  type="text" 
                  value={student.branch || ''} 
                  onChange={(e) => handleInputChange('branch', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" 
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Course</label>
                <input 
                  type="text" 
                  value={student.course || ''} 
                  onChange={(e) => handleInputChange('course', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Passing Year</label>
                <input 
                  type="number" 
                  value={student.passingYear || ''} 
                  onChange={(e) => handleInputChange('passingYear', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Current CGPA</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={student.cgpa || ''} 
                  onChange={(e) => handleInputChange('cgpa', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-black text-blue-600 transition-all bg-gray-50/30 outline-none focus:ring-2 focus:ring-blue-500/20" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">10th %</label>
                <input 
                  type="number" 
                  value={student.tenthPercent || ''} 
                  onChange={(e) => handleInputChange('tenthPercent', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-all bg-gray-50/30 outline-none focus:ring-2 focus:ring-blue-500/20" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">12th %</label>
                <input 
                  type="number" 
                  value={student.twelfthPercent || ''} 
                  onChange={(e) => handleInputChange('twelfthPercent', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-all bg-gray-50/30 outline-none focus:ring-2 focus:ring-blue-500/20" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Skills & Projects */}
        <div className="col-span-12">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                  <Award size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Skills & Projects</h3>
              </div>
              <button className="bg-blue-950 text-white px-5 py-2 rounded-xl font-bold text-xs hover:bg-black transition-all flex items-center gap-2 shadow-sm">
                <Plus size={14} /> Add Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 block">Technical Skills</label>
                <div className="flex flex-wrap gap-2 mb-4 p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                  {skills.map((skill, i) => {
                    const verification = student.verifiedSkills?.find((v: any) => v.skill === skill);
                    return (
                      <div key={i} className="flex flex-col gap-1 items-start">
                        <div className="flex items-center gap-1.5 bg-blue-950 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm animate-in zoom-in duration-300">
                          {skill}
                          <button onClick={() => removeSkill(skill)} className="hover:text-red-300 transition-colors">
                            <Plus size={12} className="rotate-45" />
                          </button>
                        </div>
                        {verification ? (
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            verification.status === 'Verified' ? 'text-emerald-600 bg-emerald-50' : 
                            verification.status === 'Rejected' ? 'text-rose-600 bg-rose-50' : 'text-amber-600 bg-amber-50'
                          }`}>
                            {verification.status}
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleRequestVerification(skill)}
                            className="text-[9px] font-bold text-blue-600 hover:underline uppercase px-1.5"
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <input 
                    type="text" 
                    placeholder="Type and press enter..." 
                    className="flex-1 bg-transparent text-xs font-semibold outline-none min-w-[150px] py-1"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={addSkill}
                  />
                </div>
              </div>

              <div className="md:col-span-7">
                {student.projects?.map((project: any, i: number) => (
                  <div key={i} className="bg-gray-50/50 border border-gray-100 p-6 rounded-2xl relative group hover:border-blue-100 hover:bg-blue-50/30 transition-all mb-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-bold text-gray-900">{project.title}</h4>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 size={14} /></button>
                        <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-6">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies?.map((tech: string, j: number) => (
                        <span key={j} className="px-2.5 py-1 bg-blue-100/50 text-blue-700 text-[10px] font-bold uppercase rounded-md tracking-wide">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {!student.projects?.length && (
                  <p className="text-gray-400 italic text-sm text-center py-10">No projects added yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Resume & Security */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 h-full hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                <FileText size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Resume Section</h3>
            </div>
            
              <div className="space-y-4">
                {student.resumes?.map((res: any, i: number) => (
                  <div key={i} className={`p-4 rounded-2xl border ${res.isDefault ? 'border-blue-200 bg-blue-50/20' : 'border-gray-100 bg-gray-50/30'} flex items-center justify-between group transition-all`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${res.isDefault ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{res.name}</h4>
                        <p className="text-[10px] text-gray-400 font-medium">Uploaded on {new Date(res.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!res.isDefault && (
                        <button 
                          onClick={() => handleSetDefaultResume(res._id)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Set as Default"
                        >
                          <Shield size={14} />
                        </button>
                      )}
                      <a 
                        href={res.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="Download"
                      >
                        <Download size={14} />
                      </a>
                      <button 
                        onClick={() => handleDeleteResume(res._id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50/10 hover:border-blue-200 hover:bg-blue-50/30 transition-all text-center">
                  <button className="bg-blue-950 text-white px-6 py-2 rounded-xl font-bold text-xs hover:bg-black transition-all flex items-center gap-2 shadow-sm active:scale-95">
                    <Plus size={14} /> Upload New Resume
                  </button>
                  <p className="text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-widest">Accepted file types: PDF only. Max size 5MB.</p>
                </div>
              </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 h-full hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                <Shield size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Security</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-all bg-gray-50/30 outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-all bg-gray-50/30 outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-all bg-gray-50/30 outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <button className="w-full bg-blue-950 text-white py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-[0.98] mt-4 flex items-center justify-center gap-2 group">
                Update Password
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Graduation & Mentorship (Conditional) */}
        {student.passingYear <= new Date().getFullYear() && (
          <div className="col-span-12">
            <div className="bg-[#000613] text-white rounded-[40px] p-10 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-blue-500/30 transition-all duration-1000" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/10 rounded-2xl text-blue-400 border border-white/10">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight leading-none">Class of {student.passingYear} Graduation Perks</h2>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2">Alumni Engagement Program</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-lg font-medium leading-relaxed">
                    You've reached an incredible milestone! Join our <span className="text-blue-400 font-black">Alumni Mentor Network</span> to help the next generation of students. Post job referrals from your company or provide 1-on-1 career guidance.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <button 
                        onClick={async () => {
                            if (confirm('Join the Alumni program to share your industry experience?')) {
                                try {
                                    await api.put('/profile', { role: 'alumni' });
                                    alert('Welcome to the Alumni Network! Please relogin to access your new portal.');
                                    localStorage.removeItem('token');
                                    window.location.href = '/login';
                                } catch(err) { alert('Failed to join program'); }
                            }
                        }}
                        className="px-8 py-4 bg-white text-[#000613] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl active:scale-95"
                    >
                        Join as Alumni
                    </button>
                    <button 
                         onClick={async () => {
                            if (confirm('Become a Certified Mentor? This requires a quick profile review by admins.')) {
                                try {
                                    await api.put('/profile', { role: 'mentor' });
                                    alert('Mentor request sent! Our team will review your profile shortly.');
                                } catch(err) { alert('Failed to submit request'); }
                            }
                        }}
                        className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95"
                    >
                        Apply for Mentorship
                    </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      
      {/* Bottom Padding for scroll space */}
      <div className="h-12"></div>
    </div>
  );
};

export default Profile;
