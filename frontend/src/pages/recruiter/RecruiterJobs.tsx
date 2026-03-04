import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Loader from '../../components/Loader/Loader';
import { Briefcase, Plus, Users, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import { Job } from '../../types';

interface JobFormData {
    title: string;
    description: string;
    requirements: string;
    location: string;
    salary_package: string;
    eligible_branch: string;
    min_cgpa: string;
    deadline: string;
}

const RecruiterJobs: React.FC = () => {
    const { addToast } = useToast();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState<JobFormData>({
        title: '',
        description: '',
        requirements: '',
        location: '',
        salary_package: '',
        eligible_branch: '',
        min_cgpa: '',
        deadline: ''
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await api.get('/jobs/recruiter');
            setJobs(res.data.data);
        } catch (error) {
            addToast('Failed to load your job postings', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Split requirements by comma and trim
            const formattedData = {
                ...formData,
                requirements: formData.requirements.split(',').map(r => r.trim()),
                min_cgpa: parseFloat(formData.min_cgpa),
                salary_package: parseFloat(formData.salary_package)
            };

            await api.post('/jobs', formattedData);
            addToast('Job posted successfully!', 'success');
            setIsModalOpen(false);

            // Reset form
            setFormData({
                title: '', description: '', requirements: '', location: '',
                salary_package: '', eligible_branch: '', min_cgpa: '', deadline: ''
            });

            fetchJobs();
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to post job', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleJobStatus = async (id: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
            // Assume endpoint allows patch status or regular update
            await api.put(`/jobs/${id}`, { status: newStatus });
            addToast(`Job marked as ${newStatus}`, 'success');
            fetchJobs();
        } catch (error: any) {
            addToast('Failed to update job status', 'error');
        }
    };

    const deleteJob = async (id: string) => {
        if (!window.confirm('Delete this job post entirely?')) return;
        try {
            await api.delete(`/jobs/${id}`);
            addToast('Job deleted', 'success');
            fetchJobs();
        } catch (error: any) {
            addToast('Failed to delete job', 'error');
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            <div className="flex justify-between items-start flex-wrap gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-700 mb-1">Manage Jobs</h1>
                    <p className="text-slate-500 text-base m-0">Create and oversee your company's placement drives.</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>Post New Job</Button>
            </div>

            {isLoading ? (
                <Loader />
            ) : (
                <div className="flex flex-col gap-6">
                    {jobs.length === 0 ? (
                        <Card className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
                            <Briefcase size={48} className="text-slate-400 mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold mb-2 text-slate-700">No jobs posted yet</h3>
                            <p className="mb-6">Create your first listing to start receiving applications.</p>
                            <Button onClick={() => setIsModalOpen(true)}>Create Job</Button>
                        </Card>
                    ) : (
                        jobs.map(job => (
                            <Card key={job._id} className="flex flex-col p-6 border border-slate-200 transition-all hover:border-indigo-300">
                                <div className="flex justify-between items-start mb-5 pb-5 border-b border-slate-200">
                                    <div className="flex flex-col">
                                        <h3 className="text-xl font-bold text-indigo-700 mb-1 m-0">{job.title}</h3>
                                        <span className="text-sm text-slate-500">{job.location}</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${job.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {job.status}
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 mb-6">
                                    <div className="flex items-center gap-3">
                                        <Users size={20} className="text-blue-500" />
                                        <div className="flex flex-col">
                                            <span className="text-xl font-bold text-slate-800 leading-none">{job.applicationCount || 0}</span>
                                            <span className="text-xs text-slate-500 uppercase tracking-wider mt-1">Applicants</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <div className="flex gap-2 min-w-0 flex-wrap">
                                            <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-sm font-medium text-slate-600">₹{job.salary_package} LPA</span>
                                            <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-sm font-medium text-slate-600">CGPA: {job.min_cgpa}+</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-auto pt-4 relative">
                                    <span className="text-sm text-red-500 font-medium">
                                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => toggleJobStatus(job._id, job.status)}>
                                            {job.status === 'OPEN' ? 'Close Drive' : 'Re-open'}
                                        </Button>
                                        <button className="bg-transparent border-none w-9 h-9 rounded flex items-center justify-center cursor-pointer transition-colors text-slate-400 hover:bg-red-50 hover:text-red-500" onClick={() => deleteJob(job._id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Modern Glassmorphic Modal overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-indigo-700 m-0">Post a New Job</h2>
                            <button className="bg-transparent border-none text-slate-400 cursor-pointer transition-colors hover:text-slate-700 p-1" onClick={() => setIsModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto w-full">
                            <div className="flex flex-col sm:flex-row gap-6 mb-6">
                                <div className="flex-1"><Input label="Job Title" name="title" value={formData.title} onChange={handleInputChange} required /></div>
                                <div className="flex-1"><Input label="Location" name="location" value={formData.location} onChange={handleInputChange} required /></div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-800 mb-2">Job Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-md font-sans text-sm bg-slate-50 transition-all resize-y focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 focus:bg-white"
                                    rows={4}
                                    required
                                ></textarea>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-800 mb-2">Key Requirements (Comma separated)</label>
                                <textarea
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-md font-sans text-sm bg-slate-50 transition-all resize-y focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 focus:bg-white"
                                    placeholder="e.g. React, Node.js, AWS"
                                    rows={2}
                                    required
                                ></textarea>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 mb-6">
                                <div className="flex-1"><Input label="Salary (LPA)" name="salary_package" type="number" step="0.1" value={formData.salary_package} onChange={handleInputChange} required /></div>
                                <div className="flex-1"><Input label="Min CGPA" name="min_cgpa" type="number" step="0.1" value={formData.min_cgpa} onChange={handleInputChange} required /></div>
                                <div className="flex-1"><Input label="Deadline" name="deadline" type="date" value={formData.deadline} onChange={handleInputChange} required /></div>
                            </div>

                            <div className="mb-6">
                                <Input label="Eligible Branches (e.g. CSE, IT, ECE)" name="eligible_branch" value={formData.eligible_branch} onChange={handleInputChange} required />
                            </div>

                            <div className="p-6 -mx-6 -mb-6 border-t border-slate-200 mt-2 flex justify-end gap-4 bg-slate-50">
                                <Button variant="ghost" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
                                <Button variant="primary" type="submit" isLoading={isSubmitting}>Publish Job</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterJobs;
