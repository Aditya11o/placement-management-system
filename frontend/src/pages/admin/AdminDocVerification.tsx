import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    FileCheck, FileX, ChevronRight, User, Mail, Phone, GraduationCap,
    BookOpen, Award, AlertTriangle, Loader2, CheckCircle, XCircle,
    FileText, Image, ArrowDown, ArrowUp
} from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import { useToast } from '../../context/ToastContext';

// ── Types ────────────────────────────────────────────────────────────────────
interface PendingStudent {
    _id: string;
    name: string;
    email: string;
    branch: string;
    cgpa: number;
    graduation_year: number;
    phone: string;
    marks_10th: number;
    marks_12th: number;
    gender: string;
    backlogs_active: number;
    skills: string[];
    profile_image_url: string | null;
    resume_versions: Array<{
        version: number;
        url: string;
        label: string;
        is_active: boolean;
        uploaded_at: string;
    }>;
    status: string;
    created_at: string;
}

// ── Component ────────────────────────────────────────────────────────────────
const AdminDocVerification: React.FC = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [branchFilter, setBranchFilter] = useState('');

    // Fetch pending students
    const { data: students = [], isLoading } = useQuery<PendingStudent[]>({
        queryKey: ['pending-students'],
        queryFn: async () => {
            const res = await api.get('/admin/users?role=STUDENT&status=PENDING');
            return res.data?.data || [];
        },
    });

    const filteredStudents = branchFilter
        ? students.filter(s => s.branch.toLowerCase().includes(branchFilter.toLowerCase()))
        : students;

    const selectedStudent = students.find(s => s._id === selectedId) || null;

    // Auto-select first student
    useEffect(() => {
        if (!selectedId && students.length > 0) {
            setSelectedId(students[0]._id);
        }
    }, [students, selectedId]);

    // ── Approve / Reject Mutations ───────────────────────────────────────────
    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            api.put('/admin/users/status', { id, role: 'STUDENT', status }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['pending-students'] });
            showToast(
                variables.status === 'APPROVED' ? 'Student approved successfully!' : 'Student rejected',
                variables.status === 'APPROVED' ? 'success' : 'info'
            );
            // Auto-advance to next student
            const currentIdx = students.findIndex(s => s._id === variables.id);
            const next = students[currentIdx + 1] || students[currentIdx - 1];
            setSelectedId(next?._id || null);
        },
        onError: (err: any) => showToast(err.response?.data?.message || 'Action failed', 'error'),
    });

    const handleApprove = () => {
        if (!selectedStudent) return;
        statusMutation.mutate({ id: selectedStudent._id, status: 'APPROVED' });
    };

    const handleReject = () => {
        if (!selectedStudent) return;
        statusMutation.mutate({ id: selectedStudent._id, status: 'BLOCKED' });
        setShowRejectModal(false);
        setRejectReason('');
    };

    // ── Keyboard Shortcuts ───────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (showRejectModal) return;
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

            if (e.key === 'a' || e.key === 'A') {
                e.preventDefault();
                handleApprove();
            } else if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                setShowRejectModal(true);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const idx = students.findIndex(s => s._id === selectedId);
                if (idx < students.length - 1) setSelectedId(students[idx + 1]._id);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const idx = students.findIndex(s => s._id === selectedId);
                if (idx > 0) setSelectedId(students[idx - 1]._id);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [selectedId, students, showRejectModal]);

    const activeResume = selectedStudent?.resume_versions?.find(v => v.is_active) ||
        selectedStudent?.resume_versions?.[selectedStudent.resume_versions.length - 1];

    const branches = [...new Set(students.map(s => s.branch))];

    return (
        <div className="flex flex-col gap-6 animate-fade-in overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-1 flex items-center gap-3">
                        <FileCheck size={28} /> Document Verification
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base m-0">
                        Review pending student registrations — {students.length} pending
                    </p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                    <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono">A</kbd> Approve
                    <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono ml-2">R</kbd> Reject
                    <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono ml-2">↕</kbd> Navigate
                </div>
            </div>

            {isLoading ? (
                <Card className="p-12">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                        <Loader2 className="animate-spin" size={24} />
                        <span>Loading pending students...</span>
                    </div>
                </Card>
            ) : students.length === 0 ? (
                <Card className="p-16 text-center">
                    <CheckCircle size={48} className="text-emerald-300 dark:text-emerald-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400">All Caught Up!</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500">No pending student registrations to review.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_1fr] gap-4 min-h-[calc(100vh-240px)]">
                    {/* ── Student Queue Sidebar ──────────────────────────────── */}
                    <Card className="p-0 overflow-hidden flex flex-col">
                        <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                            <select
                                value={branchFilter}
                                onChange={e => setBranchFilter(e.target.value)}
                                className="w-full text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-2 rounded-lg text-slate-700 dark:text-slate-200"
                            >
                                <option value="">All Branches ({students.length})</option>
                                {branches.map(b => (
                                    <option key={b} value={b}>{b} ({students.filter(s => s.branch === b).length})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {filteredStudents.map(student => (
                                <div
                                    key={student._id}
                                    onClick={() => setSelectedId(student._id)}
                                    className={`flex items-center gap-3 p-3 cursor-pointer border-b border-slate-100 dark:border-slate-800 transition-colors ${selectedId === student._id
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-500'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'
                                        }`}
                                >
                                    {student.profile_image_url ? (
                                        <img src={student.profile_image_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                            <User size={16} className="text-slate-400 dark:text-slate-500" />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate m-0">{student.name}</p>
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate m-0">{student.branch} · {student.cgpa} CGPA</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* ── Document Viewer (Left Panel) ──────────────────────── */}
                    <Card className="p-0 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 m-0">
                                <FileText size={16} /> Documents
                            </h3>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            {!selectedStudent ? (
                                <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 text-sm">
                                    Select a student to view documents
                                </div>
                            ) : !activeResume ? (
                                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 dark:text-slate-500">
                                    <AlertTriangle size={40} className="mb-3 opacity-50" />
                                    <p className="text-sm font-medium">No resume uploaded</p>
                                    <p className="text-xs">This student has not uploaded any documents yet.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {/* Resume Viewer */}
                                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                        <div className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800 text-xs">
                                            <span className="font-semibold text-slate-600 dark:text-slate-300">
                                                Resume v{activeResume.version} {activeResume.label ? `— ${activeResume.label}` : ''}
                                            </span>
                                            <a
                                                href={activeResume.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                                            >
                                                Open in new tab ↗
                                            </a>
                                        </div>
                                        <iframe
                                            src={`${activeResume.url}#toolbar=0`}
                                            className="w-full h-[500px] bg-white dark:bg-slate-900"
                                            title="Resume Preview"
                                        />
                                    </div>

                                    {/* Profile Image */}
                                    {selectedStudent.profile_image_url && (
                                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                            <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                                <Image size={14} /> Profile Photo
                                            </div>
                                            <div className="p-4 flex justify-center">
                                                <img
                                                    src={selectedStudent.profile_image_url}
                                                    alt={selectedStudent.name}
                                                    className="max-w-[200px] max-h-[200px] rounded-lg object-cover shadow-md"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* All Resume Versions */}
                                    {selectedStudent.resume_versions.length > 1 && (
                                        <div className="text-xs text-slate-400 dark:text-slate-500">
                                            <span className="font-semibold">All versions: </span>
                                            {selectedStudent.resume_versions.map((rv, i) => (
                                                <a
                                                    key={i}
                                                    href={rv.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`inline-block mr-2 px-2 py-0.5 rounded border transition-colors ${rv.is_active
                                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-500'
                                                        }`}
                                                >
                                                    v{rv.version} {rv.label || ''}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* ── Profile Data + Actions (Right Panel) ──────────────── */}
                    <Card className="p-0 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 m-0">
                                <User size={16} /> Student Profile
                            </h3>
                        </div>

                        {!selectedStudent ? (
                            <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                                Select a student
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col">
                                <div className="flex-1 overflow-y-auto p-5">
                                    {/* Name & Avatar */}
                                    <div className="flex items-center gap-4 mb-6">
                                        {selectedStudent.profile_image_url ? (
                                            <img src={selectedStudent.profile_image_url} alt="" className="w-16 h-16 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                                <User size={28} className="text-indigo-500" />
                                            </div>
                                        )}
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0">{selectedStudent.name}</h2>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 m-0">{selectedStudent.branch} · Class of {selectedStudent.graduation_year}</p>
                                        </div>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <InfoItem icon={Mail} label="Email" value={selectedStudent.email} />
                                        <InfoItem icon={Phone} label="Phone" value={selectedStudent.phone} />
                                        <InfoItem icon={GraduationCap} label="CGPA" value={String(selectedStudent.cgpa)} />
                                        <InfoItem icon={BookOpen} label="Gender" value={selectedStudent.gender} />
                                        <InfoItem icon={Award} label="10th Marks" value={`${selectedStudent.marks_10th}%`} />
                                        <InfoItem icon={Award} label="12th Marks" value={`${selectedStudent.marks_12th}%`} />
                                        <InfoItem icon={AlertTriangle} label="Active Backlogs" value={String(selectedStudent.backlogs_active)} highlight={selectedStudent.backlogs_active > 0} />
                                        <InfoItem icon={FileText} label="Resumes" value={`${selectedStudent.resume_versions?.length || 0} uploaded`} />
                                    </div>

                                    {/* Skills */}
                                    {selectedStudent.skills && selectedStudent.skills.length > 0 && (
                                        <div className="mt-5">
                                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Skills</span>
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {selectedStudent.skills.map((skill, i) => (
                                                    <span key={i} className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Registration Date */}
                                    <div className="mt-5 text-xs text-slate-400 dark:text-slate-500">
                                        Registered: {new Date(selectedStudent.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                </div>

                                {/* ── Action Bar ──────────────────────────────── */}
                                <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex gap-3">
                                    <button
                                        onClick={handleApprove}
                                        disabled={statusMutation.isPending}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        <CheckCircle size={18} />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => setShowRejectModal(true)}
                                        disabled={statusMutation.isPending}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        <XCircle size={18} />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* ── Reject Modal ────────────────────────────────────────────── */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowRejectModal(false)}>
                    <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Reject Student</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Are you sure you want to reject <strong>{selectedStudent?.name}</strong>?
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Optional: Reason for rejection..."
                            className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={statusMutation.isPending}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Info Item Sub-component ──────────────────────────────────────────────────
const InfoItem: React.FC<{ icon: React.ElementType; label: string; value: string; highlight?: boolean }> = ({ icon: Icon, label, value, highlight }) => (
    <div className="flex items-start gap-2.5">
        <Icon size={14} className={`mt-0.5 shrink-0 ${highlight ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`} />
        <div className="min-w-0">
            <span className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</span>
            <span className={`block text-sm truncate ${highlight ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-700 dark:text-slate-200'}`}>{value}</span>
        </div>
    </div>
);

export default AdminDocVerification;
