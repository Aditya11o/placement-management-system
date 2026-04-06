import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Save, Send, RotateCcw, MapPin, Calendar, 
  Users, X, DollarSign, Loader2, 
  ArrowRight, ArrowLeft, CheckCircle2
} from 'lucide-react';
import { useAutosave } from '../../hooks/useAutosave';
import Dropdown from '../../components/Dropdown';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import JobPreviewSidebar from '../../components/postjob/JobPreviewSidebar';
import ScreeningQuestions from '../../components/postjob/ScreeningQuestions';
import FormStepper from '../../components/FormStepper';

const PostJob: React.FC = () => {
  const { showSuccess, showError, showWarning } = useNotification();
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const editId = new URLSearchParams(location.search).get('edit');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    title: '', role: '', type: 'Full-time', description: '',
    skills: ['Python', 'React'], minCGPA: '7.0', course: 'B.Tech / MCA',
    passingYear: '2024', location: '', salary: '', deadline: '',
    openings: '10', screeningQuestions: [] as { question: string, type: 'text' | 'boolean' }[]
  });
  const [newSkill, setNewSkill] = useState('');
  const { clearAutosave } = useAutosave('post-job', formData, setFormData);

  const steps = [
    { id: 1, label: 'Overview', description: 'Basic job details' },
    { id: 2, label: 'Requirements', description: 'Skills & eligibility' },
    { id: 3, label: 'Logistics', description: 'Location & timeline' },
    { id: 4, label: 'Screening', description: 'Custom questions' }
  ];

  useEffect(() => {
    if (!editId) return;
    (async () => {
      setFetching(true);
      try {
        const { data } = await api.get(`/jobs/${editId}`);
        setFormData({
          title: data.title || '', role: data.role || '', type: data.jobType || 'Full-time',
          description: data.description || '', skills: data.skills || [],
          minCGPA: data.eligibility?.minCGPA || '7.0', course: data.eligibility?.course || '',
          passingYear: data.eligibility?.passingYear || '', location: data.location || '',
          salary: data.salary || '',
          deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '',
          openings: data.openings?.toString() || '1', screeningQuestions: data.screeningQuestions || []
        });
      } catch { showError('Failed to fetch job details'); navigate('/recruiter/jobs'); }
      finally { setFetching(false); }
    })();
  }, [editId]);

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.title || !formData.role || !formData.description) {
          showWarning('Please fill in all basic job details.', 'Validation Error');
          return false;
        }
        break;
      case 2:
        if (formData.skills.length === 0 || !formData.minCGPA || !formData.course) {
          showWarning('Please provide skills and eligibility criteria.', 'Validation Error');
          return false;
        }
        break;
      case 3:
        if (!formData.location || !formData.salary || !formData.deadline) {
          showWarning('Please provide location, salary, and deadline.', 'Validation Error');
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return; // Final validate of core fields
    setLoading(true);
    try {
      const payload = {
        title: formData.title, role: formData.role, jobType: formData.type,
        description: formData.description, requiredSkills: formData.skills,
        eligibility: { minCGPA: formData.minCGPA, course: formData.course, passingYear: formData.passingYear },
        location: formData.location, salary: formData.salary, deadline: formData.deadline,
        openings: parseInt(formData.openings), screeningQuestions: formData.screeningQuestions
      };
      if (editId) { await api.put(`/jobs/${editId}`, payload); showSuccess('Job updated successfully!'); }
      else { await api.post('/jobs', payload); showSuccess('Job posted successfully!'); }
      clearAutosave(); navigate('/recruiter/jobs');
    } catch (err: any) { showError(err.response?.data?.message || 'Failed to save job'); }
    finally { setLoading(false); }
  };

  const addSkill = () => { if (newSkill && !formData.skills.includes(newSkill)) { setFormData({ ...formData, skills: [...formData.skills, newSkill] }); setNewSkill(''); } };
  const removeSkill = (s: string) => setFormData({ ...formData, skills: formData.skills.filter(x => x !== s) });
  const f = (key: string, val: string) => setFormData({ ...formData, [key]: val });

  return (
    <div className="space-y-8 pb-12 overflow-x-hidden">
      {/* Header with animation */}
      <div className="animate-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase tracking-tighter italic">
          {editId ? 'Edit' : 'Post'} <span className="text-blue-600">Opportunity</span>
        </h1>
        <p className="text-gray-500 mt-2 max-w-2xl text-[14px] leading-relaxed font-medium">
          {editId ? 'Refine the strategic requirements for this position.' : 'Deploy a new professional gateway to attract the academy\'s elite talent.'}
        </p>
      </div>

      {/* Stepper Card */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-4 shadow-sm">
        <FormStepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white border border-gray-200 rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-black/5 relative overflow-hidden">
            
            {/* Step Indicators in Content */}
            <div className="mb-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-lg italic shadow-inner">
                {currentStep}
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{steps[currentStep-1].label}</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{steps[currentStep-1].description}</p>
              </div>
            </div>

            {/* Form Content mapping to steps */}
            <div className="space-y-8 text-[13px] min-h-[400px]">
              
              {currentStep === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2 space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1 italic">Job Title</label>
                      <input type="text" placeholder="e.g. Associate Software Engineer" value={formData.title} onChange={e => f('title', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-100 rounded-2xl font-bold text-gray-900 focus:outline-none transition-all shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1 italic">Functional Role</label>
                      <input type="text" placeholder="e.g. Backend Development" value={formData.role} onChange={e => f('role', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-100 rounded-2xl font-bold text-gray-900 focus:outline-none transition-all shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <Dropdown label="Engagement Type" value={formData.type} onChange={val => f('type', val)} options={['Full-time', 'Internship', 'Part-time']} italic />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1 italic">Professional Scope (Description)</label>
                    <textarea placeholder="Detailed description of the role and responsibilities..." rows={6} value={formData.description} onChange={e => f('description', e.target.value)} className="w-full px-6 py-5 bg-gray-50 border-transparent focus:bg-white focus:border-blue-100 rounded-3xl font-medium text-gray-600 leading-relaxed focus:outline-none transition-all resize-none shadow-inner" />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1 italic">Prerequisite Skills</label>
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-3xl min-h-[100px] items-start shadow-inner border border-gray-100">
                      {formData.skills.map(skill => (
                        <span key={skill} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl font-black text-[11px] text-gray-700 shadow-sm animate-in zoom-in duration-200 group">
                          {skill}
                          <button onClick={() => removeSkill(skill)} className="text-gray-300 group-hover:text-rose-500 transition-colors">
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                      <input 
                        type="text" 
                        placeholder="Type and press Enter..." 
                        value={newSkill} 
                        onChange={e => setNewSkill(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && addSkill()} 
                        className="bg-transparent border-none focus:ring-0 px-4 py-2 font-bold text-gray-600 focus:outline-none min-w-[200px] italic" 
                      />
                    </div>
                  </div>
                  <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-px bg-gray-100 flex-1"></div>
                      <h3 className="text-[11px] font-black text-gray-300 uppercase tracking-[0.3em] italic">Eligibility Protocol</h3>
                      <div className="h-px bg-gray-100 flex-1"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Min CGPA</label>
                        <input type="text" value={formData.minCGPA} onChange={e => f('minCGPA', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-100 rounded-2xl font-black text-gray-900 focus:outline-none transition-all shadow-inner" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Academic Course</label>
                        <input type="text" value={formData.course} onChange={e => f('course', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-100 rounded-2xl font-black text-gray-900 focus:outline-none transition-all shadow-inner" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Batch Year</label>
                        <input type="text" value={formData.passingYear} onChange={e => f('passingYear', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-100 rounded-2xl font-black text-gray-900 focus:outline-none transition-all shadow-inner" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1 italic">Primary Location</label>
                      <div className="relative group">
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input type="text" placeholder="Bangalore, India" value={formData.location} onChange={e => f('location', e.target.value)} className="w-full pl-14 pr-6 py-5 bg-gray-50 border-transparent focus:bg-white focus:border-blue-100 rounded-3xl font-bold text-gray-900 focus:outline-none transition-all shadow-inner" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1 italic">Compensation Package</label>
                      <div className="relative group">
                        <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        <input type="text" placeholder="e.g. 12 - 15 LPA" value={formData.salary} onChange={e => f('salary', e.target.value)} className="w-full pl-14 pr-6 py-5 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-100 rounded-3xl font-bold text-gray-900 focus:outline-none transition-all shadow-inner" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1 italic">Application Deadline</label>
                      <div className="relative group">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input type="date" value={formData.deadline} onChange={e => f('deadline', e.target.value)} className="w-full pl-14 pr-6 py-5 bg-gray-50 border-transparent focus:bg-white focus:border-blue-100 rounded-3xl font-bold text-gray-900 focus:outline-none transition-all cursor-pointer shadow-inner" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1 italic">Personnel Openings</label>
                      <div className="relative group">
                        <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input type="text" value={formData.openings} onChange={e => f('openings', e.target.value)} className="w-full pl-14 pr-6 py-5 bg-gray-50 border-transparent focus:bg-white focus:border-blue-100 rounded-3xl font-bold text-gray-900 focus:outline-none transition-all shadow-inner" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 flex items-start gap-4 mb-4">
                    <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-black text-gray-900 tracking-tight uppercase tracking-widest italic">Final Protocol</h4>
                      <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase italic leading-tight">Add screening questions to filter candidates more effectively.</p>
                    </div>
                  </div>
                  <ScreeningQuestions questions={formData.screeningQuestions} onChange={(q) => setFormData({ ...formData, screeningQuestions: q })} />
                </div>
              )}

            </div>

            {/* Step Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-10 border-t border-gray-100 gap-6 mt-8">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => { 
                    if (confirm('Are you sure you want to reset the entire form?')) {
                      setFormData({ title: '', role: '', type: 'Full-time', description: '', skills: [], minCGPA: '', course: '', passingYear: '', location: '', salary: '', deadline: '', openings: '', screeningQuestions: [] }); 
                      clearAutosave(); 
                      setCurrentStep(1);
                    }
                  }} 
                  className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-rose-500 transition-colors italic"
                >
                  <RotateCcw size={14} /> Reset
                </button>
                <button 
                  disabled={loading || fetching}
                  className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors italic disabled:opacity-50"
                >
                  <Save size={14} /> Save Draft
                </button>
              </div>

              <div className="flex gap-4 w-full sm:w-auto">
                {currentStep > 1 && (
                  <button 
                    onClick={prevStep}
                    className="flex-1 sm:flex-none px-8 py-4 border-2 border-gray-100 text-gray-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2 italic"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                )}
                
                {currentStep < steps.length ? (
                  <button 
                    onClick={nextStep}
                    className="flex-1 sm:flex-none px-10 py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95 italic"
                  >
                    Next Step <ArrowRight size={16} />
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit} 
                    disabled={loading || fetching} 
                    className="flex-1 sm:flex-none px-12 py-4 bg-[#000613] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 italic"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    {editId ? 'Apply Updates' : 'Deploy Deployment'}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Sidebar hides on small screens or remains for context */}
        <div className="hidden lg:block lg:col-span-4 sticky top-6">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm mb-6">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 italic">Real-time Visualization</h3>
            <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              <JobPreviewSidebar formData={formData} companyName={profile?.recruiterDetails?.companyName || ''} />
            </div>
          </div>
          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-600/20">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
             <div className="relative z-10">
               <h4 className="text-lg font-black tracking-tight mb-2 uppercase tracking-tighter italic">Strategic Tip</h4>
               <p className="text-[11px] font-bold text-blue-100 leading-relaxed uppercase italic opacity-80">
                 Role descriptions that list specific day-to-day impacts see 40% higher engagement from top-tier candidates.
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
