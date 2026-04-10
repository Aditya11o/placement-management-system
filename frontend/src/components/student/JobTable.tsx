import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Loader2, Bookmark, BookmarkCheck } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface JobTableProps {
  initialJobs?: any[];
}

const JobTable: React.FC<JobTableProps> = ({ initialJobs = [] }) => {
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(initialJobs);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState<string | null>(null);

  useEffect(() => {
    if (initialJobs.length > 0) {
      setJobs(initialJobs);
    }
  }, [initialJobs]);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const response = await api.get('/students/watchlist');
        setWatchlistIds(response.data.map((j: any) => j.id || j._id));
      } catch (err) {
        console.error('Failed to fetch watchlist');
      }
    };
    fetchWatchlist();
  }, []);

  const handleApply = async (jobId: string) => {
    try {
      setLoading(true);
      await api.post(`/applications/${jobId}`);
      setAppliedJobIds([...appliedJobIds, jobId]);
      showSuccess('Application submitted successfully');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to apply for this job', 'Application Error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWatchlist = async (jobId: string) => {
    try {
      setWatchlistLoading(jobId);
      const res = await api.post(`/students/watchlist/${jobId}`);
      if (res.data.isWatchlisted) {
        setWatchlistIds([...watchlistIds, jobId]);
        showSuccess('Added to watchlist');
      } else {
        setWatchlistIds(watchlistIds.filter(id => id !== jobId));
        showSuccess('Removed from watchlist');
      }
    } catch (error: any) {
      showError('Failed to update watchlist');
    } finally {
      setWatchlistLoading(null);
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h3 className="text-[13px] font-black text-on-surface tracking-tight italic uppercase">
            Recent <span className="text-surface-tint">Openings</span>
          </h3>
          <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest leading-none mt-0.5">Your personalized match listing</p>
        </div>
        <button 
          onClick={() => navigate('/student/jobs')}
          className="px-4 py-2 bg-surface-container text-on-surface-variant font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-primary/10 hover:text-primary transition-all border border-outline-variant/50"
        >
          Explore All
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden w-full transition-all hover:shadow-xl">
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant/50 text-[10px] font-black uppercase tracking-widest border-b border-outline-variant/30">
                <th scope="col" className="px-6 py-4">Company</th>
                <th scope="col" className="px-6 py-4">Position</th>
                <th scope="col" className="px-6 py-4">Location</th>
                <th scope="col" className="px-6 py-4">Deadline</th>
                <th scope="col" className="px-6 py-4 text-center">Eligibility</th>
                <th scope="col" className="px-6 py-4 text-center">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {jobs.map((job: any) => {
                const jobId = job.id || job._id;
                const isApplied = appliedJobIds.includes(jobId);
                const isWatchlisted = watchlistIds.includes(jobId);
                
                return (
                  <tr key={job._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-surface-container group-hover:bg-surface-container-high transition-colors flex items-center justify-center font-black text-on-surface-variant/20 border border-outline-variant/30 shadow-sm overflow-hidden text-lg italic">
                          {job.companyName?.[0] || 'J'}
                        </div>
                        <span className="font-black text-on-surface italic tracking-tight uppercase truncate max-w-[120px]">
                          {job.companyName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-800 tracking-tight">{job.title}</span>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{job.salary}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">{job.location}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-black text-on-surface border border-outline-variant/50 px-2 py-1 rounded-lg bg-surface-container-low">
                        {new Date(job.deadline || job.last_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <button 
                        onClick={() => handleToggleWatchlist(jobId)}
                        disabled={watchlistLoading === jobId}
                        className={`p-2 rounded-xl transition-all ${
                          isWatchlisted 
                            ? 'bg-amber-50 text-amber-500 border border-amber-100' 
                            : 'bg-slate-50 text-slate-300 hover:text-blue-500 hover:bg-blue-50 border border-transparent'
                        }`}
                       >
                         {watchlistLoading === jobId ? <Loader2 className="w-4 h-4 animate-spin" /> : (isWatchlisted ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />)}
                       </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleApply(jobId)}
                        disabled={isApplied || loading}
                        className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          isApplied || loading
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed italic' 
                            : 'bg-slate-900 text-white hover:bg-blue-600 shadow-md hover:shadow-blue-200 -rotate-2 hover:rotate-0'
                        }`}
                      >
                        {loading && !isApplied ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : (isApplied ? 'Success' : 'Secure Role')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobTable;
