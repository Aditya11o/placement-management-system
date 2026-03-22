import React, { useState } from 'react';
import { 
  Users, Search, Filter, Plus, 
  MoreVertical, Eye, Check, X, 
  Edit2, Trash2, Download, 
  ChevronLeft, ChevronRight, AlertCircle,
  ShieldCheck, ArrowRight, UserPlus
} from 'lucide-react';

const ManageStudents: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const students = [
    {
      id: 1,
      name: 'Alex Rivera',
      email: 'alex.r@univ.edu',
      course: 'B.Tech CSE',
      cgpa: '9.20',
      skills: ['REACT', 'NODE'],
      regDate: 'Oct 12, 2023',
      status: 'Approved',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya.s@univ.edu',
      course: 'MCA',
      cgpa: '8.85',
      skills: ['PYTHON', 'AWS'],
      regDate: 'Oct 14, 2023',
      status: 'Pending',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    },
    {
      id: 3,
      name: 'Marcus Thompson',
      email: 'm.thompson@univ.edu',
      course: 'BCA',
      cgpa: '7.20',
      skills: ['JAVA', 'MYSQL'],
      regDate: 'Oct 15, 2023',
      status: 'Rejected',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    },
    {
      id: 4,
      name: 'Chloe Chen',
      email: 'chloe.c@univ.edu',
      course: 'B.Tech IT',
      cgpa: '9.55',
      skills: ['GO', 'DOCKER', 'KUBERNETES'],
      regDate: 'Oct 16, 2023',
      status: 'Approved',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Manage Students</h1>
          <p className="text-sm text-gray-500 font-bold mt-1">Review, approve, and manage the student database for placements.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#000613] text-white rounded-xl font-bold text-sm shadow-lg shadow-black/10 hover:scale-105 transition-all">
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
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-black text-gray-600 outline-none hover:bg-white transition-all appearance-none cursor-pointer"
          >
            <option>All Courses</option>
            <option>B.Tech CSE</option>
            <option>MCA</option>
            <option>BCA</option>
            <option>B.Tech IT</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-black text-gray-600 outline-none hover:bg-white transition-all appearance-none cursor-pointer"
          >
            <option>All Statuses</option>
            <option>Approved</option>
            <option>Pending</option>
            <option>Rejected</option>
          </select>
          <button className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:text-[#000613] hover:bg-white transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Course</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">CGPA</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Skills</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Resume</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reg. Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
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
                      {student.skills.map((skill) => (
                        <span key={skill} className="px-2 py-0.5 bg-gray-100 text-[9px] font-black text-gray-500 rounded uppercase tracking-wider">{skill}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-1.5 bg-gray-50 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                      <Download size={16} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-400 whitespace-nowrap">{student.regDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      student.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      student.status === 'Pending' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                      'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      {student.status === 'Pending' ? (
                        <>
                          <button title="Approve" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Check size={16} /></button>
                          <button title="Reject" className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><X size={16} /></button>
                        </>
                      ) : (
                        <button title="View Profile" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={16} /></button>
                      )}
                      <button title="Edit" className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                      <button title="Delete" className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center">
          <p className="text-[11px] font-bold text-gray-400">Showing <span className="text-gray-900">1 to 4</span> of <span className="text-gray-900">128</span> students</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"><ChevronLeft size={18} /></button>
            <button className="w-8 h-8 rounded-lg bg-[#000613] text-white text-xs font-black shadow-lg shadow-black/10 flex items-center justify-center">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center transition-colors">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center transition-colors">3</button>
            <span className="text-gray-300 px-1">...</span>
            <button className="w-8 h-8 rounded-lg hover:bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center transition-colors">32</button>
            <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"><ChevronRight size={18} /></button>
          </div>
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
              <h3 className="text-4xl font-black text-white mb-2 tracking-tight">14</h3>
              <p className="text-sm font-bold text-blue-200/60 uppercase tracking-widest">Pending Verifications</p>
            </div>
            <div className="mt-8 flex justify-end">
              <button className="text-xs font-black text-white hover:text-blue-300 transition-colors flex items-center gap-2 group/btn">
                Review Queue <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          {/* Decorative Gradient Overlay */}
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-2">Automated Data Verification</h3>
            <p className="text-sm text-gray-500 font-bold leading-relaxed mb-6">
              Run the batch script to cross-check SGPA/CGPA with university database records for all newly registered students.
            </p>
            <button className="flex items-center gap-2.5 px-6 py-3 bg-gray-50 border border-gray-100 text-gray-900 rounded-xl font-black text-xs hover:bg-gray-100 transition-all active:scale-95 group/run">
              <ShieldCheck size={18} className="text-emerald-500" />
              Run Verification Script
              <ArrowRight size={14} className="group-hover/run:translate-x-1 transition-transform ml-2" />
            </button>
          </div>
          {/* Decorative Icon */}
          <div className="absolute bottom-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none grayscale">
             <ShieldCheck size={180} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageStudents;
