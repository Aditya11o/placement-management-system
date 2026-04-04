import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Trash2, 
  CheckCircle, Globe, Download, 
  BarChart2, MoreVertical, Layout,
  Upload, Sparkles, Loader2, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

const ResumeManager: React.FC = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();
    const [resumes, setResumes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchResumes = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/students/resumes');
            setResumes(data);
        } catch (err) {
            console.error(err);
            showError('Failed to load resumes');
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
            showSuccess('Primary resume updated!');
            fetchResumes();
        } catch (err) {
            showError('Failed to update primary resume');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this resume?')) return;
        try {
            setActionLoading(id);
            await api.delete(`/students/resume/${id}`);
            showSuccess('Resume deleted successfully');
            fetchResumes();
        } catch (err) {
            showError('Failed to delete resume');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Syncing your career assets...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-10 animate-in fade-in duration-700">
            {/* Legend Header */}
            <div className="bg-[#000613] text-white rounded-[40px] p-12 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full -mr-40 -mt-40" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                     <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-[10px] font-black uppercase tracking-widest">
                            <FileText size={14} /> Career Asset Management
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter leading-[1.1]">Resume <br/><span className="text-blue-400">Intelligence.</span></h1>
                        <p className="text-gray-400 text-lg font-medium max-w-xl leading-relaxed">
                            Manage multiple versions of your resume, track application performance, and create industry-standard CVs with our built-in builder.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <button 
                                onClick={() => navigate('/student/resume-builder')}
                                className="px-8 py-4 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-xl shadow-white/5 flex items-center gap-2"
                            >
                                <Sparkles size={16} /> Build AI Resume
                            </button>
                            <button 
                                className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                            >
                                <Upload size={16} /> Upload PDF
                            </button>
                        </div>
                     </div>
                     <div className="hidden lg:block relative group">
                        <div className="w-64 h-80 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 rotate-6 transition-transform group-hover:rotate-0 duration-500 shadow-2xl flex flex-col items-center justify-center space-y-4">
                            <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400">
                                <BarChart2 size={32} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-center text-blue-400">Analytics Enabled</p>
                            <p className="text-xs text-center text-gray-400">Track which resume gets you the most interviews.</p>
                        </div>
                     </div>
                </div>
            </div>

            {/* Resume Catalog */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                    <div 
                        key={resume._id} 
                        className={`group relative bg-white border ${resume.isPrimary ? 'border-blue-200 ring-4 ring-blue-50' : 'border-gray-100'} rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500`}
                    >
                        {resume.isPrimary && (
                            <div className="absolute top-6 right-6 px-3 py-1 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">
                                Primary Version
                            </div>
                        )}

                        <div className="flex items-center gap-4 mb-8">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${resume.isBuilt ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                {resume.isBuilt ? <Layout size={28} /> : <FileText size={28} />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-lg font-black text-gray-900 truncate leading-tight">{resume.resume_name}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                    {new Date(resume.createdAt).toLocaleDateString()} • {resume.isBuilt ? 'AI Builder' : 'External PDF'}
                                </p>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100/50">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Applications</p>
                                <p className="text-xl font-black text-gray-900">{resume.stats?.applications || 0}</p>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100/50">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Shortlisted</p>
                                <p className="text-xl font-black text-blue-600">{resume.stats?.shortlists || 0}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {!resume.isPrimary && (
                                <button 
                                    onClick={() => handleSetPrimary(resume._id)}
                                    disabled={!!actionLoading}
                                    className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center"
                                >
                                    {actionLoading === resume._id ? <Loader2 size={14} className="animate-spin" /> : 'Set Primary'}
                                </button>
                            )}
                            <a 
                                href={resume.resume_url.startsWith('/') ? `http://localhost:5000${resume.resume_url}` : '#'}
                                target="_blank" rel="noreferrer"
                                className="flex-1 px-4 py-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Download size={14} /> View
                            </a>
                            <button 
                                onClick={() => handleDelete(resume._id)}
                                disabled={!!actionLoading}
                                className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Empty State / Add New Card */}
                {resumes.length < 5 && (
                    <div 
                        onClick={() => navigate('/student/resume-builder')}
                        className="group border-4 border-dashed border-gray-100 rounded-[32px] p-8 flex flex-col items-center justify-center space-y-4 hover:border-blue-400 hover:bg-blue-50/20 transition-all cursor-pointer"
                    >
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                            <Plus size={32} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-black text-gray-400 group-hover:text-blue-600 uppercase tracking-widest mb-1 transition-colors">Build New</p>
                            <p className="text-xs text-gray-400 max-w-[150px]">Create an industry-standard resume in minutes.</p>
                        </div>
                    </div>
                )}
            </div>

            {resumes.length === 0 && (
                <div className="py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <AlertCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight italic uppercase">No Resumes Found</h3>
                    <p className="text-gray-400 font-medium max-w-sm mx-auto mt-2">Get started by building your first AI-optimized resume or uploading your current one.</p>
                </div>
            )}
        </div>
    );
};

export default ResumeManager;
