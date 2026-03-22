import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, 
  Trash2, MapPin,
  TrendingUp, Clock, Loader2
} from 'lucide-react';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

const ManageJobs: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/jobs/admin');
      const mapped = data.map((job: any) => ({
        _id: job._id,
        title: job.title,
        company: job.companyName || job.recruiter?.name || 'N/A',
        location: job.location,
        role: job.jobType,
        type: job.jobType,
        compensation: job.salary,
        postedDate: new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        deadline: new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        applicants: job.applicantCount || 0,
        status: job.status.charAt(0).toUpperCase() + job.status.slice(1),
        rawStatus: job.status
      }));
      setJobs(mapped);
    } catch (err: any) {
      console.error(err);
      showError('Failed to fetch job postings', 'Fetch Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/jobs/${id}/status`, { status });
      fetchJobs();
      showSuccess(`Job status updated to ${status} successfully!`, 'Update Success');
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to update job status', 'Update Error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      fetchJobs();
      showSuccess('Job deleted successfully!', 'Delete Success');
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to delete job', 'Delete Error');
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-start pt-2">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Manage Institutional Jobs</h1>
          <p className="text-sm text-gray-500 font-bold mt-1 max-w-2xl leading-relaxed italic">
            Review, curate, and manage employment opportunities submitted by partner recruiters.
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
            placeholder="Search by title, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-11 pr-4 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-[#000613] focus:ring-4 focus:ring-[#000613]/5 transition-all"
          />
        </div>
      </div>

      {/* Jobs Table */}
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
                {filteredJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50/50 transition-colors group">
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
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
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
                        <p className="text-[10px] font-bold text-rose-500">Deadline: <span className="font-black underline underline-offset-2">{job.deadline}</span></p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-black text-gray-900">{job.applicants}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        job.rawStatus === 'open' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        job.rawStatus === 'pending' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                        job.rawStatus === 'rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                        {job.rawStatus === 'open' && (
                          <button 
                            onClick={() => handleStatus(job._id, 'closed')}
                            title="Close Job" className="px-3 py-1 border border-gray-200 text-gray-600 text-[10px] font-black rounded-lg hover:bg-gray-50 transition-all">CLOSE</button>
                        )}
                        {job.rawStatus === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleStatus(job._id, 'open')}
                              className="px-3 py-1 bg-[#000613] text-white text-[10px] font-black rounded-lg hover:bg-emerald-600 transition-all">APPROVE</button>
                            <button 
                              onClick={() => handleStatus(job._id, 'rejected')}
                              className="px-3 py-1 border border-rose-200 text-rose-600 text-[10px] font-black rounded-lg hover:bg-rose-50 transition-all">REJECT</button>
                          </>
                        )}
                        {(job.rawStatus === 'closed' || job.rawStatus === 'rejected') && (
                          <button 
                            onClick={() => handleStatus(job._id, 'open')}
                            className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg hover:bg-emerald-100 transition-all">REOPEN</button>
                        )}
                        <button 
                          onClick={() => handleDelete(job._id)}
                          title="Delete" className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredJobs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center font-bold text-gray-400">No job postings found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#001730] rounded-2xl p-6 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-blue-200/40 uppercase tracking-widest mb-1 font-bold">Active Roles</p>
            <h3 className="text-4xl font-black text-white mb-2 tracking-tighter">
              {jobs.filter(j => j.rawStatus === 'open').length}
            </h3>
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
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter">
                {jobs.filter(j => j.rawStatus === 'pending').length}
              </h3>
            </div>
            <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-all">
              <Clock size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageJobs;
