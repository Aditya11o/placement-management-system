import React, { useState } from 'react';
import { 
  User, GraduationCap, Award, Shield, FileText, Plus, Trash2, 
  Edit2, Camera, Upload, ChevronRight, Download
} from 'lucide-react';

const Profile: React.FC = () => {
  // Mock state for the UI demonstration
  const [skills, setSkills] = useState(['Python', 'React', 'Data Structures', 'AWS', 'TypeScript', 'Node.js']);
  const [newSkill, setNewSkill] = useState('');

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      if (!skills.includes(newSkill.trim())) {
        setSkills([...skills, newSkill.trim()]);
      }
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="grid grid-cols-12 gap-6">
        
        {/* Row 1: Profile Header & Performance */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-gray-50 shadow-sm transition-transform duration-500 group-hover:scale-105">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 bg-blue-950 text-white rounded-lg shadow-lg hover:bg-black transition-all active:scale-90">
                <Camera size={16} />
              </button>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Alex Rivera</h2>
              <p className="text-gray-500 font-medium mt-1 flex items-center justify-center md:justify-start gap-2">
                Computer Science & Engineering <span className="text-gray-300">•</span> Class of 2024
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
                <button className="bg-blue-950 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-md active:scale-95 flex items-center gap-2">
                  Update Profile
                </button>
                <button className="bg-white text-gray-700 border border-gray-200 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm active:scale-95 flex items-center gap-2">
                  <Upload size={16} /> Upload Resume
                </button>
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
                <span className="text-6xl font-black text-white tracking-tighter">9.2</span>
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
              <p className="text-[10px] text-blue-200/60 mt-3 font-medium">Complete your "Skills & Projects" to reach 100%</p>
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
                <input type="text" defaultValue="Alex Rivera" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Email</label>
                <input type="email" defaultValue="alex.rivera@university.edu" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Phone</label>
                <input type="text" defaultValue="+1 (555) 012-3456" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">DOB</label>
                <input type="date" defaultValue="2002-05-15" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Gender</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30 appearance-none">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Address</label>
                <input type="text" defaultValue="123 Academic Lane" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">City</label>
                <input type="text" defaultValue="Silicon Valley" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">State</label>
                <input type="text" defaultValue="California" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" />
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
                <input type="text" defaultValue="Computer Science & Engineering" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-all bg-gray-50/30" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Course</label>
                <input type="text" defaultValue="Bachelor of Technology" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-all bg-gray-50/30" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Year/Semester</label>
                <input type="text" defaultValue="4th Year / 7th Sem" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-all bg-gray-50/30" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Current CGPA</label>
                <input type="text" defaultValue="9.2" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-black text-blue-600 transition-all bg-gray-50/30" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">10th %</label>
                <input type="text" defaultValue="95.0" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-all bg-gray-50/30" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">12th %</label>
                <input type="text" defaultValue="92.4" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-all bg-gray-50/30" />
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
                  {skills.map((skill, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-blue-950 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm animate-in zoom-in duration-300">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-red-300 transition-colors">
                        <Plus size={12} className="rotate-45" />
                      </button>
                    </div>
                  ))}
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
                <div className="bg-gray-50/50 border border-gray-100 p-6 rounded-2xl relative group hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-bold text-gray-900">Smart Attendance System</h4>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 size={14} /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    Developed a real-time face recognition based attendance marking system for large classrooms using Python, OpenCV, and deep learning algorithms.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Python', 'OpenCV', 'MySQL'].map((tech, i) => (
                      <span key={i} className="px-2.5 py-1 bg-blue-100/50 text-blue-700 text-[10px] font-bold uppercase rounded-md tracking-wide">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
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
            
            <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50/30 transition-all hover:border-blue-200 hover:bg-blue-50/30 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                <FileText size={32} />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Alex_Rivera_Resume.pdf</h4>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-6 border-b border-gray-100 pb-1">Last uploaded: Oct 12, 2023</p>
              
              <div className="flex gap-3">
                <button className="bg-blue-950 text-white px-6 py-2 rounded-xl font-bold text-xs hover:bg-black transition-all flex items-center gap-2 shadow-sm active:scale-95">
                  <Download size={14} /> View Resume
                </button>
                <button className="bg-red-50 text-red-600 border border-red-100 px-6 py-2 rounded-xl font-bold text-xs hover:bg-red-100 transition-all active:scale-95 flex items-center gap-2">
                  <Plus className="rotate-45" size={14} /> Delete
                </button>
              </div>
              <p className="text-[10px] text-gray-400 italic mt-6 font-medium">Accepted file types: PDF only. Max size 5MB.</p>
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

      </div>
      
      {/* Bottom Padding for scroll space */}
      <div className="h-12"></div>
    </div>
  );
};

export default Profile;
