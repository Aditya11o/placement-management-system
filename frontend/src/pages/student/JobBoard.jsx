import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { Search, MapPin, Building, Calendar, DollarSign, Send } from 'lucide-react';
import './JobBoard.css';
import api from '../../services/api';

const JobBoard = () => {
    const { addToast } = useToast();
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [applyingTo, setApplyingTo] = useState(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await api.get('/jobs');
            setJobs(res.data.data);
        } catch (error) {
            addToast('Failed to load jobs', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = async (jobId) => {
        setApplyingTo(jobId);
        try {
            await api.post('/applications', { job: jobId });
            addToast('Successfully applied to job!', 'success');
            // Update local state to show 'Applied'
            setJobs(jobs.map(j => j._id === jobId ? { ...j, hasApplied: true } : j));
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to apply. Check if you have an active resume.', 'error');
        } finally {
            setApplyingTo(null);
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="job-board-container animate-fade-in">
            <div className="board-header">
                <div>
                    <h1 className="page-heading">Job Discovery Board</h1>
                    <p className="page-subheading">Find and apply to the latest placement opportunities.</p>
                </div>
                <div className="search-bar-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search jobs by title or company..."
                        className="job-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <Loader />
            ) : (
                <div className="jobs-grid">
                    {filteredJobs.length === 0 ? (
                        <div className="empty-state-card grid-full-col">
                            <p>No jobs found matching your criteria.</p>
                        </div>
                    ) : (
                        filteredJobs.map(job => (
                            <Card key={job._id} className="job-card hoverable">
                                <div className="job-card-header">
                                    <div className="company-logo-placeholder">
                                        {job.company?.company_name?.charAt(0) || 'C'}
                                    </div>
                                    <div className="job-title-group">
                                        <h3>{job.title}</h3>
                                        <span className="company-name">
                                            <Building size={14} className="inline-icon" /> {job.company?.company_name || 'Unknown Company'}
                                        </span>
                                    </div>
                                    {job.status === 'OPEN' ? (
                                        <span className="job-status-badge open">Open</span>
                                    ) : (
                                        <span className="job-status-badge closed">Closed</span>
                                    )}
                                </div>

                                <div className="job-meta-grid">
                                    <div className="meta-item">
                                        <MapPin size={16} />
                                        <span>{job.location}</span>
                                    </div>
                                    <div className="meta-item">
                                        <DollarSign size={16} />
                                        <span>₹{job.salary_package} LPA</span>
                                    </div>
                                    <div className="meta-item">
                                        <Calendar size={16} />
                                        <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="job-requirements">
                                    <div className="req-pill">Min CGPA: {job.min_cgpa}</div>
                                    <div className="req-pill">Allowed: {job.eligible_branch.substring(0, 15)}{job.eligible_branch.length > 15 && '...'}</div>
                                </div>

                                <div className="job-card-footer">
                                    <Button variant="ghost" size="sm">View Details</Button>
                                    <Button
                                        variant={job.hasApplied ? 'secondary' : 'primary'}
                                        size="sm"
                                        onClick={() => handleApply(job._id)}
                                        disabled={job.status !== 'OPEN' || applyingTo === job._id || job.hasApplied}
                                        isLoading={applyingTo === job._id}
                                        icon={job.hasApplied ? CheckCircle : Send}
                                    >
                                        {job.hasApplied ? 'Applied' : 'Apply Now'}
                                    </Button>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default JobBoard;
