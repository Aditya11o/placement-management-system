import React, { useState } from 'react';
import { 
  Search, Filter, Plus, 
  Eye, Edit2, Trash2, MapPin,
  TrendingUp, Clock, RotateCcw,
  ChevronLeft, ChevronRight
} from 'lucide-react';

const ManageJobs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  const jobs = [
    {
      id: 1,
      title: 'Senior Software Engineer',
      company: 'TechNexus Solutions',
      location: 'San Francisco, CA',
      role: 'Full Stack Development',
      type: 'Full-time',
      compensation: '$145k - $180k',
      postedDate: 'Oct 12',
      deadline: 'Nov 05',
      deadlineColor: 'text-rose-500',
      applicants: 142,
      status: 'Approved',
    },
    {
      id: 2,
      title: 'Data Analyst Intern',
      company: 'Global FinMetrics',
      location: 'New York, NY',
      role: 'Business Intelligence',
      type: 'Internship',
      compensation: '$35 / hr',
      postedDate: 'Oct 18',
      deadline: 'Nov 20',
      deadlineColor: 'text-gray-500',
      applicants: 89,
      status: 'Pending',
    },
    {
      id: 3,
      title: 'Product Design Associate',
      company: 'Creative Edge Labs',
      location: 'Remote',
      role: 'UI/UX Research',
      type: 'Full-time',
      compensation: '$95k - $120k',
      postedDate: 'Sep 28',
      deadline: 'Oct 15',
      deadlineColor: 'text-gray-500',
      applicants: 312,
      status: 'Closed',
    },
    {
      id: 4,
      title: 'Marketing Strategist',
      company: 'Aura Media Group',
      location: 'Austin, TX',
      role: 'Digital Outreach',
      type: 'Full-time',
      compensation: '$85k - $110k',
      postedDate: 'Oct 20',
      deadline: 'Nov 30',
      deadlineColor: 'text-gray-500',
      applicants: 12,
      status: 'Rejected',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-start pt-2">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Manage Institutional Jobs</h1>
          <p className="text-sm text-gray-500 font-bold mt-1 max-w-2xl leading-relaxed italic">
            Review, curate, and manage employment opportunities submitted by partner recruiters for the upcoming placement cycle.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#000613] text-white rounded-xl font-bold text-sm shadow-lg shadow-black/10 hover:scale-105 transition-all">
          <Plus size={18} />
          Add New Job
        </button>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="relative flex-1 w-full max-w-lg group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#000613] transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by title, company, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-11 pr-4 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-[#000613] focus:ring-4 focus:ring-[#000613]/5 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Type</span>
            <select 
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-black text-gray-600 outline-none hover:bg-white transition-all appearance-none cursor-pointer"
            >
              <option>All Types</option>
              <option>Full-time</option>
              <option>Internship</option>
              <option>Contract</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-black text-gray-600 outline-none hover:bg-white transition-all appearance-none cursor-pointer"
            >
              <option>All Statuses</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Rejected</option>
              <option>Closed</option>
            </select>
          </div>
          <button className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:text-[#000613] hover:bg-white transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role & Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Compensation</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Deadlines</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Applicants</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-black text-gray-900 leading-tight mb-1">{job.title}</p>
                      <p className="text-xs font-bold text-gray-500 mb-1">{job.company}</p>
                      <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <MapPin size={10} />
                        {job.location}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-gray-700">{job.role}</p>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        job.type === 'Full-time' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                      }`}>
                        {job.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-gray-900 italic tracking-tight">{job.compensation}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400">Posted: <span className="text-gray-900">{job.postedDate}</span></p>
                      <p className={`text-[10px] font-bold ${job.deadlineColor}`}>Deadline: <span className="font-black underline underline-offset-2">{job.deadline}</span></p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-black text-gray-900">{job.applicants}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      job.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      job.status === 'Pending' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                      job.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                      'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                      {job.status === 'Approved' && (
                        <>
                          <button title="View" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={16} /></button>
                          <button title="Edit" className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                          <button title="Delete" className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                        </>
                      )}
                      {job.status === 'Pending' && (
                        <>
                          <button className="px-3 py-1 bg-[#000613] text-white text-[10px] font-black rounded-lg hover:bg-emerald-600 transition-all">APPROVE</button>
                          <button className="px-3 py-1 border border-rose-200 text-rose-600 text-[10px] font-black rounded-lg hover:bg-rose-50 transition-all">REJECT</button>
                        </>
                      )}
                      {job.status === 'Closed' && (
                        <>
                          <button title="View" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={16} /></button>
                          <button title="Reopen" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><RotateCcw size={16} /></button>
                        </>
                      )}
                      {job.status === 'Rejected' && (
                        <>
                          <button title="View" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={16} /></button>
                          <button title="Delete" className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center">
          <p className="text-[11px] font-bold text-gray-400">Showing <span className="text-gray-900 font-black">1 to 4</span> of <span className="text-gray-900 font-black">28</span> job postings</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"><ChevronLeft size={18} /></button>
            <button className="w-8 h-8 rounded-lg bg-[#000613] text-white text-xs font-black shadow-lg shadow-black/10 flex items-center justify-center">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center transition-colors">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center transition-colors">3</button>
            <span className="text-gray-300 px-1">...</span>
            <button className="w-8 h-8 rounded-lg hover:bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center transition-colors">7</button>
            <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      {/* Bottom Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#001730] rounded-2xl p-6 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-blue-200/40 uppercase tracking-widest mb-1 font-bold">Active Roles</p>
            <h3 className="text-4xl font-black text-white mb-2 tracking-tighter">1,204</h3>
          </div>
          <div className="absolute top-4 right-4 text-blue-400/20 group-hover:scale-110 transition-transform">
            <TrendingUp size={32} />
          </div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm group hover:border-[#000613]/10 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pending Reviews</p>
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter">28</h3>
            </div>
            <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-all">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm group hover:border-[#000613]/10 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg. Response Time</p>
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter">4.2 Days</h3>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <Zap size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom Icon for Dash as zap not imported
const Zap = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export default ManageJobs;
