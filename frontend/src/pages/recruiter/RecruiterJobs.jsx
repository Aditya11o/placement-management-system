import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Loader from '../../components/Loader/Loader';
import { Briefcase, Plus, Users, Edit, Trash2, X } from 'lucide-react';
import './RecruiterJobs.css';
import api from '../../services/api';

const RecruiterJobs = () => {
    const { addToast } = useToast();
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
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

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
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
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to post job', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleJobStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
            // Assume endpoint allows patch status or regular update
            await api.put(`/jobs/${id}`, { status: newStatus });
            addToast(`Job marked as ${newStatus}`, 'success');
            fetchJobs();
        } catch (error) {
            addToast('Failed to update job status', 'error');
        }
    };

    const deleteJob = async (id) => {
        if (!window.confirm('Delete this job post entirely?')) return;
        try {
            await api.delete(`/jobs/${id}`);
            addToast('Job deleted', 'success');
            fetchJobs();
        } catch (error) {
            addToast('Failed to delete job', 'error');
        }
    };

    return (
        <div className="jobs-mgmt-container animate-fade-in">
            <div className="board-header">
                <div>
                    <h1 className="page-heading">Manage Jobs</h1>
                    <p className="page-subheading">Create and oversee your company's placement drives.</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>Post New Job</Button>
            </div>

            {isLoading ? (
                <Loader />
            ) : (
                <div className="jobs-list-layout">
                    {jobs.length === 0 ? (
                        <Card className="empty-state-card">
                            <Briefcase size={48} className="text-muted" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                            <h3>No jobs posted yet</h3>
                            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Create your first listing to start receiving applications.</p>
                            <Button onClick={() => setIsModalOpen(true)}>Create Job</Button>
                        </Card>
                    ) : (
                        jobs.map(job => (
                            <Card key={job._id} className="recruiter-job-card">
                                <div className="r-job-header">
                                    <div className="title-block">
                                        <h3>{job.title}</h3>
                                        <span className="location">{job.location}</span>
                                    </div>
                                    <span className={`status-badge ${job.status === 'OPEN' ? 'open' : 'closed'}`}>
                                        {job.status}
                                    </span>
                                </div>

                                <div className="r-job-body">
                                    <div className="r-meta-stat">
                                        <Users size={16} className="icon-blue" />
                                        <div className="stat-text">
                                            <span className="count">{job.applicationCount || 0}</span>
                                            <span className="label">Applicants</span>
                                        </div>
                                    </div>

                                    <div className="r-meta-stat">
                                        <div className="r-pill-group">
                                            <span className="r-pill">₹{job.salary_package} LPA</span>
                                            <span className="r-pill">CGPA: {job.min_cgpa}+</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="r-job-footer">
                                    <span className="deadline-text">
                                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                                    </span>
                                    <div className="r-action-group">
                                        <Button variant="ghost" size="sm" onClick={() => toggleJobStatus(job._id, job.status)}>
                                            {job.status === 'OPEN' ? 'Close Drive' : 'Re-open'}
                                        </Button>
                                        <button className="icon-action-btn delete" onClick={() => deleteJob(job._id)}>
                                            <Trash2 size={16} />
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
                <div className="modal-overlay animate-fade-in">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Post a New Job</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-row">
                                <Input label="Job Title" name="title" value={formData.title} onChange={handleInputChange} required />
                                <Input label="Location" name="location" value={formData.location} onChange={handleInputChange} required />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="input-label">Job Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="custom-textarea"
                                    rows="4"
                                    required
                                ></textarea>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="input-label">Key Requirements (Comma separated)</label>
                                <textarea
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleInputChange}
                                    className="custom-textarea"
                                    placeholder="e.g. React, Node.js, AWS"
                                    rows="2"
                                    required
                                ></textarea>
                            </div>

                            <div className="form-row triple">
                                <Input label="Salary (LPA)" name="salary_package" type="number" step="0.1" value={formData.salary_package} onChange={handleInputChange} required />
                                <Input label="Min CGPA" name="min_cgpa" type="number" step="0.1" value={formData.min_cgpa} onChange={handleInputChange} required />
                                <Input label="Deadline" name="deadline" type="date" value={formData.deadline} onChange={handleInputChange} required />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <Input label="Eligible Branches (e.g. CSE, IT, ECE)" name="eligible_branch" value={formData.eligible_branch} onChange={handleInputChange} required />
                            </div>

                            <div className="modal-footer">
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
