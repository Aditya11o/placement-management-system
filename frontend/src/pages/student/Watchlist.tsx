import React from 'react';
import { 
  Briefcase, Bookmark, MapPin, DollarSign, 
  AlertCircle, FileText,
  ArrowRight
} from 'lucide-react';
import { useWatchlist } from '../../hooks/useWatchlist';
import ListSkeleton from '../../components/skeletons/ListSkeleton';
import EmptyState from '../../components/EmptyState';
import { useNavigate } from 'react-router-dom';

const Watchlist: React.FC = () => {
  const { watchlist, isLoading, toggleWatchlist } = useWatchlist();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30 group-hover:rotate-6 transition-transform">
              <Bookmark size={32} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">Your <span className="text-blue-600">Watchlist</span></h1>
              <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Never miss an opportunity you're tracking</p>
            </div>
          </div>
          <div className="flex gap-4 relative z-10">
             <div className="text-right">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Saved Jobs</p>
                <p className="text-3xl font-black text-blue-600 lora italic">{watchlist.length}</p>
             </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
      </div>

      {isLoading ? (
        <ListSkeleton rows={5} />
      ) : watchlist.length === 0 ? (
        <EmptyState 
          icon={Bookmark}
          title="Watchlist is Empty"
          description="You haven't saved any jobs yet. Browse the job feed to find opportunities that match your interests."
          actionText="Browse Job Feed"
          onAction={() => navigate('/student/jobs')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {watchlist.map((job: any) => (
            <div key={job._id} className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all relative group h-full overflow-hidden">
              {/* Match Score */}
              <div className="absolute top-0 right-0 p-6 flex flex-col items-end">
                <div className={`w-14 h-14 rounded-full border-4 ${
                  job.matchScore >= 80 ? 'border-emerald-500 text-emerald-600' : 
                  job.matchScore >= 50 ? 'border-amber-500 text-amber-600' : 'border-rose-500 text-rose-600'
                } flex items-center justify-center bg-white shadow-xl font-black text-xs relative group-hover:scale-110 transition-transform`}>
                  {job.matchScore}%
                </div>
              </div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-5">
                  <div className="w-16 h-16 rounded-2xl border-2 border-gray-50 p-2 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover:border-blue-100 transition-colors">
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400 font-extrabold text-lg uppercase italic group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                      {job.companyName?.[0] || 'C'}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-700 transition-colors uppercase tracking-tighter leading-tight">{job.title}</h3>
                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest mt-0.5">{job.companyName}</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleWatchlist(job._id)}
                  className="p-3 text-blue-600 bg-blue-50 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all group/btn"
                  title="Remove from watchlist"
                >
                  <Bookmark size={22} fill="currentColor" className="group-hover/btn:hidden" />
                  <AlertCircle size={22} className="hidden group-hover/btn:block animate-pulse" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-50/50 rounded-2xl p-5 border border-gray-50">
                <div className="flex items-center gap-3 text-gray-600">
                  <DollarSign size={16} className="text-blue-500" />
                  <p className="text-sm font-black text-gray-900 uppercase tracking-tighter">{job.salary || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin size={16} className="text-amber-500" />
                  <p className="text-sm font-bold text-gray-500">{job.location}</p>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <FileText size={16} className="text-emerald-500" />
                  <p className="text-sm font-bold text-gray-500 line-clamp-1">{job.requiredSkills?.[0] || 'General role'}</p>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Briefcase size={16} className="text-indigo-500" />
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${job.jobType === 'Internship' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{job.jobType}</span>
                </div>
              </div>

              <div className="mt-auto flex justify-between items-center pt-6 border-t border-gray-100">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Time Remaining</span>
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} className={new Date(job.deadline) < new Date(Date.now() + 3*24*60*60*1000) ? 'text-rose-500 animate-bounce' : 'text-gray-400'} />
                    <span className={`text-sm font-black ${new Date(job.deadline) < new Date(Date.now() + 3*24*60*60*1000) ? 'text-rose-600 font-black' : 'text-gray-900'}`}>
                        {new Date(job.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => navigate(`/student/jobs?id=${job._id}`)}
                    className="px-6 py-3 bg-blue-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center gap-2"
                  >
                    Apply Now <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
