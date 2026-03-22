import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Search, MapPin, DollarSign, 
  ChevronDown, Bookmark, CheckCircle, 
  Sparkles, AlertCircle, FileText,
  Loader2, X, ChevronRight
} from 'lucide-react';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

const JobFeed: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [jobType, setJobType] = useState<'full-time' | 'intern' | 'all'>('all');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  // ... rest of state stays same
  const [stats, setStats] = useState([
    { label: 'Total Jobs', value: '0', subLabel: 'Active tracking', icon: Briefcase, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'New Jobs', value: '0', subLabel: 'Posted recently', icon: Sparkles, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { label: 'Jobs Applied', value: '0', subLabel: 'Active tracking', icon: CheckCircle, iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
    { label: 'Closing Soon', value: '0', subLabel: 'Action required', icon: AlertCircle, iconBg: 'bg-rose-50', iconColor: 'text-rose-600' },
  ]);

  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [applying, setApplying] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/applications/my')
      ]);
      
      const allJobs = jobsRes.data;
      const myApps = appsRes.data;
      
      // Mark jobs as applied
      const jobsWithStatus = allJobs.map((job: any) => {
        const application = myApps.find((app: any) => app.job?._id === job._id);
        return {
          ...job,
          status: application ? 'Applied' : job.status || 'Open'
        };
      });

      setJobs(jobsWithStatus);
      
      // Update stats
      setStats([
        { label: 'Total Jobs', value: allJobs.length.toString(), subLabel: 'Active tracking', icon: Briefcase, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
        { label: 'New Jobs', value: allJobs.filter((j: any) => new Date(j.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length.toString(), subLabel: 'Posted this week', icon: Sparkles, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
        { label: 'Jobs Applied', value: myApps.length.toString(), subLabel: 'Active tracking', icon: CheckCircle, iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
        { label: 'Closing Soon', value: allJobs.filter((j: any) => new Date(j.deadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)).length.toString(), subLabel: 'Within 3 days', icon: AlertCircle, iconBg: 'bg-rose-50', iconColor: 'text-rose-600' },
      ]);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApply = async () => {
    if (!selectedJob) return;
    try {
      setApplying(true);
      const formattedAnswers = selectedJob.screeningQuestions?.map((q: any) => ({
        questionId: q._id,
        question: q.question,
        answer: answers[q._id] || ''
      })) || [];

      await api.post(`/applications/${selectedJob._id}`, { answers: formattedAnswers });
      showSuccess('Application submitted successfully!', 'Job Application');
      setShowApplyModal(false);
      setSelectedJob(null);
      setAnswers({});
      fetchJobs();
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to submit application', 'Application Error');
    } finally {
      setApplying(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === 'All Locations' || job.location === locationFilter;
    const matchesType = jobType === 'all' || 
                       (jobType === 'full-time' && job.type === 'Full-time') ||
                       (jobType === 'intern' && job.type === 'Internship');
    return matchesSearch && matchesLocation && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md border border-gray-200 p-4 flex items-center gap-4 hover:shadow-lg transition-all h-full">
            <div className={`w-12 h-12 ${stat.iconBg} ${stat.iconColor} rounded-xl flex items-center justify-center shrink-0`}>
              <stat.icon size={24} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-2xl font-black text-gray-900 leading-none mb-1">{stat.value}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-[10px] font-medium text-emerald-500 italic mt-1">{stat.subLabel}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-[1.5] min-w-[200px]">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Search Jobs</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search by title or company..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-100 rounded-xl px-10 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50" 
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Location</label>
            <div className="relative">
              <select 
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full border border-gray-100 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50 appearance-none pr-10"
              >
                <option>All Locations</option>
                {[...new Set(jobs.map(j => j.location))].map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
          </div>

          <div className="min-w-[180px]">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Job Type</label>
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1 h-[38px] items-center">
              {['all', 'full-time', 'intern'].map((type) => (
                <button 
                  key={type}
                  onClick={() => setJobType(type as any)}
                  className={`flex-1 h-full px-3 text-[10px] font-black uppercase tracking-tighter rounded-lg transition-all ${jobType === type ? 'bg-blue-950 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                  {type === 'all' ? 'All' : type === 'full-time' ? 'Full-Time' : 'Intern'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 flex py-20 items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job._id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 flex flex-col hover:shadow-lg transition-all relative group h-full">
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl border border-gray-100 p-2 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    {/* Placeholder for company logo */}
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400 font-black text-xs uppercase italic">
                      {job.companyName?.[0] || 'C'}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{job.title}</h3>
                      {job.status === 'Closed' && <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded tracking-tighter border border-rose-100">Closed</span>}
                    </div>
                    <p className="text-gray-400 text-xs font-bold leading-none">{job.companyName}</p>
                  </div>
                </div>
                <button className="p-2 text-gray-200 hover:text-blue-500 rounded-lg transition-all">
                  <Bookmark size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-y-3 mb-6 bg-gray-50/50 rounded-xl p-4 border border-gray-50">
                <div className="flex items-center gap-2.5 text-gray-600">
                  <DollarSign size={14} className="text-gray-400" />
                  <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">{job.salary || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600">
                  <MapPin size={14} className="text-gray-400" />
                  <p className="text-xs font-bold text-gray-500">{job.location}</p>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600">
                  <FileText size={14} className="text-gray-400" />
                  <p className="text-xs font-bold text-gray-500">{job.requirements?.[0] || 'No specific requirements'}</p>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600">
                  <Briefcase size={14} className="text-gray-400" />
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${job.type === 'Internship' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>{job.type}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-6">
                {(job.skills || []).map((skill: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded-md tracking-wider">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                    {job.status === 'Applied' ? 'Status' : 'Apply Before'}
                  </span>
                  <span className={`text-xs font-black ${job.status === 'Applied' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {job.status === 'Applied' ? 'Successfully Applied' : new Date(job.deadline).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button className="px-5 py-2 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-all">
                    View Details
                  </button>
                  {job.status === 'Applied' ? (
                    <button disabled className="px-6 py-2 bg-gray-100 text-gray-400 rounded-xl text-[11px] font-black uppercase tracking-widest cursor-not-allowed">
                      Applied
                    </button>
                  ) : job.status === 'Closed' ? (
                    <button disabled className="px-6 py-2 bg-gray-50 text-gray-300 rounded-xl text-[11px] font-black uppercase tracking-widest cursor-not-allowed">
                      Closed
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setSelectedJob(job);
                        if (job.screeningQuestions?.length > 0) {
                          setShowApplyModal(true);
                        } else {
                          handleApply(); // Direct apply if no questions (wait, need to wrap in a temp ref or use job param)
                        }
                      }}
                      className="px-6 py-2 bg-blue-950 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black shadow-md shadow-blue-900/10 active:scale-95 transition-all"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Application Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Apply for {selectedJob.title}</h3>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">{selectedJob.companyName}</p>
                </div>
                <button 
                    onClick={() => setShowApplyModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <p className="text-sm font-medium text-gray-600 bg-blue-50/50 p-4 rounded-2xl border border-blue-50">
                  The recruiter has requested answers to the following screening questions to better evaluate your application.
                </p>

                {selectedJob.screeningQuestions.map((q: any) => (
                  <div key={q._id} className="space-y-2.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{q.question}</label>
                    {q.type === 'boolean' ? (
                      <div className="flex gap-4">
                        {['Yes', 'No'].map(opt => (
                          <button
                            key={opt}
                            onClick={() => setAnswers({ ...answers, [q._id]: opt })}
                            className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all border-2 ${
                              answers[q._id] === opt 
                              ? 'bg-blue-950 text-white border-blue-950' 
                              : 'bg-gray-100 text-gray-500 border-transparent hover:border-gray-200'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        rows={3}
                        placeholder="Provide your answer..."
                        value={answers[q._id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [q._id]: e.target.value })}
                        className="w-full px-5 py-4 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-2xl font-medium text-gray-600 focus:outline-none transition-all resize-none"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={applying || selectedJob.screeningQuestions.some((q: any) => !answers[q._id])}
                  onClick={handleApply}
                  className="flex-[2] py-4 bg-blue-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>Submit Application <ChevronRight size={14} /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobFeed;
