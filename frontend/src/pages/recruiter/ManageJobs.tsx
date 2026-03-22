import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, MapPin, 
  Edit3, Trash2,
  TrendingUp, Archive, MousePointer2, Loader2, Users
} from 'lucide-react';
import api from '../../api';

const ManageJobs: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs/my');
      setJobs(res.data);
    } catch (error) {
      console.error('Error fetching recruiter jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await api.delete(`/jobs/${id}`);
        setJobs(jobs.filter(j => j._id !== id));
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete job');
      }
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manage Jobs</h1>
          <p className="text-gray-500 text-[14px] mt-1">Overview and control center for all your active placements.</p>
        </div>
        <button 
          onClick={() => navigate('/recruiter/post-job')}
          className="px-6 py-3 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-black/10 flex items-center gap-2 active:scale-95"
        >
          <Plus size={16} />
          Post New Job
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by job title or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-[13px] text-gray-900 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-[13px]">
        {loading ? (
          <div className="flex py-20 items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Title & Role</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Job Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Salary / Stipend</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timeline</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Applicants</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900 tracking-tight text-[14px]">{job.title}</span>
                        <span className="text-[11px] font-bold text-gray-400 mt-0.5">{job.companyName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-gray-600 font-bold">
                        <MapPin size={14} className="text-gray-300" />
                        {job.location}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                        job.jobType === 'Internship' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {job.jobType}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center font-black text-gray-900 tracking-tight">
                      {job.salary}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                          <span className="uppercase tracking-widest opacity-60">Posted:</span>
                          <span className="text-gray-900 font-black">{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500">
                          <span className="uppercase tracking-widest opacity-60">Deadline:</span>
                          <span className="font-black underline decoration-2 underline-offset-2">{new Date(job.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <span className={`flex items-center gap-1.5 font-bold ${
                          job.status === 'open' ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            job.status === 'open' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
                          }`} />
                          {job.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-black text-gray-900 tracking-tight leading-none">{job.applicantCount}</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Total</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/recruiter/applicants?jobId=${job._id}`)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Applicants">
                          <Users size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all" title="Edit Job">
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(job._id)}
                          className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Delete Job">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredJobs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center font-bold text-gray-400">No jobs found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination placeholder */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-xs font-bold">
          <p>Showing {filteredJobs.length} results</p>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Insights Card */}
        <div className="col-span-12 lg:col-span-6 bg-[#000613] rounded-2xl p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-blue-500/20 transition-all duration-500" />
          <div className="relative z-10 flex flex-col h-full justify-between gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-blue-400 border border-white/5">
                <TrendingUp size={24} />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Recruitment Insights</h2>
              <p className="text-gray-400 text-[14px] leading-relaxed max-w-md">
                Your listings have received a <span className="text-blue-400 font-black">active</span> participation this month.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Card */}
        <div className="col-span-12 lg:col-span-6 bg-gray-100 rounded-2xl p-8 border border-gray-200 flex flex-col items-center text-center justify-center relative group min-h-[300px]">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-sm border border-gray-200 mb-6 group-hover:scale-110 transition-transform duration-500">
            <Archive size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-4">Quick Action: Bulk Close</h2>
          <p className="text-gray-500 text-[14px] leading-relaxed max-w-sm mb-8">
            Keep your dashboard clean and focused on active talent acquisition.
          </p>
          <div className="flex gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest items-center">
            <MousePointer2 size={12} />
            Keep your workspace organized
          </div>
        </div>

      </div>

    </div>
  );
};

export default ManageJobs;
