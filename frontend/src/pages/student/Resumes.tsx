import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import SkeletonList from '../../components/Skeleton/SkeletonList';
import { History, Zap, Sparkles, Layout, ShieldCheck, Trophy } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { aiService, AutoTuneResult } from '../../services/aiService';
import FileUpload from '../../components/FileUpload/FileUpload';
import PageHeader from '../../components/PageHeader/PageHeader';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import ResumeCard, { Resume } from './components/ResumeCard';
import { motion, AnimatePresence } from 'framer-motion';

const Resumes: React.FC = () => {
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
            // Sort by version descending so latest is always top
            const sortedResumes = res.data.sort((a: Resume, b: Resume) => b.version - a.version);
            setResumes(sortedResumes);
        } catch (error) {
            addToast('Failed to load resumes', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const activeResume = useMemo(() => resumes.find(r => r.is_active), [resumes]);
    const historyResumes = useMemo(() => resumes.filter(r => !r.is_active), [resumes]);

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
                const res = await studentService.getEligibleJobs();
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
            <PageHeader title="Resume Management" subtitle="Loading your credentials..." />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
                    <SkeletonList count={3} />
                </div>
                <div className="h-96 bg-slate-50 dark:bg-slate-900/50 rounded-2xl animate-pulse" />
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-8 animate-fade-in pb-12">
            <PageHeader 
                title="Resume Vault"
                subtitle="Optimizing your professional presence with AI-driven analysis."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Primary Content (2/3) */}
                <div className="lg:col-span-2 space-y-10">
                    
                    {/* Active Spotlight */}
                    <section>
                         <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            Primary Portfolio Spotlight
                        </h2>
                        {activeResume ? (
                            <ResumeCard 
                                resume={activeResume} 
                                variant="spotlight"
                                onSetActive={handleSetActive}
                                onDelete={handleDelete}
                                onTune={handleTuneClick}
                            />
                        ) : (
                            <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                                <Trophy size={40} className="text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold">No active portfolio selected.</p>
                                <p className="text-xs text-slate-300 mt-1">Select a version below to highlight it as your primary.</p>
                            </div>
                        )}
                    </section>

                    {/* Version History */}
                    <section>
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <History size={14} className="text-indigo-500" />
                            Archived Versions & History
                        </h2>
                        <div className="flex flex-col gap-3">
                            <AnimatePresence initial={false}>
                                {historyResumes.map(resume => (
                                    <motion.div
                                        key={resume._id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <ResumeCard 
                                            resume={resume} 
                                            variant="ghost"
                                            onSetActive={handleSetActive}
                                            onDelete={handleDelete}
                                            onTune={handleTuneClick}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {historyResumes.length === 0 && !activeResume && (
                                <div className="text-center py-10 opacity-50">
                                    <Layout size={32} className="mx-auto mb-3 text-slate-300" />
                                    <p className="text-slate-400 text-sm italic">Initialize your vault by uploading a resume.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Secondary Sidebar (1/3) */}
                <div className="space-y-6 lg:sticky lg:top-24">
                     {/* Upload Card */}
                     <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm backdrop-blur-sm">
                        <FileUpload
                            label="Upload New Version"
                            accept="application/pdf"
                            description="AI will automatically parse and score your file."
                            isUploading={isUploading}
                            onUpload={handleFileUpload}
                        />
                    </div>

                    {/* Quick Stats / Tips */}
                    <div className="p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                            <Sparkles size={80} />
                        </div>
                        <h4 className="font-black text-xs uppercase tracking-widest mb-4 opacity-80">Design Tip</h4>
                        <p className="text-sm font-bold leading-relaxed mb-6">
                            "Modern SaaS resumes favor clean typography and quantified impact. Use the AI Auto-Tune to generate STAR-method points."
                        </p>
                        <Button variant="ghost" className="!bg-white/10 !text-white !border-white/20 text-[10px] w-full font-black uppercase tracking-widest">
                            View Guide
                        </Button>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                         <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-4">Vault Stats</h4>
                         <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs font-bold font-mono">
                                <span className="text-slate-500">Total Versions</span>
                                <span className="text-slate-900 dark:text-white px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">{resumes.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold font-mono">
                                <span className="text-slate-500">Top Match Score</span>
                                <span className="text-emerald-500">92%</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold font-mono">
                                <span className="text-slate-500">Last Synced</span>
                                <span className="text-slate-400">Just now</span>
                            </div>
                         </div>
                    </div>
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
                title="✨ Resume Intelligence Center"
                size="lg"
            >
                {!tuneResult ? (
                    <div className="flex flex-col gap-6 p-2 text-center items-center">
                        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-2">
                            <Zap size={36} className="text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Optimize for Career Impact</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 max-w-sm font-medium">
                                Select a target opportunity to let our AI refine your summary and highlight technical competencies.
                            </p>
                        </div>
                        
                        <div className="w-full text-left">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Choose Opportunity</label>
                            <select 
                                className="w-full h-12 px-4 rounded-2xl border-none bg-slate-100 dark:bg-slate-900 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none cursor-pointer"
                                value={selectedJobId}
                                onChange={(e) => setSelectedJobId(e.target.value)}
                            >
                                <option value="">Select Opportunity...</option>
                                {jobs.map(job => (
                                    <option key={job._id} value={job._id}>{job.title} — {job.company_name}</option>
                                ))}
                            </select>
                        </div>

                        <Button 
                            variant="primary" 
                            isFullWidth 
                            isLoading={isTuning}
                            onClick={handleAutoTune}
                            disabled={!selectedJobId}
                            className="h-14 font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20"
                        >
                            <Sparkles size={18} className="mr-2" />
                            Generate Optimization
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 animate-fade-in max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar p-1">
                        <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl text-white shadow-xl">
                            <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-80">Professional Summary</h4>
                            <p className="text-sm font-bold leading-relaxed italic">"{tuneResult.summary}"</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Optimized STAR Markers</h4>
                            {tuneResult.optimized_sections.map((section, idx) => (
                                <div key={idx} className="p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm group">
                                    <h5 className="font-black text-slate-900 dark:text-white text-xs mb-4 flex items-center gap-3">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                                        {section.title}
                                    </h5>
                                    <ul className="flex flex-col gap-4">
                                        {section.bullets.map((bullet, bIdx) => (
                                            <li key={bIdx} className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed flex gap-3 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                                                <span className="text-indigo-500 font-bold shrink-0 mt-0.5">•</span>
                                                {bullet}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Competency Map</h4>
                            <div className="flex flex-wrap gap-2">
                                {tuneResult.recommended_skills.map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-slate-800 text-indigo-400 rounded-xl text-[10px] font-black border border-slate-700 hover:border-indigo-500/50 transition-colors">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 sticky bottom-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md pt-6 pb-2 border-t border-slate-100 dark:border-slate-800">
                            <Button variant="ghost" isFullWidth className="h-12 font-black uppercase tracking-widest text-slate-400" onClick={() => setTuneResult(null)}>Retrack</Button>
                            <Button variant="primary" isFullWidth className="h-12 font-black uppercase tracking-widest" onClick={() => {
                                setShowTuneModal(false);
                                addToast('Copy the points to your resume editor for final polish!', 'success');
                            }}>Finalize</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Resumes;
