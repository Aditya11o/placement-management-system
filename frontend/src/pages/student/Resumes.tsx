import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
// import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { FileUp, FileText, CheckCircle, Trash2, ExternalLink } from 'lucide-react';
import api from '../../services/api';

interface Resume {
    _id: string;
    version: number;
    isActive: boolean;
    uploadedAt: string;
    fileUrl: string;
}

const Resumes: React.FC = () => {
    const { addToast } = useToast();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const res = await api.get('/upload/resumes');
            setResumes(res.data.data);
        } catch (error) {
            addToast('Failed to load resumes', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            addToast('Only PDF files are allowed', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            addToast('File must be smaller than 5MB', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);

        setIsUploading(true);
        try {
            await api.post('/upload/resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            addToast('Resume uploaded and analyzed successfully', 'success');
            fetchResumes();
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to upload resume', 'error');
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleSetActive = async (id: string) => {
        try {
            await api.put(`/upload/resumes/${id}/activate`);
            addToast('Active resume updated', 'success');
            fetchResumes();
        } catch (error) {
            addToast('Failed to set active resume', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this resume?')) return;
        try {
            await api.delete(`/upload/resumes/${id}`);
            addToast('Resume deleted', 'success');
            fetchResumes();
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to delete', 'error');
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            <div className="mb-2">
                <h1 className="text-3xl font-bold text-indigo-700 mb-1">Resume Management</h1>
                <p className="text-slate-500 text-base m-0">Upload and manage your resume versions.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Upload Section */}
                <Card className="h-max lg:col-span-1">
                    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 transition-all duration-200 hover:border-indigo-500 hover:bg-indigo-50">
                        <FileUp size={48} className="text-indigo-500 mb-4" />
                        <h3 className="mb-2 text-lg font-bold text-slate-800">Upload New Resume</h3>
                        <p className="text-sm text-slate-500 mb-2">PDFs only (Max 5MB)</p>
                        <p className="text-xs text-slate-500 mb-6">
                            Our AI will automatically scan and extract your technical skills to improve your match score.
                        </p>

                        <input
                            type="file"
                            id="resume-upload"
                            accept=".pdf"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                        <label htmlFor="resume-upload" className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-base font-medium rounded-md border border-transparent cursor-pointer transition-all duration-200 outline-none bg-indigo-600 text-white shadow-md shadow-indigo-500/40 hover:bg-indigo-700 hover:-translate-y-px ${isUploading ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}>
                            {isUploading ? (
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : 'Select File'}
                        </label>
                    </div>
                </Card>

                {/* Versions List */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4 text-slate-800">Version History</h2>

                    {resumes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-dashed border-slate-200 text-center">
                            <FileText size={40} className="text-slate-400 mb-4 opacity-50" />
                            <p className="text-slate-500">You haven't uploaded any resumes yet.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {resumes.map(resume => (
                                <Card key={resume._id} className={`flex justify-between items-center p-5 flex-wrap gap-4 ${resume.isActive ? 'border-2 border-indigo-300 bg-gradient-to-r from-indigo-50/50 to-transparent' : ''}`}>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-xs font-semibold">v{resume.version}</span>
                                            {resume.isActive && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700"><CheckCircle size={12} /> Active</span>}
                                        </div>
                                        <p className="text-sm text-slate-500 m-0">
                                            Uploaded on {new Date(resume.uploadedAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <a href={resume.fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center w-9 h-9 rounded-full border-none bg-slate-100 text-slate-500 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:bg-indigo-100 hover:text-indigo-600">
                                            <ExternalLink size={18} />
                                        </a>

                                        {!resume.isActive && (
                                            <button className="flex items-center justify-center w-9 h-9 rounded-full border-none bg-slate-100 text-slate-500 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:bg-green-100 hover:text-green-600" onClick={() => handleSetActive(resume._id)} title="Set as Active">
                                                <CheckCircle size={18} />
                                            </button>
                                        )}

                                        <button className="flex items-center justify-center w-9 h-9 rounded-full border-none bg-slate-100 text-slate-500 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:bg-red-100 hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed" onClick={() => handleDelete(resume._id)} disabled={resume.isActive} title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Resumes;
