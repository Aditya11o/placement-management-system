import React, { useState, useEffect } from 'react';
import { Search, Eye, Check, Edit2, XCircle, UserPlus, CheckCircle, Mail, X, AlertCircle, ShieldCheck, ArrowRight, Power, FileSpreadsheet, Upload, Download, FileText } from 'lucide-react';
import ListSkeleton from '../../components/skeletons/ListSkeleton';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';
import StudentFormModal from '../../components/admin/StudentFormModal';
import StudentViewModal from '../../components/admin/StudentViewModal';
import BulkEmailModal from '../../components/admin/BulkEmailModal';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';

const ManageStudents: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [complianceStats, setComplianceStats] = useState({
    totalStudents: 0,
    unverified: 0,
    missingResume: 0,
    incompleteProfile: 0,
    healthScore: 0
  });
  const [activeTab, setActiveTab] = useState('All');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', course: 'BCA', branch: 'Computer Science', cgpa: '' });
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    icon?: any;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {}
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const [{ data: userData }, { data: complianceData }] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/students/compliance')
      ]);
      
      setComplianceStats(complianceData);
      
      const filtered = userData.filter((u: any) => u.role === 'student').map((u: any) => {
        const profile = u.studentProfile || u.profile || u.studentDetails || {};
        const issues = [];
        if (!profile.resume) issues.push('Missing Resume');
        if ((profile.profileCompletion || 0) < 80) issues.push('Incomplete Profile');
        if (!profile.academicVerified) issues.push('Unverified');

        return {
          _id: u._id || u.id, name: u.name, email: u.email,
          course: profile.course || 'N/A',
          branch: profile.department || profile.branch || 'N/A',
          cgpa: profile.current_cgpa || profile.cgpa || '0.0',
          skills: profile.skills || [],
          regDate: new Date(u.createdAt).toLocaleDateString(),
          status: u.isVerified ? 'Approved' : 'Pending',
          isVerified: u.isVerified,
          academicVerified: profile.academicVerified,
          issues,
          avatar: u.profilePhoto || profile.profile_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`,
          original: u
        };
      });
      setStudents(filtered);
    } catch (err: any) { showError('Failed to fetch students', 'Fetch Error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleVerify = async (id: string, isVerified: boolean) => {
    const execute = async () => {
      try { 
        await api.patch(`/admin/users/${id}/verify`, { isVerified }); 
        fetchStudents(); 
        showSuccess(`Student ${isVerified ? 'verified' : 'unverified'} successfully!`, 'Update Status'); 
      }
      catch (err: any) { showError(err.response?.data?.message || 'Failed to update student status', 'Update Error'); }
    };

    if (!isVerified) {
      setConfirmState({
        isOpen: true,
        type: 'danger',
        title: 'Deactivate Student?',
        message: 'Are you sure you want to deactivate this student? They will lose access to the portal immediately.',
        onConfirm: execute,
        icon: Power
      });
    } else {
      execute();
    }
  };

  const handleBulkStatusUpdate = async (isVerified: boolean, status?: string) => {
    try {
      setSubmitting(true);
      await api.patch('/admin/users/bulk', { userIds: selectedIds, isVerified, status });
      showSuccess(`Updated ${selectedIds.length} students successfully!`, 'Bulk Update');
      setSelectedIds([]);
      fetchStudents();
    } catch (err: any) {
      showError('Failed to update students', 'Bulk Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkEmail = async (emailData: { subject: string; message: string; title: string }) => {
    try {
      setSubmitting(true);
      await api.post('/admin/users/bulk-email', { userIds: selectedIds, ...emailData });
      showSuccess(`Sent emails to ${selectedIds.length} students!`, 'Email Sent');
      setIsEmailModalOpen(false);
      setSelectedIds([]);
    } catch (err: any) {
      showError('Failed to send bulk emails', 'Email Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkAcademicVerify = async (isVerified: boolean) => {
    try {
      setSubmitting(true);
      await api.patch('/admin/students/bulk-academic-verify', { studentIds: selectedIds, isVerified });
      showSuccess(`Updated academic verification for ${selectedIds.length} students!`, 'Academic Verify');
      setSelectedIds([]);
      fetchStudents();
    } catch (err: any) {
      showError('Failed to verify students academics', 'Verify Error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map(s => s._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try { setSubmitting(true); await api.post('/admin/students', formData); showSuccess('Student account created!', 'Success'); setIsAddModalOpen(false); setFormData({ name: '', email: '', password: '', course: 'BCA', branch: 'Computer Science', cgpa: '' }); fetchStudents(); }
    catch (err: any) { showError(err.response?.data?.message || 'Failed to create student', 'Error'); }
    finally { setSubmitting(false); }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try { setSubmitting(true); await api.patch(`/admin/users/${selectedStudent._id}/verify`, { name: formData.name, course: formData.course, cgpa: formData.cgpa }); showSuccess('Student profile updated!', 'Update Success'); setIsEditModalOpen(false); fetchStudents(); }
    catch (err: any) { showError(err.response?.data?.message || 'Failed to update student', 'Error'); }
    finally { setSubmitting(false); }
  };

  const handleRunBatchVerification = async () => {
    try { setLoading(true); const { data } = await api.post('/admin/verify-batch'); showSuccess(data.message, 'Batch Complete'); fetchStudents(); }
    catch (err: any) { showError('Failed to run verification batch', 'Error'); }
    finally { setLoading(false); }
  };

  const handleExportStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/data/export/students', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSuccess('Student data exported successfully', 'Export Complete');
    } catch (err: any) {
      showError('Failed to export student data', 'Export Error');
    } finally {
      setLoading(false);
    }
  };

  const handleImportStudents = async () => {
    if (!importFile) return;
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('file', importFile);
      const { data } = await api.post('/api/admin/data/import/students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showSuccess(data.message, 'Import Complete');
      setIsImportModalOpen(false);
      setImportFile(null);
      fetchStudents();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to import CSV', 'Import Error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (student: any) => {
    setSelectedStudent(student);
    setFormData({ name: student.name, email: student.email, password: '', course: student.course, branch: student.branch, cgpa: student.cgpa });
    setIsEditModalOpen(true);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.course.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'Unverified') return matchesSearch && !s.academicVerified;
    if (activeTab === 'Issues') return matchesSearch && s.issues.length > 0;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in relative pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[#000613]">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight uppercase tracking-tighter">Student <span className="text-blue-600">Inventory</span></h1>
          <p className="text-sm text-gray-400 font-bold mt-1">Strategic oversight and lifecycle management for student profiles.</p>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleExportStudents}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#000613] border border-gray-100 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-gray-50 transition-all"
          >
            <Download size={18} /> Export CSV
          </button>
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all"
          >
            <Upload size={18} /> Bulk Import
          </button>
          <button onClick={() => { setFormData({ name: '', email: '', password: '', course: 'BCA', branch: 'Computer Science', cgpa: '' }); setIsAddModalOpen(true); }} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#000613] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-105 transition-all"><UserPlus size={18} />Add Student</button>
        </div>

      {/* Compliance Pulse */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Unverified', count: complianceStats.unverified, color: 'rose', icon: ShieldCheck, tab: 'Unverified' },
          { label: 'Compliance Issues', count: complianceStats.missingResume + complianceStats.incompleteProfile, color: 'orange', icon: AlertCircle, tab: 'Issues' },
          { label: 'Missing Resumes', count: complianceStats.missingResume, color: 'amber', icon: Eye, tab: 'All' },
          { label: 'Health Score', count: `${complianceStats.healthScore}%`, color: 'blue', icon: CheckCircle, tab: 'All' }
        ].map((stat, i) => (
          <button 
            key={i} 
            onClick={() => setActiveTab(stat.tab)}
            className={`p-5 rounded-3xl border transition-all text-left group ${activeTab === stat.tab ? 'bg-white border-[#000613] shadow-lg scale-[1.02]' : 'bg-white/50 border-gray-100 hover:border-gray-300'}`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <h4 className="text-2xl font-black text-gray-900 tracking-tighter mt-1">{stat.count}</h4>
          </button>
        ))}
      </div>

      {/* Tabs & Search */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-4 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
        <div className="flex p-1 bg-gray-50 rounded-2xl w-full md:w-auto">
          {['All', 'Unverified', 'Issues'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-[#000613] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative flex-1 w-full max-w-lg group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#000613] transition-colors"><Search size={18} /></div>
          <input type="text" placeholder="Search by name, email, or course..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-11 pr-4 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-[#000613] focus:ring-4 focus:ring-[#000613]/5 transition-all" />
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-4 lg:p-6 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <ListSkeleton hideHeader={true} rows={8} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="bg-gray-50/50">
                <th className="px-6 py-4 w-12 text-center">
                   <input 
                     type="checkbox"
                     checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                     onChange={toggleSelectAll}
                     className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                   />
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Information</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Course / Branch</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Score</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Skills Matrix</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Control</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className={`hover:bg-gray-50/50 transition-colors group ${selectedIds.includes(student._id) ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox"
                        checked={selectedIds.includes(student._id)}
                        onChange={() => toggleSelect(student._id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-xl bg-gray-100 group-hover:scale-110 transition-transform shadow-sm" /><div><p className="text-sm font-black text-gray-900 leading-tight uppercase tracking-tight">{student.name}</p><p className="text-[10px] font-bold text-gray-400 mt-0.5">{student.email}</p></div></div></td>
                    <td className="px-6 py-4"><p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{student.course}</p><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{student.branch}</p></td>
                    <td className="px-6 py-4 text-sm font-black text-gray-900 text-center italic">{student.cgpa}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap gap-1.5">{student.skills.slice(0, 3).map((skill: string) => (<span key={skill} className="px-2 py-0.5 bg-gray-50 border border-gray-100 text-[9px] font-black text-gray-500 rounded uppercase tracking-tighter">{skill}</span>))} {student.skills.length > 3 && <span className="text-[9px] font-black text-gray-300">+{student.skills.length-3}</span>}</div>
                        {student.issues.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {student.issues.map((issue: string) => (
                              <span key={issue} className="text-[7px] font-black text-rose-500 uppercase tracking-widest border-b border-rose-200">{issue}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest italic ${student.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>{student.status}</span>
                        {student.academicVerified ? (
                          <div className="flex items-center gap-1 text-[8px] font-black text-blue-600 uppercase tracking-tighter">
                            <ShieldCheck size={10} /> Verified
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[8px] font-black text-rose-500 uppercase tracking-tighter animate-pulse">
                            <AlertCircle size={10} /> Needs Verification
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                        {student.status === 'Pending' ? (<><button onClick={() => handleVerify(student._id, true)} title="Approve" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Check size={16} /></button></>) : (<button onClick={() => handleVerify(student._id, false)} title="Deactivate" className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><XCircle size={16} /></button>)}
                        <button onClick={() => { setSelectedStudent(student); setIsViewModalOpen(true); }} title="View Profile" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={16} /></button>
                        <button onClick={() => openEditModal(student)} title="Edit" className="p-1.5 text-blue-900 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="p-0">
                      <EmptyState 
                        icon={Search}
                        title={searchQuery ? "No Matches Found" : "No Students Registered"}
                        description={searchQuery 
                          ? `We couldn't find any students matching "${searchQuery}".` 
                          : "The student database is currently empty. Start growing the community!"}
                        actionText={searchQuery ? "Clear Search" : "Add Student"}
                        onAction={() => searchQuery ? setSearchQuery('') : setIsAddModalOpen(true)}
                        className="py-12"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center text-xs font-bold text-gray-400 tracking-widest uppercase italic"><p>Showing {filteredStudents.length} of {students.length} units</p></div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#000613] text-white px-8 py-5 rounded-[24px] shadow-2xl flex items-center gap-10 z-[80] animate-in slide-in-from-bottom-10 duration-500 border border-white/10 group">
          <div className="flex items-center gap-3 pr-8 border-r border-white/10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-sm shadow-inner shadow-blue-500/50">{selectedIds.length}</div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400">Selected</span>
              <span className="text-[9px] font-bold text-gray-400 italic">Cohort active</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-px bg-white/10 mx-2" />
            <button 
              onClick={() => handleBulkAcademicVerify(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              <ShieldCheck size={16} /> Academic Verify
            </button>
            <button 
              onClick={() => handleBulkStatusUpdate(true, 'active')}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle size={16} /> Activate
            </button>
            <button 
              onClick={() => setIsEmailModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-black/20"
            >
              <Mail size={16} /> Email
            </button>
          </div>
          <button 
            onClick={() => setSelectedIds([])}
            className="p-2 text-gray-400 hover:text-white transition-colors ml-4"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Bottom Utility Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#001730] rounded-[2rem] p-8 relative overflow-hidden group border border-white/5 shadow-2xl">
          <div className="absolute top-6 right-6 text-[10px] font-black text-blue-400/40 uppercase tracking-[0.2em] border border-blue-400/20 px-3 py-1 rounded-full bg-blue-500/5">Critical Queue</div>
          <div className="relative z-10 flex flex-col justify-between h-full"><div><div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blue-300 mb-8 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500"><AlertCircle size={28} /></div><h3 className="text-6xl font-black text-white mb-3 tracking-tighter tabular-nums">{students.filter(s => s.status === 'Pending').length}</h3><p className="text-[12px] font-black text-blue-200/40 uppercase tracking-[0.4em] italic">Pending Verifications</p></div></div>
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700"></div>
        </div>
        <div className="bg-white border border-gray-100 rounded-[2rem] p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="relative z-10"><h3 className="text-2xl font-black text-[#000613] tracking-tighter mb-3 uppercase tracking-tighter">Automated <span className="text-blue-600">Sync</span></h3><p className="text-sm text-gray-400 font-bold leading-relaxed mb-10 max-w-xs">Run the strategic batch script to cross-check local student records with university master data for instantaneous verification.</p>
            <button onClick={handleRunBatchVerification} disabled={loading} className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gray-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-95 group/run disabled:opacity-50 shadow-xl shadow-black/10"><ShieldCheck size={20} className="text-emerald-400" />{loading ? 'Processing System...' : 'Initiate Batch Protocol'}<ArrowRight size={16} className="group-hover/run:translate-x-1 transition-transform ml-2" /></button>
          </div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gray-50 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
        </div>
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase tracking-tighter">Bulk <span className="text-blue-600">Import</span></h3>
                  <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest italic">Protocol CSV-24 Alpha</p>
                </div>
                <button onClick={() => { setIsImportModalOpen(false); setImportFile(null); }} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} /></button>
              </div>

              <div className="space-y-6">
                <div 
                  className={`border-2 border-dashed rounded-[2rem] p-10 text-center transition-all ${importFile ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-100 bg-gray-50/50 hover:border-blue-200 hover:bg-blue-50/50'}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file && file.name.endsWith('.csv')) setImportFile(file);
                  }}
                >
                  <label className="cursor-pointer">
                    <input 
                      type="file" 
                      accept=".csv" 
                      className="hidden" 
                      onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    />
                    <div className="flex flex-col items-center gap-4">
                      {importFile ? (
                        <>
                          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner"><FileSpreadsheet size={32} /></div>
                          <div>
                            <p className="text-sm font-black text-gray-900">{importFile.name}</p>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Ready for ingestion</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100"><Upload size={32} /></div>
                          <div>
                            <p className="text-sm font-black text-gray-900">Select Strategy File</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Drag & drop .csv here or click</p>
                          </div>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><FileText size={12} /> Format Requirements</h4>
                  <ul className="text-[10px] font-bold text-gray-600 space-y-1.5 list-disc pl-4 italic">
                    <li>Required headers: <span className="text-blue-600">name, email</span></li>
                    <li>Optional: <span className="text-gray-400 italic font-medium">course, branch, passingYear, cgpa</span></li>
                    <li>Existing emails will be skipped by default.</li>
                  </ul>
                </div>

                <button 
                  onClick={handleImportStudents}
                  disabled={!importFile || submitting}
                  className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-[#000613] text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-black/20 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {submitting ? 'Executing Bulk Operation...' : 'Initiate Import Protocol'}
                </button>
              </div>
            </div>
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-center">
               <a href="#" onClick={(e) => {
                 e.preventDefault();
                 const content = "name,email,course,branch,passingYear,cgpa\nJohn Doe,john@example.com,B.Tech,CSE,2025,8.5";
                 const blob = new Blob([content], { type: 'text/csv' });
                 const url = window.URL.createObjectURL(blob);
                 const link = document.createElement('a');
                 link.href = url;
                 link.setAttribute('download', 'student_import_template.csv');
                 link.click();
               }} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4 decoration-blue-200 flex items-center gap-2">
                 <Download size={14} /> Download Template Strategy
               </a>
            </div>
          </div>
        </div>
      )}

      <StudentFormModal isOpen={isAddModalOpen || isEditModalOpen} isEdit={isEditModalOpen} formData={formData} submitting={submitting} onFormChange={(u) => setFormData(p => ({...p, ...u}))} onSubmit={isAddModalOpen ? handleCreateStudent : handleUpdateStudent} onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} />
      <StudentViewModal isOpen={isViewModalOpen} student={selectedStudent} onClose={() => setIsViewModalOpen(false)} onEdit={openEditModal} />
      <BulkEmailModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} onSubmit={handleBulkEmail} selectedCount={selectedIds.length} submitting={submitting} />
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(p => ({ ...p, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        icon={confirmState.icon}
      />
    </div>
  );
};

export default ManageStudents;
