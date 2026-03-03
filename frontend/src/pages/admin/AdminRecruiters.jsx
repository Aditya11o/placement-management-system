import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Loader from '../../components/Loader/Loader';
import { Search, Filter, Shield, Ban, CheckCircle, Clock } from 'lucide-react';
import './AdminTable.css';
import api from '../../services/api';

const AdminRecruiters = () => {
    const { addToast } = useToast();
    const [recruiters, setRecruiters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [verificationFilter, setVerificationFilter] = useState('ALL');

    useEffect(() => {
        fetchRecruiters();
    }, []);

    const fetchRecruiters = async () => {
        try {
            // GET /admin/users?role=RECRUITER
            const res = await api.get('/admin/users?role=RECRUITER');
            setRecruiters(res.data.data);
        } catch (error) {
            addToast('Failed to load recruiters list', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            // Map true/false to APPROVED/BLOCKED
            const status = newStatus ? 'APPROVED' : 'BLOCKED';

            await api.put('/admin/users/status', {
                id: userId,
                role: 'RECRUITER',
                status
            });

            addToast(`Recruiter account ${newStatus ? 'activated' : 'deactivated'}`, 'success');

            setRecruiters(recruiters.map(rec =>
                rec._id === userId ? { ...rec, status } : rec
            ));
        } catch (error) {
            addToast('Failed to change account status', 'error');
        }
    };

    const handleVerificationChange = async (recId, isVerified) => {
        try {
            const status = isVerified ? 'APPROVED' : 'BLOCKED';

            await api.put('/admin/users/status', {
                id: recId,
                role: 'RECRUITER',
                status
            });

            addToast(`Company marked as ${isVerified ? 'verified' : 'unverified'}`, 'success');

            // Opting for a refetch as backend logic might have side-effects
            fetchRecruiters();
        } catch (error) {
            addToast('Failed to update verification status', 'error');
        }
    };

    const filteredRecruiters = recruiters.filter(rec => {
        const searchLower = searchTerm.toLowerCase();
        const matchSearch =
            rec.contact_person?.toLowerCase().includes(searchLower) ||
            rec.email?.toLowerCase().includes(searchLower) ||
            rec.company_name?.toLowerCase().includes(searchLower);

        const matchStatus =
            statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' && rec.status === 'APPROVED') ||
            (statusFilter === 'INACTIVE' && rec.status === 'BLOCKED');

        const matchVerification =
            verificationFilter === 'ALL' ||
            (verificationFilter === 'VERIFIED' && rec.status === 'APPROVED') ||
            (verificationFilter === 'PENDING' && rec.status === 'PENDING');

        return matchSearch && matchStatus && matchVerification;
    });

    return (
        <div className="admin-table-container animate-fade-in">
            <div className="board-header mb-4">
                <div>
                    <h1 className="page-heading">Company Directory</h1>
                    <p className="page-subheading">Manage recruiter accounts and business verifications.</p>
                </div>
            </div>

            {/* Filter Bar */}
            <Card className="table-filter-bar">
                <div className="filter-group block-search">
                    <Search size={18} className="text-muted" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="invisible-input"
                    />
                </div>

                <div className="filter-dropdowns">
                    <div className="filter-group">
                        <Filter size={18} className="text-muted" />
                        <select value={verificationFilter} onChange={(e) => setVerificationFilter(e.target.value)} className="invisible-select">
                            <option value="ALL">All Approvals</option>
                            <option value="VERIFIED">Verified</option>
                            <option value="PENDING">Pending Approval</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="invisible-select">
                            <option value="ALL">All Statuses</option>
                            <option value="ACTIVE">Active (Can Login)</option>
                            <option value="INACTIVE">Inactive (Locked)</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Data Table */}
            <Card className="table-wrapper">
                {isLoading ? (
                    <div className="p-8"><Loader inline /></div>
                ) : filteredRecruiters.length === 0 ? (
                    <div className="empty-state-table">
                        <p className="text-muted">No recruiters found matching current filters.</p>
                    </div>
                ) : (
                    <div className="responsive-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Recruiter Name</th>
                                    <th>Company</th>
                                    <th>Registration</th>
                                    <th>Verification</th>
                                    <th>System Access</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecruiters.map(rec => (
                                    <tr key={rec._id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-text">
                                                    <strong>{rec.contact_person}</strong>
                                                    <span>{rec.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="pill-gray">{rec.company_name || 'N/A'}</span></td>
                                        <td>{new Date(rec.created_at).toLocaleDateString()}</td>

                                        {/* Verification Status */}
                                        <td>
                                            {rec.status === 'APPROVED' ? (
                                                <span className="status-pill current-hired"><Shield size={12} style={{ marginRight: '4px' }} /> Verified</span>
                                            ) : rec.status === 'PENDING' ? (
                                                <span className="status-pill current-pending"><Clock size={12} style={{ marginRight: '4px' }} /> Pending</span>
                                            ) : (
                                                <span className="status-pill current-rejected"><Ban size={12} style={{ marginRight: '4px' }} /> Blocked</span>
                                            )}
                                        </td>

                                        {/* Login Status */}
                                        <td>
                                            {rec.status === 'APPROVED' ? (
                                                <span className="status-pill current-shortlisted"><CheckCircle size={12} style={{ marginRight: '4px' }} /> Active</span>
                                            ) : (
                                                <span className="status-pill current-rejected"><Ban size={12} style={{ marginRight: '4px' }} /> Inactive</span>
                                            )}
                                        </td>

                                        <td>
                                            <div className="action-row" style={{ flexWrap: 'wrap' }}>
                                                {/* Toggle Account Access */}
                                                {rec.status === 'APPROVED' ? (
                                                    <button
                                                        className="action-btn-sm reject"
                                                        title="Block Login Access"
                                                        onClick={() => handleStatusChange(rec._id, false)}
                                                    >
                                                        Block
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="action-btn-sm shortlist"
                                                        title="Restore Login Access"
                                                        onClick={() => handleStatusChange(rec._id, true)}
                                                    >
                                                        Approve
                                                    </button>
                                                )}

                                                {/* Toggle Verification (If not verified yet) */}
                                                {rec.status === 'PENDING' && (
                                                    <button
                                                        className="action-btn-sm hire"
                                                        style={{ marginLeft: '0.5rem' }}
                                                        title="Verify Company"
                                                        onClick={() => handleVerificationChange(rec._id, true)}
                                                    >
                                                        Verify
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminRecruiters;
