import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Save, Send, RotateCcw, MapPin, Calendar, Users, X, DollarSign, Loader2 } from 'lucide-react';
import { useAutosave } from '../../hooks/useAutosave';
import Dropdown from '../../components/Dropdown';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import JobPreviewSidebar from '../../components/postjob/JobPreviewSidebar';
import ScreeningQuestions from '../../components/postjob/ScreeningQuestions';

const PostJob: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const editId = new URLSearchParams(location.search).get('edit');
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        title: formData.title, role: formData.role, jobType: formData.type,
        description: formData.description, skills: formData.skills,
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
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{editId ? 'Edit Role' : 'Post New Role'}</h1>
        <p className="text-gray-500 mt-2 max-w-2xl text-[14px] leading-relaxed">
          {editId ? 'Modify the job details and requirements for this position.' : 'Publish a new job opening to the student portal. Ensure all criteria are accurate to attract the best matching candidates.'}
        </p>
      </div>
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-8 text-[13px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Job Title</label>
                <input type="text" placeholder="e.g. Associate Software Engineer" value={formData.title} onChange={e => f('title', e.target.value)} className="w-full px-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Job Role/Position</label>
                <input type="text" placeholder="e.g. Backend Development" value={formData.role} onChange={e => f('role', e.target.value)} className="w-full px-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <Dropdown label="Job Type" value={formData.type} onChange={val => f('type', val)} options={['Full-time', 'Internship', 'Part-time']} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Job Description</label>
              <textarea placeholder="Detailed description of the role and responsibilities..." rows={4} value={formData.description} onChange={e => f('description', e.target.value)} className="w-full px-5 py-4 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-medium text-gray-600 leading-relaxed focus:outline-none transition-all resize-none" />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Required Skills</label>
              <div className="flex flex-wrap gap-2 p-2 bg-gray-100 rounded-xl min-h-[56px] items-center">
                {formData.skills.map(skill => (
                  <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg font-bold text-gray-700 shadow-sm animate-in fade-in zoom-in duration-200">
                    {skill}<button onClick={() => removeSkill(skill)} className="text-gray-400 hover:text-rose-500"><X size={14} /></button>
                  </span>
                ))}
                <input type="text" placeholder="Add skill..." value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} className="bg-transparent border-none focus:ring-0 px-3 py-1.5 font-medium text-gray-600 focus:outline-none min-w-[120px]" />
              </div>
            </div>
            <div className="space-y-6 pt-4">
              <h3 className="text-[14px] font-black text-gray-900 tracking-tight">Eligibility Criteria</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2"><label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Min CGPA</label><input type="text" value={formData.minCGPA} onChange={e => f('minCGPA', e.target.value)} className="w-full px-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all" /></div>
                <div className="space-y-2"><label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Course</label><input type="text" value={formData.course} onChange={e => f('course', e.target.value)} className="w-full px-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all" /></div>
                <div className="space-y-2"><label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Passing Year</label><input type="text" value={formData.passingYear} onChange={e => f('passingYear', e.target.value)} className="w-full px-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all" /></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Job Location</label><div className="relative"><MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="Bangalore, India" value={formData.location} onChange={e => f('location', e.target.value)} className="w-full pl-12 pr-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all" /></div></div>
              <div className="space-y-2"><label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Salary/Stipend (LPA)</label><div className="relative"><DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="e.g. 12 - 15 LPA" value={formData.salary} onChange={e => f('salary', e.target.value)} className="w-full pl-12 pr-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all" /></div></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Application Last Date</label><div className="relative"><Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="date" value={formData.deadline} onChange={e => f('deadline', e.target.value)} className="w-full pl-12 pr-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all cursor-pointer" /></div></div>
              <div className="space-y-2"><label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Number of Openings</label><div className="relative"><Users className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" value={formData.openings} onChange={e => f('openings', e.target.value)} className="w-full pl-12 pr-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all" /></div></div>
            </div>
            <ScreeningQuestions questions={formData.screeningQuestions} onChange={(q) => setFormData({ ...formData, screeningQuestions: q })} />
            <div className="flex justify-between items-center pt-8 border-t border-gray-100">
              <button onClick={() => { setFormData({ title: '', role: '', type: 'Full-time', description: '', skills: [], minCGPA: '', course: '', passingYear: '', location: '', salary: '', deadline: '', openings: '', screeningQuestions: [] }); clearAutosave(); }} className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-rose-500 transition-colors"><RotateCcw size={14} />Reset Form</button>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button disabled={loading || fetching} className="w-full sm:w-auto px-8 py-3.5 border border-gray-200 text-gray-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"><Save size={14} />Save as Draft</button>
                <button onClick={handleSubmit} disabled={loading || fetching} className="w-full sm:w-auto px-12 py-3.5 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">{loading ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}{editId ? 'Update Role' : 'Publish Role'}</button>
              </div>
            </div>
          </div>
        </div>
        <JobPreviewSidebar formData={formData} companyName={profile?.recruiterDetails?.companyName || ''} />
      </div>
    </div>
  );
};

export default PostJob;
