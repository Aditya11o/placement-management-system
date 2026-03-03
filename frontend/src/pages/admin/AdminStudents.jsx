import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Loader from '../../components/Loader/Loader';
import { Search, Filter, Shield, Ban, CheckCircle } from 'lucide-react';
import './AdminTable.css'; // Shared CSS for Admin tables
import api from '../../services/api';

const AdminStudents = () => {
    const { addToast } = useToast();
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [branchFilter, setBranchFilter] = useState('ALL');

    // Extract unique branches for filter
    const uniqueBranches = [...new Set(students.map(s => s.studentProfile?.branch).filter(Boolean))];

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            // GET /admin/users?role=STUDENT
            const res = await api.get('/admin/users?role=STUDENT');
            setStudents(res.data.data);
        } catch (error) {
            addToast('Failed to load students list', 'error');
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
                role: 'STUDENT',
                status
            });

            addToast(`Student account ${newStatus ? 'activated' : 'deactivated'}`, 'success');

            setStudents(students.map(student =>
                student._id === userId ? { ...student, status } : student
            ));
        } catch (error) {
            addToast('Failed to change account status', 'error');
        }
    };

    const filteredStudents = students.filter(student => {
        const searchLower = searchTerm.toLowerCase();
        const matchSearch =
            student.name?.toLowerCase().includes(searchLower) ||
            student.email?.toLowerCase().includes(searchLower) ||
            student.studentProfile?.branch?.toLowerCase().includes(searchLower);

        const matchStatus =
            statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' && student.status === 'APPROVED') ||
            (statusFilter === 'INACTIVE' && student.status === 'BLOCKED');

        const matchBranch =
            branchFilter === 'ALL' ||
            student.studentProfile?.branch === branchFilter;

        return matchSearch && matchStatus && matchBranch;
    });

    return (
        <div className="admin-table-container animate-fade-in">
            <div className="board-header mb-4">
                <div>
                    <h1 className="page-heading">Student Directory</h1>
                    <p className="page-subheading">Manage all registered students on the platform.</p>
                </div>
            </div>

            {/* Filter Bar */}
            <Card className="table-filter-bar">
                <div className="filter-group block-search">
                    <Search size={18} className="text-muted" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or branch..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="invisible-input"
                    />
                </div>

                <div className="filter-dropdowns">
                    <div className="filter-group">
                        <Filter size={18} className="text-muted" />
                        <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="invisible-select">
                            <option value="ALL">All Branches</option>
                            {uniqueBranches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>

                    <div className="filter-group">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="invisible-select">
                            <option value="ALL">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Data Table */}
            <Card className="table-wrapper">
                {isLoading ? (
                    <div className="p-8"><Loader inline /></div>
                ) : filteredStudents.length === 0 ? (
                    <div className="empty-state-table">
                        <p className="text-muted">No students found matching current filters.</p>
                    </div>
                ) : (
                    <div className="responsive-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Student Info</th>
                                    <th>Branch</th>
                                    <th>CGPA</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(student => (
                                    <tr key={student._id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar-sm">{student.name?.charAt(0) || 'S'}</div>
                                                <div className="user-text">
                                                    <strong>{student.name}</strong>
                                                    <span>{student.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="pill-gray">{student.studentProfile?.branch || 'N/A'}</span></td>
                                        <td><strong>{student.studentProfile?.cgpa || 'N/A'}</strong></td>
                                        <td>
                                            {student.status === 'APPROVED' ? (
                                                <span className="status-pill current-hired"><CheckCircle size={12} style={{ marginRight: '4px' }} /> Active</span>
                                            ) : student.status === 'PENDING' ? (
                                                <span className="status-pill current-pending"><Clock size={12} style={{ marginRight: '4px' }} /> Pending</span>
                                            ) : (
                                                <span className="status-pill current-rejected"><Ban size={12} style={{ marginRight: '4px' }} /> Blocked</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-row">
                                                {student.status === 'APPROVED' ? (
                                                    <button
                                                        className="action-btn-sm reject"
                                                        title="Block Account"
                                                        onClick={() => handleStatusChange(student._id, false)}
                                                    >
                                                        <Ban size={16} /> Block
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="action-btn-sm shortlist"
                                                        title="Approve Account"
                                                        onClick={() => handleStatusChange(student._id, true)}
                                                    >
                                                        <Shield size={16} /> Approve
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

export default AdminStudents;
