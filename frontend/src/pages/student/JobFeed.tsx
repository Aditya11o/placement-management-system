import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Search, MapPin, DollarSign, 
  CheckCircle, 
  Sparkles, AlertCircle, FileText,
  X, ChevronRight, Loader2
} from 'lucide-react';
import Dropdown from '../../components/Dropdown';
import ListSkeleton from '../../components/skeletons/ListSkeleton';
import EligibilityCard from '../../components/student/EligibilityCard';
import SkillGapVisualization from '../../components/student/SkillGapVisualization';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { useQueryClient } from '@tanstack/react-query';
import { useJobs } from '../../hooks/useJobs';
import { useMyApplications, useSaveDraft } from '../../hooks/useApplications';
import { useResumes } from '../../hooks/useResumes';
import { useStudentDashboard } from '../../hooks/useDashboard';
import EmptyState from '../../components/EmptyState';

const JobFeed: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const queryClient = useQueryClient();
  const [jobType, setJobType] = useState('All Job Types');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Locations');

  const { data: allJobs = [], isLoading: loadingJobs } = useJobs(jobType);
  const { data: myApps = [], isLoading: loadingApps } = useMyApplications();
  const { data: resumes = [], isLoading: loadingResumes } = useResumes();
  const { data: dashboardData, isLoading: loadingDash } = useStudentDashboard();
  const [applying, setApplying] = useState(false);
  
  const loading = loadingJobs || loadingApps || loadingResumes || loadingDash;
  const isVerified = dashboardData?.profile?.academicVerified || false;

  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isEligible, setIsEligible] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { mutate: saveDraft, isPending: savingDraft } = useSaveDraft();
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');

  // Handle Draft Pre-filling
  useEffect(() => {
    if (selectedJob && myApps) {
      const draft = myApps.find((app: any) => 
        (app.job?._id === selectedJob._id || app.job === selectedJob._id) && 
        app.status === 'Draft'
      );
      if (draft) {
        const initialAnswers: Record<string, string> = {};
        draft.answers?.forEach((a: any) => {
          initialAnswers[a.questionId] = a.answer;
        });
        setAnswers(initialAnswers);
        if (draft.resumeId) setSelectedResumeId(draft.resumeId);
      } else {
        setAnswers({});
      }
    }
  }, [selectedJob, myApps]);

  useEffect(() => {
    if (resumes && resumes.length > 0 && !selectedResumeId) {
      const primary = resumes.find((r: any) => r.isPrimary);
      setSelectedResumeId(primary ? primary._id : resumes[0]._id);
    }
  }, [resumes, selectedResumeId]);

  const jobs = allJobs.map((job: any) => {
    const application = myApps.find((app: any) => app.job?._id === job._id || app.job === job._id);
    return {
      ...job,
      status: application ? 'Applied' : job.status || 'Open'
    };
  });

  const stats = [
    { label: 'Total Jobs', value: allJobs.length.toString(), subLabel: 'Active tracking', icon: Briefcase, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'New Jobs', value: allJobs.filter((j: any) => new Date(j.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length.toString(), subLabel: 'Posted this week', icon: Sparkles, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { label: 'Jobs Applied', value: myApps.length.toString(), subLabel: 'Active tracking', icon: CheckCircle, iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
    { label: 'Closing Soon', value: allJobs.filter((j: any) => new Date(j.deadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)).length.toString(), subLabel: 'Within 3 days', icon: AlertCircle, iconBg: 'bg-rose-50', iconColor: 'text-rose-600' },
  ];

  const handleApply = async () => {
    if (!selectedJob) return;
    try {
      setApplying(true);
      const formattedAnswers = selectedJob.screeningQuestions?.map((q: any) => ({
        questionId: q._id,
        question: q.question,
        answer: answers[q._id] || ''
      })) || [];

      await api.post(`/applications/${selectedJob._id}`, { 
        answers: formattedAnswers,
        resumeId: selectedResumeId 
      });
      showSuccess('Application submitted successfully!', 'Job Application');
      setShowApplyModal(false);
      setSelectedJob(null);
      setAnswers({});
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to submit application', 'Application Error');
    } finally {
      setApplying(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedJob) return;
    const formattedAnswers = selectedJob.screeningQuestions?.map((q: any) => ({
      questionId: q._id,
      question: q.question,
      answer: answers[q._id] || ''
    })) || [];

    saveDraft({
      jobId: selectedJob._id,
      data: {
        answers: formattedAnswers,
        resumeId: selectedResumeId || undefined
      }
    }, {
      onSuccess: () => {
        setShowApplyModal(false);
        setSelectedJob(null);
      }
    });
  };

  const filteredJobs = jobs.filter((job: any) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === 'All Locations' || job.location === locationFilter;
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Verification Warning Banner */}
      {!isVerified && !loading && (
        <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 shadow-inner group-hover:scale-110 transition-transform">
              <AlertCircle size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-rose-900 uppercase tracking-tighter">Academic Verification <span className="text-rose-500">Required</span></h3>
              <p className="text-sm text-rose-700/70 font-bold mt-1">Your profile is currently awaiting formal authentication from the Placement Office. Job applications are restricted until verification.</p>
            </div>
          </div>
          <button className="px-8 py-3 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-700 transition-all active:scale-95 whitespace-nowrap">Contact Office</button>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-rose-200/20 rounded-full blur-3xl"></div>
        </div>
      )}

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
            <Dropdown 
              label="Location"
              value={locationFilter}
              onChange={(val) => setLocationFilter(val)}
              options={['All Locations', ...new Set(jobs.map((j: any) => j.location))]}
            />
          </div>

          <div className="flex-1 min-w-[180px]">
            <Dropdown 
              label="Job Type"
              value={jobType}
              onChange={(newType) => {
                setJobType(newType);
              }}
              options={[
                { label: 'All Job Types', value: 'All Job Types' },
                { label: 'Full Time', value: 'Full-time' },
                { label: 'Internship', value: 'Internship' },
                { label: 'Contract', value: 'Contract' },
                { label: 'PPO', value: 'PPO' }
              ]}
            />
          </div>

        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="lg:col-span-2">
            <ListSkeleton hideHeader={true} rows={8} />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="lg:col-span-2">
            <EmptyState 
              icon={Search}
              title="No Jobs Found"
              description="We couldn't find any job postings matching your current search or filters. Try broadening your criteria."
              actionText="Clear All Filters"
              onAction={() => {
                setSearchTerm('');
                setJobType('All Job Types');
                setLocationFilter('All Locations');
              }}
            />
          </div>
        ) : (
          filteredJobs.map((job: any) => (
            <div key={job._id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 flex flex-col hover:shadow-lg transition-all relative group h-full overflow-hidden">
              {/* Match Score Indicator */}
              <div className="absolute top-0 right-0 p-4 flex flex-col items-end">
                <div className={`w-12 h-12 rounded-full border-4 ${
                  job.matchScore >= 80 ? 'border-emerald-500 text-emerald-600' : 
                  job.matchScore >= 50 ? 'border-amber-500 text-amber-600' : 'border-rose-500 text-rose-600'
                } flex items-center justify-center bg-white shadow-sm font-black text-[11px] relative`}>
                  {job.matchScore}%
                  <div className={`absolute inset-0 rounded-full border-4 opacity-10 animate-pulse ${
                    job.matchScore >= 80 ? 'border-emerald-500' : 
                    job.matchScore >= 50 ? 'border-amber-500' : 'border-rose-500'
                  }`}></div>
                </div>
                <p className="text-[7px] font-black uppercase tracking-[0.2em] mt-1 text-gray-400 italic">Core Match</p>
              </div>
              
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
                  <span className={`text-xs font-black ${
                    job.status === 'Applied' ? 'text-emerald-500' : 
                    job.status === 'Draft' ? 'text-amber-500' : 'text-rose-500'
                  }`}>
                    {job.status === 'Applied' ? 'Successfully Applied' : 
                     job.status === 'Draft' ? 'Draft Saved' :
                     new Date(job.deadline).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                   <button 
                    onClick={() => {
                      setSelectedJob(job);
                      setShowDetailsModal(true);
                    }}
                    className="w-full sm:w-auto px-5 py-2 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-all">
                    View Details
                  </button>
                  {job.status === 'Applied' ? (
                    <button disabled className="w-full sm:w-auto px-6 py-2 bg-gray-100 text-gray-400 rounded-xl text-[11px] font-black uppercase tracking-widest cursor-not-allowed">
                      Applied
                    </button>
                  ) : job.status === 'Closed' ? (
                    <button disabled className="w-full sm:w-auto px-6 py-2 bg-gray-50 text-gray-300 rounded-xl text-[11px] font-black uppercase tracking-widest cursor-not-allowed">
                      Closed
                    </button>
                  ) : !isVerified ? (
                    <button 
                      disabled
                      title="Academic Verification Required"
                      className="w-full sm:w-auto px-6 py-2 bg-gray-100 text-gray-400 rounded-xl text-[11px] font-black uppercase tracking-widest cursor-not-allowed border border-gray-200"
                    >
                      Locked
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setSelectedJob(job);
                        setShowApplyModal(true);
                      }}
                      className="w-full sm:w-auto px-6 py-2 bg-blue-950 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black shadow-md shadow-blue-900/10 active:scale-95 transition-all text-center"
                    >
                      {job.status === 'Draft' ? 'Resume Application' : 'Apply Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-end p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right-8 duration-500">
            <div className="relative h-48 bg-gradient-to-br from-blue-900 to-black shrink-0 overflow-hidden">
               <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
               </div>
               <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white backdrop-blur-md transition-all z-20"
               >
                 <X size={20} />
               </button>
               <div className="absolute bottom-6 left-8 flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-2xl p-2 shadow-xl flex items-center justify-center font-black text-xl italic text-blue-900">
                    {selectedJob.companyName?.[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase">{selectedJob.title}</h2>
                    <p className="text-blue-100/60 text-xs font-black uppercase tracking-widest">{selectedJob.companyName}</p>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <section className="space-y-3">
                      <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Mission Overview</h4>
                      <p className="text-sm text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
                    </section>
                    
                    <section className="space-y-4">
                       <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Required Arsenal</h4>
                       <div className="flex flex-wrap gap-2">
                          {(selectedJob.requiredSkills || []).map((skill: string) => (
                            <span key={skill} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black text-gray-700 uppercase tracking-widest">{skill}</span>
                          ))}
                       </div>
                    </section>
                  </div>

                  <div className="space-y-8">
                    <section className="space-y-4">
                      <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Compliance Check</h4>
                      <EligibilityCard jobId={selectedJob._id} onEligibilityChange={(e) => setIsEligible(e)} />
                    </section>

                    <section className="space-y-4">
                      <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Fitment Analysis</h4>
                      <SkillGapVisualization 
                        matchScore={selectedJob.matchScore || 0}
                        breakdown={selectedJob.matchBreakdown || { academic: 0, skills: 0, experience: 0 }}
                        missingSkills={selectedJob.missingSkills || []}
                        jobSkills={selectedJob.requiredSkills || []}
                        studentSkills={dashboardData?.profile?.skills || []}
                      />
                    </section>

                    <div className="space-y-4 p-6 bg-blue-50/30 rounded-3xl border border-blue-50">
                       <div className="flex items-center gap-3">
                          <DollarSign className="text-blue-600" size={18} />
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Estimate</p>
                            <p className="text-sm font-black text-gray-900">{selectedJob.salary || 'Competitive'}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <MapPin className="text-blue-600" size={18} />
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Theater</p>
                            <p className="text-sm font-black text-gray-900">{selectedJob.location || 'Remote'}</p>
                          </div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="p-8 border-t border-gray-50 flex gap-4 bg-gray-50/30">
               <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
                >
                  Close
                </button>
                <button 
                  disabled={selectedJob.status === 'Applied' || !isEligible || !isVerified}
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowApplyModal(true);
                  }}
                  className={`flex-[2] py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 ${
                    selectedJob.status === 'Applied' ? 'bg-emerald-50 text-emerald-600 opacity-50' : 
                    !isEligible ? 'bg-rose-50 text-rose-400 opacity-50 cursor-not-allowed' :
                    'bg-blue-950 text-white hover:bg-black shadow-blue-900/20'
                  }`}
                >
                  {selectedJob.status === 'Applied' ? 'Already Applied' : !isEligible ? 'Criteria Not Met' : 'Proceed to Application'}
                  {isEligible && selectedJob.status !== 'Applied' && <ChevronRight size={14} />}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            {/* Match Insight Banner */}
            <div className={`px-8 py-4 flex items-center justify-between ${
              selectedJob.matchScore >= 80 ? 'bg-emerald-50 text-emerald-700' : 
              selectedJob.matchScore >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
            }`}>
              <div className="flex items-center gap-3">
                <Sparkles size={18} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">Intelligence Insight</p>
                  <p className="text-xs font-bold mt-0.5">
                    {selectedJob.matchScore >= 80 ? 'Excellent profile alignment detected.' : 
                     selectedJob.matchScore >= 50 ? 'Good match. Consider highlighting missing skills.' : 
                     'Low alignment. You might want to update your resume keywords.'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none opacity-60">Score</p>
                <p className="text-xl font-black italic lora">{selectedJob.matchScore}%</p>
              </div>
            </div>

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
                      <div className="flex flex-col sm:flex-row gap-4">
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

                {/* Skill Gap Insights */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Matching Strategy</h4>
                  <SkillGapVisualization 
                    matchScore={selectedJob.matchScore || 0}
                    breakdown={selectedJob.matchBreakdown || { academic: 0, skills: 0, experience: 0 }}
                    missingSkills={selectedJob.missingSkills || []}
                    jobSkills={selectedJob.requiredSkills || []}
                    studentSkills={dashboardData?.profile?.skills || []}
                  />
                </div>


                {/* Resume Selection Section */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic">Select Resume Version</label>
                    <a href="/student/resumes" className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">Manage Resumes</a>
                  </div>
                  
                  {resumes.length === 0 ? (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
                      <AlertCircle size={18} className="text-amber-500 shrink-0" />
                      <p className="text-[10px] font-bold text-amber-900 leading-tight">No resumes found. Please build or upload a resume to continue.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                       {resumes.map((r: any) => (
                         <div 
                           key={r._id}
                           onClick={() => setSelectedResumeId(r._id)}
                           className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                             selectedResumeId === r._id 
                             ? 'bg-blue-50 border-blue-600' 
                             : 'bg-gray-50 border-transparent hover:border-gray-200'
                           }`}
                         >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <FileText size={16} className={selectedResumeId === r._id ? 'text-blue-600' : 'text-gray-400'} />
                              <div className="truncate">
                                <p className={`text-xs font-black truncate ${selectedResumeId === r._id ? 'text-blue-950' : 'text-gray-600'}`}>{r.resume_name}</p>
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()} {r.isPrimary && '• PRIMARY'}</p>
                              </div>
                            </div>
                            {selectedResumeId === r._id && <CheckCircle size={16} className="text-blue-600" />}
                         </div>
                       ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  disabled={applying || savingDraft}
                  onClick={handleSaveDraft}
                  className="flex-1 py-4 border-2 border-amber-200 text-amber-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-amber-50 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {savingDraft ? <Loader2 size={16} className="animate-spin" /> : 'Save Progress'}
                </button>
                <button 
                  disabled={applying || savingDraft || selectedJob.screeningQuestions.some((q: any) => !answers[q._id]) || !selectedResumeId}
                  onClick={handleApply}
                  className="flex-[1.5] py-4 bg-blue-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
