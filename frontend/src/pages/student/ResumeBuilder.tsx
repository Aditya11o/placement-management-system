import React, { useState, useEffect } from 'react';
import { 
  User, GraduationCap, Briefcase, 
  Plus, Trash2, 
  Sparkles, ChevronRight, ChevronLeft, 
  Save, Eye, Download, Layout,
  Linkedin, Mail, Phone, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { generateResumePDF, ResumeTemplate } from '../../utils/pdfGenerator';

const ResumeBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // Step 0 is Template Selection
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [template, setTemplate] = useState<ResumeTemplate>('modern');

  const [formData, setFormData] = useState({
    personal: { name: '', email: '', phone: '', location: '', linkedin: '', summary: '' },
    education: [{ school: '', degree: '', year: '', cgpa: '' }],
    experience: [{ company: '', role: '', duration: '', description: '' }],
    skills: [''],
  });

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('pms_resume_draft');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('pms_resume_draft', JSON.stringify(formData));
  }, [formData]);

  const handleAddField = (section: 'education' | 'experience' | 'skills') => {
    if (section === 'skills') {
      setFormData({ ...formData, skills: [...formData.skills, ''] });
    } else {
      const newItem = section === 'education' 
        ? { school: '', degree: '', year: '', cgpa: '' }
        : { company: '', role: '', duration: '', description: '' };
      setFormData({ ...formData, [section]: [...formData[section], newItem] });
    }
  };

  const handleRemoveField = (section: 'education' | 'experience' | 'skills', index: number) => {
    const updated = [...formData[section]];
    updated.splice(index, 1);
    setFormData({ ...formData, [section]: updated });
  };

  const handleUpdateField = (section: keyof typeof formData, index: number, field: string, value: string) => {
    if (section === 'personal') {
      setFormData(prev => ({ 
        ...prev, 
        personal: { ...prev.personal, [field]: value } 
      }));
    } else if (section === 'skills') {
      const updated = [...formData.skills];
      updated[index] = value;
      setFormData(prev => ({ ...prev, skills: updated }));
    } else {
      const updated = section === 'education' 
        ? [...formData.education] 
        : [...formData.experience];
      
      (updated[index] as any)[field] = value;
      setFormData(prev => ({ ...prev, [section]: updated }));
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      await generateResumePDF(formData, template);
      toast.success('Resume PDF generated successfully!');
    } catch (err) {
      toast.error('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      // Simulate API call to save to DB
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Resume saved to your profile!');
      navigate('/student/settings?tab=resumes');
    } catch (err) {
      toast.error('Failed to save to profile');
    } finally {
      setLoading(false);
    }
  };

  const ResumePreview = () => (
    <div className={`w-full h-full bg-white shadow-2xl p-8 overflow-y-auto font-sans ${template === 'classic' ? 'font-serif' : ''}`}>
      {/* Header Preview */}
      <div className={`text-center space-y-2 border-b-2 pb-6 ${template === 'sidebar' ? 'text-left' : ''}`}>
        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">
          {formData.personal.name || 'Your Full Name'}
        </h2>
        <div className="flex flex-wrap justify-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {formData.personal.email && <span className="flex items-center gap-1"><Mail size={10} /> {formData.personal.email}</span>}
          {formData.personal.phone && <span className="flex items-center gap-1"><Phone size={10} /> {formData.personal.phone}</span>}
          {formData.personal.location && <span className="flex items-center gap-1"><MapPin size={10} /> {formData.personal.location}</span>}
          {formData.personal.linkedin && <span className="flex items-center gap-1"><Linkedin size={10} /> LinkedIn Profile</span>}
        </div>
      </div>

      {/* Summary */}
      {formData.personal.summary && (
        <div className="mt-8">
          <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-3">Professional Summary</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{formData.personal.summary}</p>
        </div>
      )}

      {/* Experience */}
      {formData.experience[0].company && (
        <div className="mt-8">
          <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Experience</h3>
          <div className="space-y-6">
            {formData.experience.map((exp, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{exp.role}</h4>
                  <p className="text-xs font-bold text-gray-400">{exp.company}</p>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed italic">{exp.description}</p>
                </div>
                <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded uppercase">{exp.duration}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {formData.education[0].school && (
        <div className="mt-8">
          <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Education</h3>
          <div className="space-y-6">
            {formData.education.map((edu, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">{edu.school}</h4>
                  <p className="text-xs font-bold text-gray-400">{edu.degree}</p>
                  {edu.cgpa && <p className="text-[10px] font-black text-blue-500 mt-1 uppercase tracking-widest">GPA: {edu.cgpa}</p>}
                </div>
                <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded uppercase">{edu.year}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {formData.skills[0] && (
        <div className="mt-8">
          <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Core Competencies</h3>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] font-display">
            <Sparkles size={14} /> Professional Exporter
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
            Resume <span className="text-gray-300">Hub</span>
          </h1>
          <p className="text-gray-400 font-medium max-w-sm">Design, preview, and download your high-authority resume in multiple templates.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              showPreview ? 'bg-blue-600 text-white' : 'bg-gray-50 border border-gray-100 text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Eye size={14} /> {showPreview ? 'Edit Form' : 'Live Preview'}
          </button>
          <button 
            onClick={handleDownload}
            disabled={loading}
            className="px-6 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all flex items-center gap-2"
          >
            {loading ? <span className="animate-spin">●</span> : <Download size={14} />}
            Download PDF
          </button>
          <button 
            onClick={handleFinalize}
            disabled={loading}
            className="px-8 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-black/5 flex items-center gap-2"
          >
            <Save size={14} /> Save to Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        
        {/* Navigation Sidebar */}
        <div className="col-span-12 lg:col-span-3">
          <div className="sticky top-6 space-y-2">
            {[
              { id: 0, label: 'Templates', icon: Layout },
              { id: 1, label: 'Contact Info', icon: User },
              { id: 2, label: 'Education', icon: GraduationCap },
              { id: 3, label: 'Experience', icon: Briefcase },
              { id: 4, label: 'Skills & Tools', icon: Plus },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => { setStep(s.id); setShowPreview(false); }}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  step === s.id ? 'bg-gray-900 text-white shadow-xl scale-[1.02]' : 'bg-white text-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <s.icon size={16} />
                  {s.label}
                </div>
                {step > s.id && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        {/* Builder Content */}
        <div className="col-span-12 lg:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* Form Section */}
            <div className={`bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm min-h-[600px] transition-all duration-500 ${showPreview ? 'hidden md:block' : 'col-span-2'}`}>
              
              {step === 0 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                      <Layout size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 uppercase">Select Template</h2>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { id: 'classic' as ResumeTemplate, name: 'The Classic', desc: 'Serif, centered, formal.' },
                      { id: 'modern' as ResumeTemplate, name: 'The Modern', desc: 'Sans-serif, blue accents.' },
                      { id: 'sidebar' as ResumeTemplate, name: 'The Sidebar', desc: 'Two-column, creative.' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTemplate(t.id)}
                        className={`p-6 rounded-[2.5rem] border-2 text-left transition-all ${
                          template === t.id ? 'border-blue-600 bg-blue-50/30' : 'border-gray-50 hover:border-gray-200 bg-gray-50/50'
                        }`}
                      >
                        <div className={`w-full aspect-[3/4] rounded-xl mb-4 shadow-sm border border-gray-100 ${template === t.id ? 'bg-white' : 'bg-gray-100'}`}>
                          {/* Mini Layout Mockup */}
                          {t.id === 'classic' && <div className="p-2 space-y-1"><div className="w-1/2 h-1 bg-gray-300 mx-auto"/><div className="w-full h-1 bg-gray-200"/><div className="w-full h-1 bg-gray-200"/></div>}
                          {t.id === 'modern' && <div className="p-2 text-left space-y-1"><div className="w-2/3 h-1.5 bg-blue-400"/><div className="w-full h-1 bg-gray-200"/><div className="w-full h-1 bg-gray-200"/></div>}
                          {t.id === 'sidebar' && <div className="flex h-full"><div className="w-1/3 bg-gray-200"/><div className="w-2/3 p-2 space-y-1"><div className="w-full h-1 bg-gray-400"/><div className="w-full h-1 bg-gray-200"/></div></div>}
                        </div>
                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{t.name}</p>
                        <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest leading-relaxed">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <User size={20} />
                      </div>
                      <h2 className="text-xl font-black text-gray-900 uppercase">Personal details</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                        <input type="text" value={formData.personal.name} onChange={e => handleUpdateField('personal', 0, 'name', e.target.value)} placeholder="Aditya Halder" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                        <input type="email" value={formData.personal.email} onChange={e => handleUpdateField('personal', 0, 'email', e.target.value)} placeholder="hello@example.com" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</label>
                        <input type="text" value={formData.personal.phone} onChange={e => handleUpdateField('personal', 0, 'phone', e.target.value)} placeholder="+91 XXXX XXX XXX" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</label>
                        <input type="text" value={formData.personal.location} onChange={e => handleUpdateField('personal', 0, 'location', e.target.value)} placeholder="Kolkata, IN" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 transition-all" />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Professional Summary</label>
                        <textarea rows={4} value={formData.personal.summary} onChange={e => handleUpdateField('personal', 0, 'summary', e.target.value)} placeholder="Brief description of your professional persona..." className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 transition-all resize-none" />
                      </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                          <GraduationCap size={20} />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 uppercase">Education</h2>
                      </div>
                      <button onClick={() => handleAddField('education')} className="p-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all">
                        <Plus size={20} />
                      </button>
                  </div>
                  
                  <div className="space-y-6">
                      {formData.education.map((edu, idx) => (
                        <div key={idx} className="p-6 border border-gray-100 rounded-[32px] relative group">
                          <button onClick={() => handleRemoveField('education', idx)} className="absolute top-4 right-4 p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 size={16} />
                          </button>
                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="School Name" value={edu.school} onChange={e => handleUpdateField('education', idx, 'school', e.target.value)} className="col-span-2 border-b border-gray-100 py-2 font-black text-lg focus:border-purple-600 outline-none" />
                            <input type="text" placeholder="Degree" value={edu.degree} onChange={e => handleUpdateField('education', idx, 'degree', e.target.value)} className="py-2 font-bold text-sm border-b border-gray-100" />
                            <input type="text" placeholder="Year" value={edu.year} onChange={e => handleUpdateField('education', idx, 'year', e.target.value)} className="py-2 font-bold text-sm border-b border-gray-100" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                          <Briefcase size={20} />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 uppercase">Work Experience</h2>
                      </div>
                      <button onClick={() => handleAddField('experience')} className="p-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all">
                        <Plus size={20} />
                      </button>
                  </div>
                  
                  <div className="space-y-6">
                      {formData.experience.map((exp, idx) => (
                        <div key={idx} className="p-6 border border-gray-100 rounded-[32px] relative group">
                          <button onClick={() => handleRemoveField('experience', idx)} className="absolute top-4 right-4 p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 size={16} />
                          </button>
                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Company Name" value={exp.company} onChange={e => handleUpdateField('experience', idx, 'company', e.target.value)} className="col-span-2 border-b border-gray-100 py-2 font-black text-lg focus:border-orange-600 outline-none" />
                            <input type="text" placeholder="Role" value={exp.role} onChange={e => handleUpdateField('experience', idx, 'role', e.target.value)} className="py-2 font-bold text-sm border-b border-gray-100" />
                            <input type="text" placeholder="Duration (e.g. 2021 - Present)" value={exp.duration} onChange={e => handleUpdateField('experience', idx, 'duration', e.target.value)} className="py-2 font-bold text-sm border-b border-gray-100" />
                            <textarea placeholder="Description of your duties..." value={exp.description} onChange={e => handleUpdateField('experience', idx, 'description', e.target.value)} className="col-span-2 py-2 font-bold text-xs border-b border-gray-100 resize-none h-20" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                        <Plus size={20} />
                      </div>
                      <h2 className="text-xl font-black text-gray-900 uppercase">Skills & Tools</h2>
                  </div>
                  <div className="flex flex-wrap gap-4">
                      {formData.skills.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl">
                          <input 
                            type="text" 
                            value={skill} 
                            onChange={e => handleUpdateField('skills', idx, '', e.target.value)} 
                            placeholder="Python" 
                            className="bg-transparent font-bold text-sm outline-none w-24"
                          />
                          <button onClick={() => handleRemoveField('skills', idx)} className="text-gray-300 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => handleAddField('skills')} className="px-4 py-2 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 hover:border-blue-600 transition-all font-black text-xs uppercase tracking-widest">
                        Add Skill
                      </button>
                  </div>
                </div>
              )}

              <div className="mt-20 pt-8 border-t border-gray-50 flex items-center justify-between">
                <button
                  onClick={() => step > 0 && setStep(step - 1)}
                  disabled={step === 0}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 disabled:opacity-0 transition-all"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={() => step < 4 && setStep(step + 1)}
                  disabled={step === 4}
                  className="flex items-center gap-2 px-8 py-3 bg-gray-100 text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all disabled:opacity-0"
                >
                  Next Step <ChevronRight size={16} />
                </button>
              </div>

            </div>

            {/* Preview Section */}
            {(showPreview || true) && (
              <div className={`col-span-1 border border-gray-100 rounded-[40px] overflow-hidden shadow-2xl sticky top-6 max-h-[85vh] ${!showPreview ? 'hidden md:block' : 'col-span-2'}`}>
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Live Intelligence Preview</p>
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">Template: {template}</span>
                </div>
                <ResumePreview />
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};


export default ResumeBuilder;
