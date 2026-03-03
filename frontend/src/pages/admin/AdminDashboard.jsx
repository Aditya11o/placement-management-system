import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { Users, Building, Activity, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import api from '../../services/api';

const AdminDashboard = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [pendingRecruiters, setPendingRecruiters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch real stats from admin dashboard endpoint
            const statsRes = await api.get('/admin/dashboard');
            if (statsRes.data.success) {
                const s = statsRes.data.data;
                setStats({
                    totalStudents: s.studentCount,
                    totalRecruiters: s.recruiterCount,
                    totalJobs: s.activeJobs,
                    placedStudents: 0, // Not explicitly tracked in simple stats yet
                    placementRate: 'N/A' // Calculated if needed
                });
            }

            // Fetch actual pending recruiters
            const pendingRes = await api.get('/admin/users?role=RECRUITER&status=PENDING');
            setPendingRecruiters(pendingRes?.data?.data || []);

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            setPendingRecruiters([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecruiterApproval = async (id, action) => {
        try {
            const status = action === 'approve' ? 'APPROVED' : 'BLOCKED';

            await api.put('/admin/users/status', {
                id,
                role: 'RECRUITER',
                status
            });

            addToast(`Recruiter ${action}d successfully.`, 'success');

            // Remove from list
            setPendingRecruiters(prev => prev.filter(r => r._id !== id));

        } catch (error) {
            addToast(`Failed to ${action} recruiter.`, 'error');
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="dashboard-container animate-fade-in">
            <div className="dashboard-header-flex">
                <div>
                    <h1 className="page-heading">Admin Overview</h1>
                    <p className="page-subheading">System metrics and pending approval actions.</p>
                </div>
            </div>

            {/* Admin Stats Grid */}
            <div className="admin-stats-grid">
                <Card className="stat-card">
                    <div className="stat-icon-wrapper blue">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.totalStudents}</h3>
                        <p>Registered Students</p>
                    </div>
                </Card>

                <Card className="stat-card">
                    <div className="stat-icon-wrapper purple">
                        <Building size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.totalRecruiters}</h3>
                        <p>Approved Companies</p>
                    </div>
                </Card>

                <Card className="stat-card">
                    <div className="stat-icon-wrapper orange">
                        <Activity size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.placementRate}</h3>
                        <p>Platform Placement Rate</p>
                    </div>
                </Card>
            </div>

            <div className="admin-main-grid">

                {/* Pending Actions / Approvals */}
                <div className="main-column">
                    <Card className="pending-actions-card">
                        <div className="card-header-flex">
                            <h2>Pending Recruiter Approvals</h2>
                            {pendingRecruiters.length > 0 && (
                                <span className="badge-warning">{pendingRecruiters.length} Pending</span>
                            )}
                        </div>

                        <div className="approval-list">
                            {pendingRecruiters.length === 0 ? (
                                <div className="empty-state">
                                    <ShieldAlert size={40} className="text-muted opacity-50 mb-3" />
                                    <p>No pending recruiter registrations require attention.</p>
                                </div>
                            ) : (
                                pendingRecruiters.map(rec => (
                                    <div key={rec._id} className="approval-item">
                                        <div className="approval-info">
                                            <h4>{rec.company_name || 'Unknown Company'}</h4>
                                            <p className="text-muted">{rec.contact_person} ({rec.email})</p>
                                        </div>
                                        <div className="approval-actions">
                                            <button className="icon-btn-action approve" onClick={() => handleRecruiterApproval(rec._id, 'approve')}>
                                                <CheckCircle size={20} />
                                            </button>
                                            <button className="icon-btn-action reject" onClick={() => handleRecruiterApproval(rec._id, 'reject')}>
                                                <XCircle size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Quick Links */}
                <div className="side-column">
                    <Card className="quick-links-card">
                        <h2>Management Links</h2>
                        <div className="links-group">
                            <Button isFullWidth variant="secondary" icon={Users} onClick={() => navigate('/admin/students')}>Manage Students</Button>
                            <Button isFullWidth variant="secondary" icon={Building} onClick={() => navigate('/admin/recruiters')}>Manage Companies</Button>
                            <div className="divider"></div>
                            {/* Future links for reports could go here */}
                            <Button isFullWidth variant="ghost" disabled>Export Reports</Button>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
