import React, { useState } from 'react';
import { 
  Save, Send, RotateCcw, 
  MapPin, Calendar, Users, Briefcase, 
  Eye, Info, ChevronRight, X, 
  Building2, DollarSign, Plus, Trash2
} from 'lucide-react';
import { useAutosave } from '../../hooks/useAutosave';
import Dropdown from '../../components/Dropdown';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

const PostJob: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    title: '',
    role: '',
    type: 'Full-time',
    description: '',
    skills: ['Python', 'React'],
    minCGPA: '7.0',
    course: 'B.Tech / MCA',
    passingYear: '2024',
    location: '',
    salary: '',
    deadline: '',
    openings: '10',
    screeningQuestions: [] as { question: string, type: 'text' | 'boolean' }[]
  });

  const [newSkill, setNewSkill] = useState('');
  const { clearAutosave } = useAutosave('post-job', formData, setFormData);

  const addSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({ 
      ...formData, 
      skills: formData.skills.filter(s => s !== skillToRemove) 
    });
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Post New Role</h1>
        <p className="text-gray-500 mt-2 max-w-2xl text-[14px] leading-relaxed">
          Publish a new job opening to the student portal. Ensure all criteria are accurate to attract the best matching candidates.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Left Column - Form */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-8 text-[13px]">
            
            {/* Primary Job Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Job Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Associate Software Engineer"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Job Role/Position</label>
                <input 
                  type="text" 
                  placeholder="e.g. Backend Development"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full px-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <Dropdown 
                  label="Job Type"
                  value={formData.type}
                  onChange={val => setFormData({...formData, type: val})}
                  options={['Full-time', 'Internship', 'Part-time']}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Job Description</label>
              <textarea 
                placeholder="Detailed description of the role and responsibilities..."
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-5 py-4 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-medium text-gray-600 leading-relaxed focus:outline-none transition-all resize-none"
              />
            </div>

            {/* Required Skills */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Required Skills</label>
              <div className="flex flex-wrap gap-2 p-2 bg-gray-100 rounded-xl min-h-[56px] items-center">
                {formData.skills.map(skill => (
                  <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg font-bold text-gray-700 shadow-sm animate-in fade-in zoom-in duration-200">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="text-gray-400 hover:text-rose-500">
                      <X size={14} />
                    </button>
                  </span>
                ))}
                <input 
                  type="text"
                  placeholder="Add skill..."
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSkill()}
                  className="bg-transparent border-none focus:ring-0 px-3 py-1.5 font-medium text-gray-600 focus:outline-none min-w-[120px]"
                />
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div className="space-y-6 pt-4">
              <h3 className="text-[14px] font-black text-gray-900 tracking-tight">Eligibility Criteria</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Min CGPA</label>
                  <input 
                    type="text" 
                    value={formData.minCGPA}
                    onChange={e => setFormData({...formData, minCGPA: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Course</label>
                  <input 
                    type="text" 
                    value={formData.course}
                    onChange={e => setFormData({...formData, course: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Passing Year</label>
                  <input 
                    type="text" 
                    value={formData.passingYear}
                    onChange={e => setFormData({...formData, passingYear: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Location & Package */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Job Location</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Bangalore, India"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full pl-12 pr-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Salary/Stipend (LPA)</label>
                <div className="relative">
                  <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="e.g. 12 - 15 LPA"
                    value={formData.salary}
                    onChange={e => setFormData({...formData, salary: e.target.value})}
                    className="w-full pl-12 pr-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Deadline & Openings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Application Last Date</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="date" 
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                    className="w-full pl-12 pr-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all cursor-pointer"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Number of Openings</label>
                <div className="relative">
                  <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={formData.openings}
                    onChange={e => setFormData({...formData, openings: e.target.value})}
                    className="w-full pl-12 pr-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Screening Questions */}
            <div className="space-y-6 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-[14px] font-black text-gray-900 tracking-tight">Custom Screening Questions</h3>
                <button 
                  onClick={() => setFormData({
                    ...formData, 
                    screeningQuestions: [...formData.screeningQuestions, { question: '', type: 'text' }]
                  })}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> Add Question
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.screeningQuestions.map((q, i) => (
                  <div key={i} className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl border border-gray-100 group">
                    <div className="flex-1 space-y-3">
                      <input 
                        type="text"
                        placeholder="e.g. Why are you interested in this role?"
                        value={q.question}
                        onChange={(e) => {
                          const newQs = [...formData.screeningQuestions];
                          newQs[i].question = e.target.value;
                          setFormData({ ...formData, screeningQuestions: newQs });
                        }}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            checked={q.type === 'text'} 
                            onChange={() => {
                              const newQs = [...formData.screeningQuestions];
                              newQs[i].type = 'text';
                              setFormData({ ...formData, screeningQuestions: newQs });
                            }}
                            className="text-blue-600 focus:ring-blue-500" 
                          />
                          <span className="text-[11px] font-bold text-gray-600">Text Response</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            checked={q.type === 'boolean'} 
                            onChange={() => {
                              const newQs = [...formData.screeningQuestions];
                              newQs[i].type = 'boolean';
                              setFormData({ ...formData, screeningQuestions: newQs });
                            }}
                            className="text-blue-600 focus:ring-blue-500" 
                          />
                          <span className="text-[11px] font-bold text-gray-600">Yes / No</span>
                        </label>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const newQs = formData.screeningQuestions.filter((_, idx) => idx !== i);
                        setFormData({ ...formData, screeningQuestions: newQs });
                      }}
                      className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {formData.screeningQuestions.length === 0 && (
                  <p className="text-center text-gray-400 italic py-4 border-2 border-dashed border-gray-100 rounded-xl">No screening questions added yet.</p>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center pt-8 border-t border-gray-100">
              <button 
                onClick={() => {
                  setFormData({
                    title: '', role: '', type: 'Full-time', description: '',
                    skills: [], minCGPA: '', course: '', passingYear: '',
                    location: '', salary: '', deadline: '', openings: '',
                    screeningQuestions: []
                  });
                  clearAutosave();
                }}
                className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
              >
                <RotateCcw size={14} />
                Reset Form
              </button>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-3.5 border border-gray-200 text-gray-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                  <Save size={14} />
                  Save as Draft
                </button>
                <button 
                  onClick={async () => {
                    try {
                      await api.post('/jobs', formData);
                      showSuccess('Job posted successfully!', 'Job Published');
                      clearAutosave();
                    } catch (err: any) {
                      console.error(err);
                      showError(err.response?.data?.message || 'Failed to post job. Please check all fields.', 'Publication Error');
                    }
                  }}
                  className="w-full sm:w-auto px-12 py-3.5 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Send size={14} />
                  Post Job
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Preview & Note */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Live Preview Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Eye size={12} />
                Live Preview
              </h3>
            </div>
            
            <div className="p-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                    <Building2 size={20} />
                  </div>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-wider rounded">New</span>
                </div>

                <div>
                  <h4 className="text-lg font-black text-gray-900 tracking-tight leading-tight">
                    {formData.title || 'e.g. Associate Software Engineer'}
                  </h4>
                  <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wide">Global Dynamics Inc.</p>
                </div>

                <div className="space-y-2 border-t border-gray-50 pt-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                    <MapPin size={14} className="text-gray-400" />
                    {formData.location || 'Bangalore, India'}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                    <Briefcase size={14} className="text-gray-400" />
                    {formData.salary || '12 - 15 LPA'}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                    <Calendar size={14} className="text-gray-400" />
                    Apply by {formData.deadline ? new Date(formData.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 24, 2023'}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.skills.map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[9px] font-black uppercase tracking-tighter border border-gray-100">
                      {skill}
                    </span>
                  ))}
                </div>

                <button className="w-full mt-4 flex items-center justify-end gap-1 text-[11px] font-black text-blue-600 uppercase tracking-widest hover:gap-2 transition-all">
                  View Details
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Info Note Card */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm border border-gray-100 flex-shrink-0">
              <Info size={20} />
            </div>
            <div>
              <p className="text-[12px] font-medium text-gray-500 leading-relaxed">
                This is a simulation of how students will see your post in their portal. Please <span className="text-gray-900 font-black">double-check</span> the salary and deadline.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default PostJob;
