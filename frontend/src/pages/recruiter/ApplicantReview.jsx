import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { Search, Filter, ShieldCheck, XCircle, Clock, ExternalLink, Download } from 'lucide-react';
import './ApplicantReview.css';
import api from '../../services/api';

const ApplicantReview = () => {
    const { addToast } = useToast();
    const [applications, setApplications] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [selectedJob, setSelectedJob] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch both jobs (for filter dropdown) and applications
            const [jobsRes, appsRes] = await Promise.all([
                api.get('/jobs/recruiter'),
                api.get('/applications/recruiter')
            ]);
            setJobs(jobsRes.data.data);
            setApplications(appsRes.data.data);
        } catch (error) {
            addToast('Failed to load applicant data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (appId, newStatus) => {
        try {
            await api.put(`/applications/${appId}/status`, { status: newStatus });
            addToast(`Application marked as ${newStatus}`, 'success');

            // Update local state
            setApplications(applications.map(app =>
                app._id === appId ? { ...app, status: newStatus } : app
            ));
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to update status', 'error');
        }
    };

    // derived filtered list
    const filteredApps = applications.filter(app => {
        const matchJob = selectedJob === 'ALL' || app.job?._id === selectedJob;
        const matchStatus = selectedStatus === 'ALL' || app.status === selectedStatus;
        const searchLower = searchTerm.toLowerCase();
        const matchSearch =
            app.student?.name?.toLowerCase().includes(searchLower) ||
            app.job?.title?.toLowerCase().includes(searchLower) ||
            app.student?.email?.toLowerCase().includes(searchLower);

        return matchJob && matchStatus && matchSearch;
    });

    // Sort by AI Match score descending
    filteredApps.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    return (
        <div className="review-board-container animate-fade-in">
            <div className="board-header">
                <div>
                    <h1 className="page-heading">Applicant Review Board</h1>
                    <p className="page-subheading">Evaluate candidates and manage application pipelines.</p>
                </div>
            </div>

            {/* Filter Bar */}
            <Card className="filter-bar">
                <div className="filter-group block-search">
                    <Search size={18} className="text-muted" />
                    <input
                        type="text"
                        placeholder="Search candidate name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="invisible-input"
                    />
                </div>

                <div className="filter-dropdowns">
                    <div className="filter-group">
                        <Filter size={18} className="text-muted" />
                        <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} className="invisible-select">
                            <option value="ALL">All Jobs</option>
                            {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
                        </select>
                    </div>

                    <div className="filter-group">
                        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="invisible-select">
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING">Pending Review</option>
                            <option value="SHORTLISTED">Shortlisted</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="HIRED">Hired</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Applications List */}
            <div className="applicants-list">
                {isLoading ? (
                    <Loader inline />
                ) : filteredApps.length === 0 ? (
                    <Card className="empty-state-card">
                        <Filter size={48} className="text-muted" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                        <h3>No candidates found</h3>
                        <p className="text-muted">Try adjusting your filters or search terms.</p>
                    </Card>
                ) : (
                    filteredApps.map(app => (
                        <Card key={app._id} className="applicant-card">

                            {/* Left: Applicant Info */}
                            <div className="applicant-info">
                                <div className="applicant-avatar">
                                    {app.student?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="applicant-details">
                                    <h4>{app.student?.name || 'Unknown Student'}</h4>
                                    <span className="applicant-email">{app.student?.email}</span>
                                    <span className="applied-job-title">Applied for: {app.job?.title}</span>
                                </div>
                            </div>

                            {/* Center: AI Score & Resume */}
                            <div className="applicant-mid">
                                <div className="score-block">
                                    <span className="score-label">AI Match Score</span>
                                    <div className="score-value">
                                        <span className={`score-number ${app.matchScore >= 80 ? 'high' : app.matchScore >= 50 ? 'med' : 'low'}`}>
                                            {app.matchScore || 0}%
                                        </span>
                                    </div>
                                </div>

                                {app.student?.resume_url && (
                                    <a href={app.student.resume_url} target="_blank" rel="noreferrer" className="resume-link-btn">
                                        <FileText size={16} /> View Resume
                                    </a>
                                )}
                            </div>

                            {/* Right: Actions */}
                            <div className="applicant-actions">
                                <div className={`status-pill current-${app.status.toLowerCase()}`}>
                                    {app.status}
                                </div>

                                <div className="action-row">
                                    {app.status !== 'SHORTLISTED' && app.status !== 'HIRED' && (
                                        <button className="action-btn-sm shortlist" onClick={() => handleStatusChange(app._id, 'SHORTLISTED')} title="Shortlist">
                                            <ShieldCheck size={16} />
                                        </button>
                                    )}
                                    {app.status === 'SHORTLISTED' && (
                                        <button className="action-btn-sm hire" onClick={() => handleStatusChange(app._id, 'HIRED')} title="Mark as Hired">
                                            <ShieldCheck size={16} /> Hire
                                        </button>
                                    )}
                                    {app.status !== 'REJECTED' && app.status !== 'HIRED' && (
                                        <button className="action-btn-sm reject" onClick={() => handleStatusChange(app._id, 'REJECTED')} title="Reject">
                                            <XCircle size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

        </div>
    );
};

// Simple Fallback icon
const FileText = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);

export default ApplicantReview;
