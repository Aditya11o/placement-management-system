import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
// import Button from '../../components/Button/Button';
import SkeletonList from '../../components/Skeleton/SkeletonList';
import { FileText, CheckCircle, Trash2, ExternalLink, History, Zap, Sparkles, X } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { aiService, AutoTuneResult } from '../../services/aiService';
import { jobService } from '../../services/jobService';
import FileUpload from '../../components/FileUpload/FileUpload';
import PageHeader from '../../components/PageHeader/PageHeader';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import { formatDistanceToNow } from 'date-fns';

interface Resume {
    _id: string;
    version: number;
    is_active: boolean;
    uploaded_at: string;
    url: string;
}

const Resumes: React.FC = () => {
    // ... state and effects same ...
    const { addToast } = useToast();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isTuning, setIsTuning] = useState<boolean>(false);
    const [tuneResult, setTuneResult] = useState<AutoTuneResult | null>(null);
    const [showTuneModal, setShowTuneModal] = useState<boolean>(false);
    const [jobs, setJobs] = useState<any[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>('');
    const [tuningVersion, setTuningVersion] = useState<number | null>(null);

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const res = await studentService.getResumes();
            setResumes(res.data);
        } catch (error) {
            addToast('Failed to load resumes', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('resume', file);

        setIsUploading(true);
        try {
            await studentService.uploadResume(formData);
            addToast('Resume uploaded and analyzed successfully', 'success');
            fetchResumes();
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to upload resume', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSetActive = async (id: string) => {
        try {
            await studentService.activateResume(id);
            addToast('Active resume updated', 'success');
            fetchResumes();
        } catch (error) {
            addToast('Failed to set active resume', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this resume?')) return;
        try {
            await studentService.deleteResume(id);
            addToast('Resume deleted', 'success');
            fetchResumes();
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to delete', 'error');
        }
    };

    const handleTuneClick = async (version: number) => {
        setTuningVersion(version);
        setShowTuneModal(true);
        if (jobs.length === 0) {
            try {
                const res = await jobService.getJobs();
                setJobs(res.data);
            } catch (error) {
                addToast('Failed to load jobs for tuning', 'error');
            }
        }
    };

    const handleAutoTune = async () => {
        if (!selectedJobId || tuningVersion === null) return;
        
        setIsTuning(true);
        try {
            const result = await aiService.autoTuneResume({
                jobId: selectedJobId,
                resumeVersion: tuningVersion
            });
            setTuneResult(result);
            addToast('AI Auto-Tune complete!', 'success');
        } catch (error: any) {
            addToast(error.response?.data?.message || 'AI Tuning failed', 'error');
        } finally {
            setIsTuning(false);
        }
    };

    if (isLoading) return (
        <div className="flex flex-col gap-8 animate-fade-in">
            <div className="mb-2">
                <h1 className="text-3xl font-bold text-indigo-700 mb-1">Resume Management</h1>
                <p className="text-slate-500 text-base m-0">Upload and manage your resume versions.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="h-max lg:col-span-1">
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 h-64 rounded-lg animate-pulse border-2 border-dashed border-slate-200"></div>
                </Card>
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4 text-slate-800">Version History</h2>
                    <SkeletonList count={3} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-8 animate-fade-in pb-12">
            <PageHeader 
                title="Resume Management"
                subtitle="Upload, version, and manage your professional credentials."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Upload Section */}
                <Card className="h-max lg:col-span-1">
                    <FileUpload
                        label="Upload New Resume"
                        accept="application/pdf"
                        description="Professional PDF only. We'll automatically scan it for skills."
                        isUploading={isUploading}
                        onUpload={handleFileUpload}
                    />
                </Card>

                {/* Versions List */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                        <History size={22} className="text-indigo-600" />
                        Version History
                    </h2>

                    {resumes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-dashed border-slate-200 text-center">
                            <FileText size={40} className="text-slate-400 mb-4 opacity-50" />
                            <p className="text-slate-500">You haven't uploaded any resumes yet.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {resumes.map(resume => (
                                <Card key={resume._id} className={`flex justify-between items-center p-5 flex-wrap gap-4 ${resume.is_active ? 'border-2 border-indigo-300 bg-gradient-to-r from-indigo-50/50 to-transparent' : ''}`}>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-xs font-semibold">v{resume.version}</span>
                                            {resume.is_active && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow-sm shadow-green-100"><CheckCircle size={12} /> Active Portfolio</span>}
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-sm font-bold text-slate-800 m-0">Resume_v{resume.version}.pdf</p>
                                            <p className="text-[10px] font-medium text-slate-400 m-0">
                                                Uploaded {resume.uploaded_at ? formatDistanceToNow(new Date(resume.uploaded_at)) : 'N/A'} ago
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button 
                                            className="flex items-center justify-center w-9 h-9 rounded-full border-none bg-indigo-50 text-indigo-600 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-indigo-600 hover:text-white group"
                                            onClick={() => handleTuneClick(resume.version)}
                                            title="AI Auto-Tune"
                                        >
                                            <Zap size={18} className="group-hover:animate-pulse" />
                                        </button>

                                        <a href={resume.url} target="_blank" rel="noreferrer" className="flex items-center justify-center w-9 h-9 rounded-full border-none bg-slate-100 text-slate-500 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:bg-indigo-100 hover:text-indigo-600">
                                            <ExternalLink size={18} />
                                        </a>

                                        {!resume.is_active && (
                                            <button className="flex items-center justify-center w-9 h-9 rounded-full border-none bg-slate-100 text-slate-500 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:bg-green-100 hover:text-green-600" onClick={() => handleSetActive(resume._id)} title="Set as Active">
                                                <CheckCircle size={18} />
                                            </button>
                                        )}

                                        <button className="flex items-center justify-center w-9 h-9 rounded-full border-none bg-slate-100 text-slate-500 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:bg-red-100 hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed" onClick={() => handleDelete(resume._id)} disabled={resume.is_active} title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* AI Auto-Tune Modal */}
            <Modal
                isOpen={showTuneModal}
                onClose={() => {
                    setShowTuneModal(false);
                    setTuneResult(null);
                    setSelectedJobId('');
                }}
                title="✨ AI Resume Auto-Tune"
                maxWidth="2xl"
            >
                {!tuneResult ? (
                    <div className="flex flex-col gap-6 p-2 text-center items-center">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                            <Zap size={32} className="text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Optimize for a specific job</h3>
                            <p className="text-slate-500 max-w-sm mt-2">
                                Select a job to let AI rewrite your summary and bullet points to perfectly match requirements using the STAR method.
                            </p>
                        </div>
                        
                        <div className="w-full text-left">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Select Target Job</label>
                            <select 
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={selectedJobId}
                                onChange={(e) => setSelectedJobId(e.target.value)}
                            >
                                <option value="">-- Choose a Job --</option>
                                {jobs.map(job => (
                                    <option key={job._id} value={job._id}>{job.title} @ {job.company_name}</option>
                                ))}
                            </select>
                        </div>

                        <Button 
                            variant="primary" 
                            isFullWidth 
                            isLoading={isTuning}
                            onClick={handleAutoTune}
                            disabled={!selectedJobId}
                            icon={Sparkles}
                        >
                            Generate Optimized Content
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 animate-fade-in max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                            <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Professional Summary</h4>
                            <p className="text-slate-700 italic text-sm leading-relaxed">"{tuneResult.summary}"</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Optimized STAR Points</h4>
                            {tuneResult.optimized_sections.map((section, idx) => (
                                <div key={idx} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <h5 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                        {section.title}
                                    </h5>
                                    <ul className="flex flex-col gap-3">
                                        {section.bullets.map((bullet, bIdx) => (
                                            <li key={bIdx} className="text-xs text-slate-600 leading-relaxed flex gap-2">
                                                <span className="text-indigo-400 font-bold">•</span>
                                                {bullet}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-slate-900 rounded-xl">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Recommended Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {tuneResult.recommended_skills.map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-slate-800 text-indigo-300 rounded-full text-[10px] font-bold border border-slate-700">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 sticky bottom-0 bg-white pt-4 border-t">
                            <Button variant="secondary" isFullWidth onClick={() => setTuneResult(null)}>Try Another Job</Button>
                            <Button variant="primary" isFullWidth onClick={() => {
                                setShowTuneModal(false);
                                addToast('Copy the points to your resume editor for final polish!', 'success');
                            }}>Done</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Resumes;
