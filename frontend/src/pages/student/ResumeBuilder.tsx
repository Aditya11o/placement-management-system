import React, { useState, useRef } from 'react';
import { 
  Plus, Trash2, 
  ChevronLeft, ChevronRight, 
  Download, Save, 
  User, Briefcase, GraduationCap, 
  Rocket, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

const ResumeBuilder: React.FC = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const resumeRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: resumeRef,
        documentTitle: 'My_Resume'
    });

    const [formData, setFormData] = useState({
        resume_name: 'New Professional Resume',
        personal: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            github: '',
            summary: ''
        },
        experience: [{ company: '', role: '', duration: '', description: '' }],
        education: [{ institution: '', degree: '', year: '', cgpa: '' }],
        projects: [{ title: '', technologies: '', description: '' }],
        skills: ['']
    });

    const handleAddField = (section: string) => {
        const newData = { ...formData };
        if (section === 'experience') {
            newData.experience.push({ company: '', role: '', duration: '', description: '' });
        } else if (section === 'education') {
            newData.education.push({ institution: '', degree: '', year: '', cgpa: '' });
        } else if (section === 'projects') {
            newData.projects.push({ title: '', technologies: '', description: '' });
        } else if (section === 'skills') {
            newData.skills.push('');
        }
        setFormData(newData);
    };

    const handleRemoveField = (section: string, index: number) => {
        const newData = { ...formData };
        if (section === 'experience') newData.experience.splice(index, 1);
        if (section === 'education') newData.education.splice(index, 1);
        if (section === 'projects') newData.projects.splice(index, 1);
        if (section === 'skills') newData.skills.splice(index, 1);
        setFormData(newData);
    };

    const handleSaveResume = async () => {
        try {
            setSaving(true);
            await api.post('/students/build-resume', {
                resume_name: formData.resume_name,
                content: formData,
                makePrimary: true
            });
            showSuccess('Resume saved and set as primary!');
            navigate('/student/resumes');
        } catch (err) {
            showError('Failed to save resume');
        } finally {
            setSaving(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <User size={20} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Personal Details</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Resume Name" value={formData.resume_name} onChange={(v) => setFormData({...formData, resume_name: v})} placeholder="e.g. Frontend Developer Resume" full />
                            <InputField label="Full Name" value={formData.personal.fullName} onChange={(v) => setFormData({...formData, personal: {...formData.personal, fullName: v}})} />
                            <InputField label="Email Address" value={formData.personal.email} onChange={(v) => setFormData({...formData, personal: {...formData.personal, email: v}})} />
                            <InputField label="Phone Number" value={formData.personal.phone} onChange={(v) => setFormData({...formData, personal: {...formData.personal, phone: v}})} />
                            <InputField label="Location" value={formData.personal.location} onChange={(v) => setFormData({...formData, personal: {...formData.personal, location: v}})} />
                            <InputField label="LinkedIn URL" value={formData.personal.linkedin} onChange={(v) => setFormData({...formData, personal: {...formData.personal, linkedin: v}})} />
                            <InputField label="GitHub URL" value={formData.personal.github} onChange={(v) => setFormData({...formData, personal: {...formData.personal, github: v}})} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Professional Summary</label>
                            <textarea 
                                value={formData.personal.summary}
                                onChange={(e) => setFormData({...formData, personal: {...formData.personal, summary: e.target.value}})}
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:border-blue-600 outline-none"
                                rows={4}
                                placeholder="Highly motivated software engineering student..."
                            />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                    <GraduationCap size={20} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Education</h2>
                            </div>
                            <button onClick={() => handleAddField('education')} className="p-2 bg-gray-100 rounded-lg text-gray-900 hover:bg-blue-600 hover:text-white transition-all">
                                <Plus size={16} />
                            </button>
                        </div>
                        {formData.education.map((edu, idx) => (
                            <div key={idx} className="relative p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4">
                                <button onClick={() => handleRemoveField('education', idx)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500">
                                    <Trash2 size={16} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField label="Institution" value={edu.institution} onChange={(v) => {
                                        const n = [...formData.education]; n[idx].institution = v; setFormData({...formData, education: n});
                                    }} />
                                    <InputField label="Degree" value={edu.degree} onChange={(v) => {
                                        const n = [...formData.education]; n[idx].degree = v; setFormData({...formData, education: n});
                                    }} />
                                    <InputField label="Year" value={edu.year} onChange={(v) => {
                                        const n = [...formData.education]; n[idx].year = v; setFormData({...formData, education: n});
                                    }} />
                                    <InputField label="CGPA / Percentage" value={edu.cgpa} onChange={(v) => {
                                        const n = [...formData.education]; n[idx].cgpa = v; setFormData({...formData, education: n});
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                    <Briefcase size={20} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Experience</h2>
                            </div>
                            <button onClick={() => handleAddField('experience')} className="p-2 bg-gray-100 rounded-lg text-gray-900 hover:bg-blue-600 hover:text-white transition-all">
                                <Plus size={16} />
                            </button>
                        </div>
                        {formData.experience.map((exp, idx) => (
                            <div key={idx} className="relative p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4">
                                <button onClick={() => handleRemoveField('experience', idx)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500">
                                    <Trash2 size={16} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField label="Company" value={exp.company} onChange={(v) => {
                                        const n = [...formData.experience]; n[idx].company = v; setFormData({...formData, experience: n});
                                    }} />
                                    <InputField label="Role" value={exp.role} onChange={(v) => {
                                        const n = [...formData.experience]; n[idx].role = v; setFormData({...formData, experience: n});
                                    }} />
                                    <InputField label="Duration" value={exp.duration} onChange={(v) => {
                                        const n = [...formData.experience]; n[idx].duration = v; setFormData({...formData, experience: n});
                                    }} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Description</label>
                                    <textarea 
                                        value={exp.description}
                                        onChange={(e) => {
                                            const n = [...formData.experience]; n[idx].description = e.target.value; setFormData({...formData, experience: n});
                                        }}
                                        className="w-full p-4 bg-white border border-gray-100 rounded-xl font-bold text-xs focus:border-blue-600 outline-none"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                    <Rocket size={20} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Projects & Skills</h2>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest italic">Projects</h3>
                                <button onClick={() => handleAddField('projects')} className="text-xs font-black text-blue-600">+ Add</button>
                            </div>
                            {formData.projects.map((proj, idx) => (
                                <div key={idx} className="relative p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4">
                                    <button onClick={() => handleRemoveField('projects', idx)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                    <InputField label="Project Title" value={proj.title} onChange={(v) => {
                                        const n = [...formData.projects]; n[idx].title = v; setFormData({...formData, projects: n});
                                    }} />
                                    <InputField label="Technologies" value={proj.technologies} onChange={(v) => {
                                        const n = [...formData.projects]; n[idx].technologies = v; setFormData({...formData, projects: n});
                                    }} />
                                    <textarea 
                                        value={proj.description}
                                        onChange={(e) => {
                                            const n = [...formData.projects]; n[idx].description = e.target.value; setFormData({...formData, projects: n});
                                        }}
                                        className="w-full p-4 bg-white border border-gray-100 rounded-xl font-bold text-xs focus:border-blue-600 outline-none"
                                        rows={2}
                                        placeholder="Brief description..."
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest italic">Skills</h3>
                                <button onClick={() => handleAddField('skills')} className="text-xs font-black text-blue-600">+ Add</button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {formData.skills.map((skill, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
                                        <input 
                                            value={skill} 
                                            onChange={(e) => {
                                                const n = [...formData.skills]; n[idx] = e.target.value; setFormData({...formData, skills: n});
                                            }}
                                            className="bg-transparent font-bold text-xs outline-none w-20"
                                            placeholder="Skill..."
                                        />
                                        <button onClick={() => handleRemoveField('skills', idx)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 min-h-screen bg-gray-50/30">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                     <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic">Elite <span className="text-blue-600 italic">Resume</span> Builder</h1>
                     <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1 italic">Crafting your professional identity</p>
                </div>
                <div className="flex items-center gap-3">
                     <button 
                        onClick={() => navigate('/student/resumes')}
                        className="px-6 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-gray-50 transition-all"
                     >
                        Abort
                     </button>
                     <button 
                        onClick={handleSaveResume}
                        disabled={saving}
                        className="px-6 py-3 bg-[#000613] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-50"
                     >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                        Save Resume
                     </button>
                     <button 
                        onClick={() => handlePrint()}
                        className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white shadow-sm transition-all"
                     >
                        <Download size={18} />
                     </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Sidebar */}
                <div className="lg:col-span-5 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl space-y-10 order-2 lg:order-1">
                    {/* Stepper */}
                    <div className="flex justify-between relative">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
                        {[1, 2, 3, 4].map(s => (
                            <div 
                                key={s} 
                                onClick={() => setStep(s)}
                                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] transition-all cursor-pointer ${
                                    step === s ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-50' : 
                                    step > s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-400'
                                }`}
                            >
                                {s}
                            </div>
                        ))}
                    </div>

                    <div className="min-h-[400px]">
                        {renderStep()}
                    </div>

                    <div className="flex justify-between pt-6 border-t border-gray-50">
                        <button 
                            disabled={step === 1}
                            onClick={() => setStep(s => s - 1)}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 disabled:opacity-0 transition-all"
                        >
                            <ChevronLeft size={16} /> Back
                        </button>
                        {step < 4 ? (
                            <button 
                                onClick={() => setStep(s => s + 1)}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:tracking-[0.2em] transition-all"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        ) : (
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic">Ready to export!</span>
                        )}
                    </div>
                </div>

                {/* Real-time Preview */}
                <div className="lg:col-span-7 order-1 lg:order-2 sticky top-8">
                    <div className="bg-gray-400/5 p-4 rounded-[2rem] border border-gray-200/50 shadow-inner overflow-hidden">
                        <div className="bg-white shadow-2xl rounded-sm mx-auto overflow-y-auto custom-scrollbar aspect-[1/1.414]" id="resume-preview">
                            <ResumeContent data={formData} ref={resumeRef} />
                        </div>
                    </div>
                    <p className="text-center text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-[0.2em]">Press Download button to export high-quality PDF</p>
                </div>
            </div>
        </div>
    );
};

const InputField = ({ label, value, onChange, placeholder = '', full = false }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, full?: boolean }) => (
    <div className={`space-y-1.5 ${full ? 'col-span-1 md:col-span-2' : ''}`}>
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{label}</label>
        <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            placeholder={placeholder}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:border-blue-600 outline-none transition-all"
        />
    </div>
);

const ResumeContent = React.forwardRef(({ data }: any, ref: any) => {
    return (
        <div ref={ref} className="p-12 text-gray-800 font-serif leading-relaxed h-full bg-white text-[12px]">
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-6 space-y-2 mb-6">
                <h1 className="text-3xl font-bold uppercase tracking-tight font-sans text-black">{data.personal.fullName || 'YOUR NAME'}</h1>
                <div className="flex flex-wrap justify-center gap-4 text-[10px] font-medium text-gray-600">
                    {data.personal.email && <span>{data.personal.email}</span>}
                    {data.personal.phone && <span>{data.personal.phone}</span>}
                    {data.personal.location && <span>{data.personal.location}</span>}
                </div>
                <div className="flex flex-wrap justify-center gap-4 text-[10px] font-bold text-blue-600">
                    {data.personal.linkedin && <a href={data.personal.linkedin} target="_blank">LinkedIn</a>}
                    {data.personal.github && <a href={data.personal.github} target="_blank">GitHub</a>}
                </div>
            </div>

            {/* Summary */}
            {data.personal.summary && (
                <div className="mb-6">
                    <h3 className="font-sans font-bold text-[11px] uppercase tracking-widest border-b border-gray-200 mb-2 pb-1 text-black">Professional Summary</h3>
                    <p className="text-gray-700 italic">{data.personal.summary}</p>
                </div>
            )}

            {/* Education */}
            <div className="mb-6">
                <h3 className="font-sans font-bold text-[11px] uppercase tracking-widest border-b border-gray-200 mb-2 pb-1 text-black">Education</h3>
                <div className="space-y-3">
                    {data.education.map((edu: any, i: number) => (
                        <div key={i} className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-black">{edu.institution || 'Institution Name'}</p>
                                <p className="text-gray-600 italic">{edu.degree || 'Degree'}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-black">{edu.year || 'Date'}</p>
                                <p className="text-gray-600">CGPA: {edu.cgpa || 'X.X'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Experience */}
            <div className="mb-6">
                <h3 className="font-sans font-bold text-[11px] uppercase tracking-widest border-b border-gray-200 mb-2 pb-1 text-black">Experience</h3>
                <div className="space-y-4">
                    {data.experience.map((exp: any, i: number) => (
                        <div key={i}>
                            <div className="flex justify-between items-start mb-1">
                                <p className="font-bold text-black uppercase text-[12px]">{exp.company || 'Company Name'}</p>
                                <p className="text-gray-600 italic">{exp.duration || 'Period'}</p>
                            </div>
                            <p className="font-bold text-blue-600 italic text-[11px] mb-1">{exp.role || 'Role'}</p>
                            <p className="text-gray-700 whitespace-pre-line">{exp.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Projects */}
            <div className="mb-6">
                <h3 className="font-sans font-bold text-[11px] uppercase tracking-widest border-b border-gray-200 mb-2 pb-1 text-black">Projects</h3>
                <div className="space-y-4">
                    {data.projects.map((proj: any, i: number) => (
                        <div key={i}>
                            <p className="font-bold text-black">{proj.title || 'Project Title'} <span className="text-gray-400 font-normal ml-2">| {proj.technologies}</span></p>
                            <p className="text-gray-700 mt-1">{proj.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills */}
            <div>
                <h3 className="font-sans font-bold text-[11px] uppercase tracking-widest border-b border-gray-200 mb-2 pb-1 text-black">Technical Skills</h3>
                <p className="text-gray-700">
                    <span className="font-bold text-black">Skills: </span>
                    {data.skills.filter((s: string) => s).join(', ')}
                </p>
            </div>
        </div>
    );
});

export default ResumeBuilder;
