import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Loader2, Bookmark, BookmarkCheck, Briefcase } from 'lucide-react';
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

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden w-full transition-all hover:shadow-xl min-h-[450px] flex flex-col">
        {jobs.length > 0 ? (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job: any) => {
              const jobId = job.id || job._id;
              const isApplied = appliedJobIds.includes(jobId);
              const isWatchlisted = watchlistIds.includes(jobId);
              
              return (
                <div key={jobId} className="bg-white rounded-2xl border border-outline-variant/30 p-4 flex flex-col hover:shadow-md transition-all group overflow-hidden relative">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center font-black text-on-surface-variant/30 border border-outline-variant/30 italic">
                        {job.companyName?.[0] || 'J'}
                      </div>
                      <div>
                        <h4 className="font-black text-[13px] text-on-surface italic uppercase tracking-tight truncate max-w-[140px]">
                          {job.companyName}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                           <span className="text-[11px] font-bold text-slate-700 truncate max-w-[120px]">{job.title}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleToggleWatchlist(jobId)}
                      disabled={watchlistLoading === jobId}
                      className={`p-2 rounded-xl transition-all ${
                        isWatchlisted 
                          ? 'bg-amber-50 text-amber-500 border border-amber-100' 
                          : 'bg-slate-50 text-slate-300 hover:text-blue-500 hover:bg-blue-50 border border-transparent'
                      }`}
                    >
                      {watchlistLoading === jobId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (isWatchlisted ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />)}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-surface-container/30 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">Salary</span>
                      <span className="text-[10px] font-black text-blue-600 truncate">{job.salary || 'Competitive'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">Location</span>
                      <span className="text-[10px] font-bold text-slate-500 truncate">{job.location}</span>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-outline-variant/10">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">Deadline</span>
                      <span className="text-[10px] font-black text-on-surface">
                        {new Date(job.deadline || job.last_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleApply(jobId)}
                      disabled={isApplied || loading}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        isApplied || loading
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed italic' 
                          : 'bg-slate-900 text-white hover:bg-blue-600 shadow-sm'
                      }`}
                    >
                      {loading && !isApplied ? <Loader2 className="w-3 h-3 animate-spin" /> : (isApplied ? 'Success' : 'Secure Role')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-surface-container rounded-3xl flex items-center justify-center mb-4 border border-outline-variant/30">
               <Briefcase className="w-8 h-8 text-on-surface-variant/20" />
            </div>
            <h4 className="text-sm font-black text-on-surface uppercase tracking-tight italic">No Active Openings</h4>
            <p className="text-[11px] font-bold text-on-surface-variant/50 uppercase tracking-widest mt-1 max-w-[200px]">
              We'll notify you when new opportunities match your profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobTable;
