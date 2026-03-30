import React, { useState, useEffect } from 'react';
import { 
  Search, Eye, Check, X, 
  Edit2, AlertCircle,
  ShieldCheck, ArrowRight, UserPlus, Loader2
} from 'lucide-react';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { 
  X as CloseIcon, 
  User, 
  Mail, 
  BookOpen, 
  ClipboardCheck,
} from 'lucide-react';

const ManageStudents: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    course: 'BCA',
    branch: 'Computer Science',
    cgpa: ''
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      const filtered = data
        .filter((u: any) => u.role === 'student')
        .map((u: any) => ({
          _id: u._id,
          name: u.name,
          email: u.email,
          course: u.profile?.course || u.profile?.studentDetails?.course || 'N/A',
          branch: u.profile?.department || u.profile?.studentDetails?.branch || 'N/A',
          cgpa: u.profile?.current_cgpa || u.profile?.studentDetails?.cgpa || '0.0',
          skills: u.profile?.skills || u.profile?.studentDetails?.skills || [],
          regDate: new Date(u.createdAt).toLocaleDateString(),
          status: u.isVerified ? 'Approved' : 'Pending',
          avatar: u.profilePhoto || u.profile?.profile_photo || u.profile?.profilePhoto || u.profile?.studentDetails?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`,
          original: u // Keep for editing
        }));
      setStudents(filtered);
    } catch (err: any) {
      console.error(err);
      showError('Failed to fetch students', 'Fetch Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleVerify = async (id: string, isVerified: boolean) => {
    try {
      await api.patch(`/admin/users/${id}/verify`, { isVerified });
      fetchStudents();
      showSuccess(`Student ${isVerified ? 'verified' : 'unverified'} successfully!`, 'Update Status');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update student status', 'Update Error');
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/admin/students', formData);
      showSuccess('Student account created successfully!', 'Success');
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', password: '', course: 'BCA', branch: 'Computer Science', cgpa: '' });
      fetchStudents();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to create student', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.patch(`/admin/users/${selectedStudent._id}/verify`, {
        name: formData.name,
        course: formData.course,
        cgpa: formData.cgpa
      });
      showSuccess('Student profile updated successfully!', 'Update Success');
      setIsEditModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update student', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRunBatchVerification = async () => {
    try {
      setLoading(true);
      const { data } = await api.post('/admin/verify-batch');
      showSuccess(data.message, 'Batch Complete');
      fetchStudents();
    } catch (err: any) {
      showError('Failed to run verification batch', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (student: any) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      password: '', // Don't show password
      course: student.course,
      branch: student.branch,
      cgpa: student.cgpa
    });
    setIsEditModalOpen(true);
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">Manage Students</h1>
          <p className="text-sm text-gray-500 font-bold mt-1">Review, approve, and manage the student database for placements.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: '', email: '', password: '', course: 'BCA', branch: 'Computer Science', cgpa: '' });
            setIsAddModalOpen(true);
          }}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#000613] text-white rounded-xl font-bold text-sm shadow-lg shadow-black/10 hover:scale-105 transition-all"
        >
          <UserPlus size={18} />
          Add New Student
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="relative flex-1 w-full max-w-lg group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#000613] transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-11 pr-4 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-[#000613] focus:ring-4 focus:ring-[#000613]/5 transition-all"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex py-40 items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Course</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">CGPA</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Skills</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reg. Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={student.avatar} alt={student.name} className="w-9 h-9 rounded-full bg-gray-100 group-hover:scale-110 transition-transform" />
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-tight">{student.name}</p>
                          <p className="text-[10px] font-bold text-gray-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-600">{student.course}</td>
                    <td className="px-6 py-4 text-sm font-black text-gray-900 text-center">{student.cgpa}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {student.skills.map((skill: string) => (
                          <span key={skill} className="px-2 py-0.5 bg-gray-100 text-[9px] font-black text-gray-500 rounded uppercase tracking-wider">{skill}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-400 whitespace-nowrap">{student.regDate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        student.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        'bg-orange-50 text-orange-600 border border-orange-100'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        {student.status === 'Pending' ? (
                          <>
                            <button 
                              onClick={() => handleVerify(student._id, true)}
                              title="Approve" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Check size={16} /></button>
                            <button 
                              onClick={() => handleVerify(student._id, false)}
                              title="Reject" className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><X size={16} /></button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleVerify(student._id, false)}
                            title="Revoke Approval" className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-all"><X size={16} /></button>
                        )}
                        <button 
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsViewModalOpen(true);
                          }}
                          title="View Profile" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={16} /></button>
                        <button 
                          onClick={() => openEditModal(student)}
                          title="Edit" className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center font-bold text-gray-400">No students found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer Placeholder */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center text-xs font-bold text-gray-400">
          <p>Showing {filteredStudents.length} records</p>
        </div>
      </div>

      {/* Bottom Utility Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#001730] rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-4 right-4 text-[10px] font-black text-blue-400/40 uppercase tracking-[0.2em] border border-blue-400/20 px-2 py-0.5 rounded">Priority</div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-blue-300 mb-6 border border-white/10 shadow-inner">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-4xl font-black text-white mb-2 tracking-tight">
                {students.filter(s => s.status === 'Pending').length}
              </h3>
              <p className="text-sm font-bold text-blue-200/60 uppercase tracking-widest">Pending Verifications</p>
            </div>
          </div>
          {/* Decorative Gradient Overlay */}
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-2">Automated Data Verification</h3>
            <p className="text-sm text-gray-500 font-bold leading-relaxed mb-6">
              Run the batch script to cross-check records with university records.
            </p>
            <button 
              onClick={handleRunBatchVerification}
              disabled={loading}
              className="flex items-center gap-2.5 px-6 py-3 bg-gray-50 border border-gray-100 text-gray-900 rounded-xl font-black text-xs hover:bg-gray-100 transition-all active:scale-95 group/run disabled:opacity-50"
            >
              <ShieldCheck size={18} className="text-emerald-500" />
              {loading ? 'Processing...' : 'Run Verification Script'}
              <ArrowRight size={14} className="group-hover/run:translate-x-1 transition-transform ml-2" />
            </button>
          </div>
        </div>
      </div>
      {/* Add/Edit Student Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}></div>
          <div className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{isAddModalOpen ? 'Add New Student' : 'Edit Student'}</h3>
                  <p className="text-sm text-gray-500 font-bold">Fill in the details for the student account.</p>
                </div>
                <button 
                  onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                  <CloseIcon size={20} />
                </button>
              </div>

              <form onSubmit={isAddModalOpen ? handleCreateStudent : handleUpdateStudent} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Aditya Halder"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:bg-white focus:border-black outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        required
                        disabled={isEditModalOpen}
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="aditya@tnu.in"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:bg-white focus:border-black outline-none transition-all disabled:opacity-50" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Course</label>
                    <div className="relative group">
                      <BookOpen size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select 
                        value={formData.course}
                        onChange={(e) => setFormData({...formData, course: e.target.value})}
                        className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:bg-white focus:border-black outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option>BCA</option>
                        <option>B.Tech CS</option>
                        <option>B.Tech ME</option>
                        <option>MCA</option>
                        <option>MBA</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CGPA</label>
                    <div className="relative group">
                      <ClipboardCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="number"
                        step="0.01" 
                        value={formData.cgpa}
                        onChange={(e) => setFormData({...formData, cgpa: e.target.value})}
                        placeholder="8.5"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:bg-white focus:border-black outline-none transition-all" 
                      />
                    </div>
                  </div>
                </div>

                {isAddModalOpen && (
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Temporary Password</label>
                    <input 
                      type="text" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Default: Password@123"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:bg-white focus:border-black outline-none transition-all shadow-inner" 
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-[#000613] text-white rounded-xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-black/10 flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                    {isAddModalOpen ? 'Create Student' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {isViewModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <img src={selectedStudent.avatar} className="w-16 h-16 rounded-2xl bg-gray-100 object-cover" />
                  <div>
                    <h3 className="text-xl font-black text-gray-900 leading-tight">{selectedStudent.name}</h3>
                    <p className="text-sm font-bold text-gray-400">{selectedStudent.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                  <CloseIcon size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                  <p className={`text-sm font-black uppercase ${selectedStudent.status === 'Approved' ? 'text-emerald-600' : 'text-orange-500'}`}>
                    {selectedStudent.status}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Course</p>
                  <p className="text-sm font-black text-gray-900">{selectedStudent.course}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current CGPA</p>
                  <p className="text-sm font-black text-gray-900">{selectedStudent.cgpa}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Registration</p>
                  <p className="text-sm font-black text-gray-900">{selectedStudent.regDate}</p>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Key Skills</p>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.skills.length > 0 ? selectedStudent.skills.map((s: string) => (
                    <span key={s} className="px-3 py-1.5 bg-gray-100 text-[10px] font-black text-gray-500 rounded-xl uppercase tracking-widest border border-gray-200">{s}</span>
                  )) : (
                    <p className="text-sm font-bold text-gray-400 italic">No skills listed yet.</p>
                  )}
                </div>
              </div>

              <button 
                onClick={() => { setIsViewModalOpen(false); openEditModal(selectedStudent); }}
                className="w-full py-4 bg-[#000613] text-white rounded-2xl font-black text-sm shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Modify Student Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
