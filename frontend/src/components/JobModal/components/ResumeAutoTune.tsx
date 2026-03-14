import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Sparkles, FileText, Download, CheckCircle, RefreshCcw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../services/api';
import Button from '../../Button/Button';
import Loader from '../../Loader/Loader';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ResumeAutoTuneProps {
    jobTitle: string;
    jobDescription: string;
    skills: string[];
}

const ResumeAutoTune: React.FC<ResumeAutoTuneProps> = ({ jobTitle, jobDescription, skills }) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [isDownloading, setIsDownloading] = useState(false);

    // Fetch student profile for base resume data
    const { data: profile } = useQuery({
        queryKey: ['student-profile'],
        queryFn: async () => {
            const res = await api.get('/students/profile');
            return res.data.data;
        }
    });

    const tuneMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post('/ai/auto-tune-resume', {
                title: jobTitle,
                description: jobDescription,
                skills
            });
            return res.data.data;
        }
    });

    const handleDownload = async () => {
        const element = document.getElementById('tuned-resume-preview');
        if (!element) return;

        setIsDownloading(true);
        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${user?.name}_Tailored_Resume_${jobTitle.replace(/\s+/g, '_')}.pdf`);
            addToast('Resume downloaded successfully!', 'success');
        } catch (err) {
            addToast('Failed to generate PDF', 'error');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            {/* Header Area */}
            <div className="bg-white dark:bg-slate-800 p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 rounded-lg">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">AI Resume Auto-Tune</h2>
                        <p className="text-xs font-bold text-slate-500 uppercase">Optimizing for: {jobTitle}</p>
                    </div>
                </div>
                {!tuneMutation.data && (
                    <Button 
                        variant="primary" 
                        size="md" 
                        icon={Sparkles}
                        isLoading={tuneMutation.isPending}
                        onClick={() => tuneMutation.mutate()}
                        className="shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        Start Auto-Tune
                    </Button>
                )}
                {tuneMutation.data && (
                    <div className="flex gap-2">
                        <Button variant="ghost" icon={RefreshCcw} onClick={() => tuneMutation.mutate()} />
                        <Button 
                            variant="primary" 
                            icon={Download} 
                            onClick={handleDownload}
                            isLoading={isDownloading}
                        >
                            Download PDF
                        </Button>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {!tuneMutation.data && !tuneMutation.isPending && (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                        <FileText size={64} className="text-slate-200 mb-6" />
                        <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase">Tailor your impact</h3>
                        <p className="text-sm font-medium text-slate-500 mt-2">
                            AI will rewrite your project bullet points and professional summary to highlight the specific metrics and skills this recruiter is looking for.
                        </p>
                        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20 flex items-start gap-3 text-left">
                            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-tight leading-normal">
                                Ensure your base profile is updated with all projects before using Auto-Tune for the best results.
                            </p>
                        </div>
                    </div>
                )}

                {tuneMutation.isPending && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <Loader />
                        <p className="text-sm font-black text-indigo-600 uppercase tracking-widest mt-4 animate-pulse">AI is rewriting your story...</p>
                    </div>
                )}

                {tuneMutation.data && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Interactive Preview Container */}
                        <div 
                            id="tuned-resume-preview" 
                            className="bg-white dark:bg-slate-900 p-10 shadow-2xl rounded-sm border border-slate-200 dark:border-slate-800 mx-auto max-w-[800px] min-h-[1000px] font-sans text-slate-800"
                        >
                            <header className="border-b-4 border-indigo-600 pb-6 mb-8">
                                <h1 className="text-4xl font-black uppercase tracking-tighter m-0">{user?.name}</h1>
                                <p className="text-indigo-600 font-bold uppercase tracking-widest mt-1 m-0">{profile?.branch} Professional</p>
                            </header>

                            <section className="mb-8">
                                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Sparkles size={14} /> Professional Summary
                                </h3>
                                <p className="text-sm leading-relaxed font-medium italic text-slate-600">"{tuneMutation.data.summary}"</p>
                            </section>

                            <div className="grid grid-cols-3 gap-10">
                                <div className="col-span-1 space-y-8">
                                    <section>
                                        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3">Skills</h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {tuneMutation.data.recommended_skills.map((s: string) => (
                                                <span key={s} className="px-2 py-0.5 border border-slate-200 text-[10px] font-bold uppercase tracking-wider rounded">{s}</span>
                                            ))}
                                        </div>
                                    </section>
                                    <section>
                                        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3">Education</h3>
                                        <p className="text-[11px] font-bold m-0 tracking-tight underline italic">Bachelor of Technology</p>
                                        <p className="text-[10px] font-medium text-slate-500 m-0">GPA: {profile?.cgpa} / 10.0</p>
                                    </section>
                                </div>

                                <div className="col-span-2 space-y-8">
                                    {tuneMutation.data.optimized_sections.map((section: any, idx: number) => (
                                        <section key={idx}>
                                            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3">{section.title}</h3>
                                            <ul className="space-y-3 m-0 p-0 list-none">
                                                {section.bullets.map((bullet: string, bIdx: number) => (
                                                    <li key={bIdx} className="text-xs flex items-start gap-2 leading-relaxed">
                                                        <CheckCircle size={10} className="text-indigo-400 mt-1 shrink-0" />
                                                        <span>{bullet}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    ))}
                                </div>
                            </div>

                            <footer className="mt-20 pt-6 border-t border-slate-100 flex justify-between items-center text-[8px] font-black uppercase text-slate-300 tracking-[0.2em]">
                                <span>AI Optimized for {jobTitle}</span>
                                <span>TNU PMS Intelligence</span>
                            </footer>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ResumeAutoTune;
