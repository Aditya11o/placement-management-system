import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { Briefcase, FileText, CheckCircle, Clock } from 'lucide-react';
import './StudentDashboard.css';
import api from '../../services/api';

const StudentDashboard = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [stats, setStats] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch dashboard statistics (Mocked endpoints or actual if they exist)
                // For now, we simulate stats, but we can fetch real announcements
                const annRes = await api.get('/announcements');
                // Defensive check to ensure it's an array before slicing
                const annData = annRes.data?.data || [];
                setAnnouncements(Array.isArray(annData) ? annData.slice(0, 3) : []);

                // Simulating stats payload that would normally come from /analytics/student
                setStats({
                    applicationsSent: 12,
                    interviewsScheduled: 2,
                    offersReceived: 0,
                    profileCompletion: 85
                });

            } catch (error) {
                addToast('Failed to load dashboard data', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [addToast]);

    if (isLoading) return <Loader />;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header animate-fade-in">
                <h1>Welcome back, {user?.name ? user.name.split(' ')[0] : 'Student'}! 👋</h1>
                <p>Here's what's happening with your placements today.</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <Card className="stat-card">
                    <div className="stat-icon-wrapper blue">
                        <Briefcase size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.applicationsSent}</h3>
                        <p>Applications Sent</p>
                    </div>
                </Card>

                <Card className="stat-card">
                    <div className="stat-icon-wrapper orange">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.interviewsScheduled}</h3>
                        <p>Interviews Scheduled</p>
                    </div>
                </Card>

                <Card className="stat-card">
                    <div className="stat-icon-wrapper green">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.offersReceived}</h3>
                        <p>Offers Received</p>
                    </div>
                </Card>

                <Card className="stat-card">
                    <div className="stat-icon-wrapper purple">
                        <FileText size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.profileCompletion}%</h3>
                        <p>Profile Completion</p>
                        <div className="progress-bar-bg">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${stats?.profileCompletion}%` }}
                            ></div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="dashboard-main-grid animate-fade-in" style={{ animationDelay: '0.2s' }}>

                {/* Left Column: Recent Activity / Announcements */}
                <div className="main-column">
                    <Card className="announcements-card">
                        <div className="card-header-flex">
                            <h2>Latest Announcements</h2>
                            <Button variant="ghost" size="sm">View All</Button>
                        </div>

                        <div className="announcements-list">
                            {announcements.length > 0 ? (
                                announcements.map((ann) => (
                                    <div key={ann._id} className="announcement-item">
                                        <span className="ann-date">
                                            {new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                        <div className="ann-content">
                                            <h4>{ann.title}</h4>
                                            <p>{ann.content.substring(0, 100)}...</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <p>No new announcements at this time.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Quick Actions */}
                <div className="side-column">
                    <Card className="quick-actions-card">
                        <h2>Quick Actions</h2>
                        <div className="action-buttons">
                            <Button isFullWidth variant="primary" icon={Briefcase}>Browse Jobs</Button>
                            <Button isFullWidth variant="secondary" icon={FileText}>Upload Resume</Button>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default StudentDashboard;
