import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Loader from '../../components/Loader/Loader';
import { Briefcase, Calendar, Building, ShieldCheck, XCircle } from 'lucide-react';
import './JobBoard.css'; // Reusing job card styles
import api from '../../services/api';

const StudentApplications = () => {
    const { addToast } = useToast();
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const res = await api.get('/applications/student');
            setApplications(res.data.data);
        } catch (error) {
            addToast('Failed to load application history', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'PENDING':
                return { label: 'In Review', class: 'bg-yellow text-yellow', icon: Clock };
            case 'SHORTLISTED':
                return { label: 'Shortlisted', class: 'bg-blue text-blue', icon: ShieldCheck };
            case 'REJECTED':
                return { label: 'Rejected', class: 'bg-red text-red', icon: XCircle };
            case 'HIRED':
                return { label: 'Hired / Placed', class: 'bg-green text-green', icon: ShieldCheck };
            default:
                return { label: status, class: 'bg-gray text-gray', icon: Clock };
        }
    };

    return (
        <div className="job-board-container animate-fade-in">
            <div className="board-header">
                <div>
                    <h1 className="page-heading">My Applications</h1>
                    <p className="page-subheading">Track the status of roles you have applied for.</p>
                </div>
            </div>

            {isLoading ? (
                <Loader />
            ) : (
                <div className="jobs-grid">
                    {applications.length === 0 ? (
                        <div className="empty-state-card grid-full-col">
                            <Briefcase size={48} className="text-muted" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                            <p>You haven't applied to any jobs yet.</p>
                        </div>
                    ) : (
                        applications.map(app => {
                            const statusConfig = getStatusConfig(app.status);

                            return (
                                <Card key={app._id} className="job-card">
                                    <div className="job-card-header">
                                        <div className="company-logo-placeholder">
                                            {app.job?.company?.company_name?.charAt(0) || 'C'}
                                        </div>
                                        <div className="job-title-group">
                                            <h3>{app.job?.title || 'Unknown Job'}</h3>
                                            <span className="company-name">
                                                <Building size={14} className="inline-icon" /> {app.job?.company?.company_name || 'Unknown Company'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="job-meta-grid" style={{ marginBottom: '1rem', paddingBottom: '1rem' }}>
                                        <div className="meta-item">
                                            <Calendar size={16} />
                                            <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="application-status-area" style={{
                                        marginTop: 'auto',
                                        padding: '1rem',
                                        borderRadius: '0.5rem',
                                        backgroundColor: '#f8fafc',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem'
                                    }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                                            Current Status
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                            <span className={`status-badge ${statusConfig.class}`} style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem' }}>
                                                {statusConfig.label}
                                            </span>
                                        </div>

                                        {app.matchScore && (
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between' }}>
                                                <span className="text-muted">AI Match Score:</span>
                                                <span style={{ fontWeight: 600, color: app.matchScore > 75 ? 'var(--color-success)' : 'var(--color-primary-500)' }}>
                                                    {app.matchScore}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

// Simple Mock component for Clock icon missing from lucide import
const Clock = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);

export default StudentApplications;
