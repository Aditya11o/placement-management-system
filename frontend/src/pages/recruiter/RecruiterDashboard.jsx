import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { Briefcase, Users, CheckCircle, TrendingUp, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './RecruiterDashboard.css';
import api from '../../services/api';

const RecruiterDashboard = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [recentJobs, setRecentJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Mocking stats for now, would be fetched from /analytics/recruiter
            setStats({
                activeJobs: 3,
                totalApplicants: 142,
                shortlisted: 28,
                hired: 5
            });

            // Fetch actual recent jobs posted by this recruiter
            const res = await api.get('/jobs/recruiter');
            setRecentJobs(res.data.data.slice(0, 4)); // Get top 4

        } catch (error) {
            addToast('Failed to load dashboard data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="dashboard-container animate-fade-in">
            <div className="dashboard-header-flex">
                <div>
                    <h1 className="page-heading">Company Dashboard</h1>
                    <p className="page-subheading">Welcome back, {user?.name}. Here's your recruitment overview.</p>
                </div>
                <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() => navigate('/recruiter/jobs')}
                >
                    Post New Job
                </Button>
            </div>

            {/* Recruiter Stats Grid */}
            <div className="stats-grid">
                <Card className="stat-card">
                    <div className="stat-icon-wrapper blue">
                        <Briefcase size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.activeJobs}</h3>
                        <p>Active Job Postings</p>
                    </div>
                </Card>

                <Card className="stat-card">
                    <div className="stat-icon-wrapper purple">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.totalApplicants}</h3>
                        <p>Total Applications</p>
                    </div>
                </Card>

                <Card className="stat-card">
                    <div className="stat-icon-wrapper orange">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.shortlisted}</h3>
                        <p>Candidates Shortlisted</p>
                    </div>
                </Card>

                <Card className="stat-card">
                    <div className="stat-icon-wrapper green">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.hired}</h3>
                        <p>Total Hires</p>
                    </div>
                </Card>
            </div>

            {/* Main Grid area */}
            <div className="recruiter-main-grid">
                <div className="main-column">
                    <Card className="recent-jobs-card">
                        <div className="card-header-flex">
                            <h2>Recent Job Postings</h2>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/recruiter/jobs')}>View All</Button>
                        </div>

                        <div className="jobs-list">
                            {recentJobs.length === 0 ? (
                                <div className="empty-state">
                                    <p>No active job postings found.</p>
                                </div>
                            ) : (
                                recentJobs.map(job => (
                                    <div key={job._id} className="job-list-item">
                                        <div className="job-item-info">
                                            <h4>{job.title}</h4>
                                            <span className="text-muted">Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="job-item-stats">
                                            <div className="mini-stat">
                                                <Users size={14} className="text-muted" />
                                                <span>{job.applicationCount || 0}</span>
                                            </div>
                                            <span className={`status-badge ${job.status === 'OPEN' ? 'active' : 'inactive'}`}>
                                                {job.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                <div className="side-column">
                    <Card className="quick-actions-card">
                        <h2>Quick Actions</h2>
                        <div className="action-buttons">
                            <Button isFullWidth variant="secondary" icon={Users} onClick={() => navigate('/recruiter/applicants')}>Review Applicants</Button>
                            <Button isFullWidth variant="ghost" icon={Briefcase} onClick={() => navigate('/recruiter/profile')}>Edit Company Profile</Button>
                        </div>
                    </Card>
                </div>
            </div>

        </div>
    );
};

export default RecruiterDashboard;
