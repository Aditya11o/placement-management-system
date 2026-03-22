import React, { useState } from 'react';
import { 
  Users, Search, Filter, FileText, 
  CheckCircle2, XCircle, Clock, 
  Mail, Phone, GraduationCap, 
  ChevronLeft, ChevronRight, MoreHorizontal,
  Download, Calendar, UserCheck, Play
} from 'lucide-react';

const Applicants: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const sampleApplicants = [
    {
      id: 1,
      name: 'Arjun Mehta',
      appliedAt: '2 days ago',
      email: 'arjun.m@university.edu',
      phone: '+91 98765 43210',
      degree: 'B.Tech',
      branch: 'CS',
      cgpa: '9.2',
      skills: ['React', 'TypeScript'],
      resume: 'RESUME_ARJUN.PDF',
      status: 'Applied',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      appliedAt: '4 days ago',
      email: 'priya.sharma@edu.in',
      phone: '+91 88223 11445',
      degree: 'M.Tech',
      branch: 'AI',
      cgpa: '8.8',
      skills: ['Python', 'AWS'],
      resume: 'PRIYA_CV_FINAL.PDF',
      status: 'Shortlisted',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'
    },
    {
      id: 3,
      name: 'Rohan Verma',
      appliedAt: '1 week ago',
      email: 'rohan.v@campus.org',
      phone: '+91 77334 22110',
      degree: 'B.Tech',
      branch: 'IT',
      cgpa: '7.2',
      skills: ['Java'],
      resume: 'RESUME_ROHAN.PDF',
      status: 'Rejected',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Applied':
        return <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-black uppercase tracking-widest">Applied</span>;
      case 'Shortlisted':
        return <span className="px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 rounded text-[9px] font-black uppercase tracking-widest">Shortlisted</span>;
      case 'Rejected':
        return <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded text-[9px] font-black uppercase tracking-widest">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
            <span>Portal</span>
            <span className="opacity-40">/</span>
            <span className="text-gray-900">Applicant Management</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Applicant Management</h1>
          <p className="text-gray-500 text-[14px] mt-2 max-w-2xl">
            Review, filter, and track candidates across your active job postings. Use the global actions to advance candidates in the pipeline.
          </p>
        </div>
        <button className="px-8 py-3.5 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center gap-3 active:scale-95">
          <Play size={14} className="fill-white" />
          Move Shortlisted to Interview
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-12 gap-6 items-end">
          
          <div className="col-span-12 md:col-span-4 space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Job Posting</label>
            <select className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-[13px] text-gray-900 focus:outline-none transition-all appearance-none cursor-pointer">
              <option>Senior Software Engineer (Frontend)</option>
              <option>Data Analyst Intern</option>
              <option>UX Designer</option>
            </select>
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Search Candidates</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by name, skills or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-[13px] text-gray-900 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Filter</label>
            <div className="flex p-1 bg-gray-100 rounded-xl">
              {['All', 'Applied', 'Shortlisted'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-[13px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Academic Detail</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Skills & Resume</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sampleApplicants.map((applicant) => (
                <tr key={applicant.id} className="hover:bg-gray-50/50 transition-colors group">
                  
                  {/* Student Name */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full border border-gray-200 p-0.5 overflow-hidden flex-shrink-0">
                        <img src={applicant.photo} alt={applicant.name} className="w-full h-full rounded-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900 tracking-tight text-[14px]">{applicant.name}</span>
                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          Applied {applicant.appliedAt}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-600 font-bold">
                        <Mail size={12} className="text-gray-300" />
                        {applicant.email}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 font-medium text-[11px]">
                        <Phone size={12} className="text-gray-300" />
                        {applicant.phone}
                      </div>
                    </div>
                  </td>

                  {/* Academic Detail */}
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="text-gray-900 font-black tracking-tight flex items-center gap-2">
                        {applicant.degree} {applicant.branch}
                      </div>
                      <div className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-wide">
                        CGPA: <span className="text-gray-900 font-black">{applicant.cgpa}</span>
                      </div>
                    </div>
                  </td>

                  {/* Skills & Resume */}
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {applicant.skills.map(skill => (
                          <span key={skill} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded text-[9px] font-black uppercase tracking-tighter border border-gray-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <a href="#" className="flex items-center gap-1.5 text-gray-900 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors">
                        <FileText size={12} className="text-gray-400" />
                        {applicant.resume}
                      </a>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5">
                    {getStatusBadge(applicant.status)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-3">
                      {applicant.status === 'Applied' && (
                        <>
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100" title="Shortlist">
                            <CheckCircle2 size={18} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100" title="Reject">
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      {applicant.status === 'Shortlisted' && (
                        <button className="px-4 py-2 bg-[#000613] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap">
                          Schedule Interview
                        </button>
                      )}
                      {applicant.status === 'Rejected' && (
                        <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest pointer-events-none">
                          View Feedback
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[12px] font-bold text-gray-400">
            Showing <span className="text-gray-900">1 to 10</span> of <span className="text-gray-900">124</span> applicants
          </p>
          <div className="flex items-center gap-1">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <ChevronLeft size={16} />
            </button>
            {[1, 2, 3].map(page => (
              <button 
                key={page}
                className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all ${
                  page === 1 ? 'bg-gray-900 text-white shadow-lg shadow-black/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Applicants;
