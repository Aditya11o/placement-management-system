import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Trash2, 
  Download, 
  BarChart2, Layout,
  Upload, Sparkles, Loader2, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { toast } from 'react-hot-toast';

interface SettingsResumesTabProps {
  onTitleUpdate?: (title: string) => void;
}

const SettingsResumesTab: React.FC<SettingsResumesTabProps> = () => {
    const navigate = useNavigate();
    const [resumes, setResumes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchResumes = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/students/resume'); // Matches Settings.tsx endpoint
            setResumes(data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load resumes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResumes();
    }, []);

    const handleSetPrimary = async (id: string) => {
        try {
            setActionLoading(id);
            await api.patch(`/students/resume/${id}/primary`);
            toast.success('Primary resume updated!');
            fetchResumes();
        } catch (err) {
            toast.error('Failed to update primary resume');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this resume?')) return;
        try {
            setActionLoading(id);
            await api.delete(`/students/resume/${id}`);
            toast.success('Resume deleted successfully');
            fetchResumes();
        } catch (err) {
            toast.error('Failed to delete resume');
        } finally {
            setActionLoading(null);
        }
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('resume', file);

      const uploadToast = toast.loading('Uploading resume...');
      try {
        await api.post('/students/upload-resume', formData);
        toast.success('Resume uploaded successfully', { id: uploadToast });
        fetchResumes();
      } catch (err) {
        toast.error('Failed to upload resume', { id: uploadToast });
      }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[40vh] space-y-4">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Syncing career assets...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Intro */}
            <div className="bg-gray-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-3xl rounded-full -mr-20 -mt-20" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                     <div className="space-y-4 max-w-xl text-center md:text-left">
                        <h2 className="text-3xl font-black tracking-tight leading-tight">Resume <span className="text-blue-400">Intelligence.</span></h2>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">
                            Manage your professional profile. Build AI-optimized resumes or upload your existing ones to apply for top jobs.
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                            <button 
                                onClick={() => navigate('/student/resume-builder')}
                                className="px-6 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                            >
                                <Sparkles size={14} /> AI Builder
                            </button>
                            <label className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer">
                                <Upload size={14} /> Upload PDF
                                <input type="file" className="hidden" accept=".pdf" onChange={handleResumeUpload} />
                            </label>
                        </div>
                     </div>
                     <div className="hidden lg:flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
                        <BarChart2 size={24} className="text-blue-400 mb-2" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Analytics Active</p>
                     </div>
                </div>
            </div>

            {/* Resume Catalog */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resumes.map((resume) => (
                    <div 
                        key={resume._id} 
                        className={`group relative bg-white border ${resume.isPrimary ? 'border-blue-200 ring-2 ring-blue-50' : 'border-gray-100'} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300`}
                    >
                        {resume.isPrimary && (
                            <div className="absolute top-4 right-4 px-2 py-0.5 bg-blue-600 text-white rounded-md text-[8px] font-black uppercase tracking-widest">
                                Primary
                            </div>
                        )}

                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${resume.isBuilt ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                {resume.isBuilt ? <Layout size={20} /> : <FileText size={20} />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base font-black text-gray-900 truncate">{resume.resume_name}</h3>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                    {new Date(resume.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {!resume.isPrimary && (
                                <button 
                                    onClick={() => handleSetPrimary(resume._id)}
                                    disabled={!!actionLoading}
                                    className="flex-1 px-3 py-2.5 bg-gray-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center"
                                >
                                    {actionLoading === resume._id ? <Loader2 size={12} className="animate-spin" /> : 'Set Primary'}
                                </button>
                            )}
                            <a 
                                href={resume.resume_url.startsWith('https') ? resume.resume_url : `${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${resume.resume_url}`}
                                target="_blank" rel="noreferrer"
                                className="flex-1 px-3 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Download size={12} /> View
                            </a>
                            <button 
                                onClick={() => handleDelete(resume._id)}
                                disabled={!!actionLoading}
                                className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Empty State / Add New Card */}
                {resumes.length < 5 && (
                    <button 
                        onClick={() => navigate('/student/resume-builder')}
                        className="group border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 hover:border-blue-400 hover:bg-blue-50/20 transition-all"
                    >
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                            <Plus size={24} />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 group-hover:text-blue-600 uppercase tracking-widest transition-colors">Build New</p>
                    </button>
                )}
            </div>

            {resumes.length === 0 && (
                <div className="py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <AlertCircle size={24} />
                    </div>
                    <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase">No Resumes Found</h3>
                    <p className="text-gray-400 text-xs font-medium max-w-[200px] mx-auto mt-1">Ready to apply? Create your first resume using the tools above.</p>
                </div>
            )}
        </div>
    );
};

export default SettingsResumesTab;
