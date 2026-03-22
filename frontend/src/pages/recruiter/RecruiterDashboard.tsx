import React, { useState, useEffect } from 'react';
import { 
  Users, Briefcase, Calendar, 
  ArrowUpRight, Download, Filter,
  Clock, Globe, Loader2
} from 'lucide-react';
import api from '../../api';
import AnnouncementsBoard from '../../components/AnnouncementsBoard';

const RecruiterDashboard: React.FC = () => {
  const [stats, setStats] = useState([
    { label: 'Total Jobs Posted', value: '0', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50', badge: 'Active' },
    { label: 'Total Applicants', value: '0', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', badge: 'Active' },
    { label: 'Shortlisted Candidates', value: '0', icon: Filter, color: 'text-purple-600', bg: 'bg-purple-50', badge: 'Active' },
    { label: 'Interviews Scheduled', value: '0', icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50', badge: 'Scheduled' },
  ]);

  const [recentApplicants, setRecentApplicants] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchAnalytics = async (jobId: string) => {
    if (!jobId) return;
    try {
      const res = await api.get(`/jobs/${jobId}/analytics`);
      setAnalytics(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, appsRes, interviewsRes, jobsRes] = await Promise.all([
          api.get('/jobs/stats'),
          api.get('/applications/recruiter'),
          api.get('/applications/interviews'),
          api.get('/jobs/my')
        ]);
        
        const s = statsRes.data;
        setStats([
          { label: 'Total Jobs Posted', value: s.totalJobs.toString(), icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50', badge: 'Active' },
          { label: 'Total Applicants', value: s.totalApplications.toString(), icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', badge: 'Active' },
          { label: 'Shortlisted Candidates', value: s.shortlisted.toString(), icon: Filter, color: 'text-purple-600', bg: 'bg-purple-50', badge: 'Active' },
          { label: 'Interviews Scheduled', value: s.selected.toString(), icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50', badge: 'Updated' },
        ]);
        setRecentApplicants(appsRes.data);
        setInterviews(interviewsRes.data);
        setJobs(jobsRes.data);
        if (jobsRes.data.length > 0) {
          setSelectedJobId(jobsRes.data[0]._id);
          fetchAnalytics(jobsRes.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchAnalytics(selectedJobId);
  }, [selectedJobId]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500 font-bold mt-1 tracking-tight">Welcome back. Here is what is happening with your placements today.</p>
      </div>

      {/* Announcements */}
      <AnnouncementsBoard />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                <stat.icon size={22} />
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${stat.bg} ${stat.color}`}>
                {stat.badge}
              </span>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Recent Applicants - Left column */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Recent Applicants</h2>
              <button className="text-[11px] font-black text-gray-900 uppercase tracking-widest hover:underline flex items-center gap-1">
                View All <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Student Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Job Role</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Skills</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Resume</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentApplicants.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden text-[10px] font-black text-gray-400 uppercase">
                            {app.student?.name?.[0] || 'S'}
                          </div>
                          <span className="text-sm font-black text-gray-900 tracking-tight">{app.student?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-gray-500 tracking-tight">{app.job?.title}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-black uppercase tracking-tighter">
                            Technical
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center text-gray-400 group-hover:text-blue-600 transition-colors">
                        <a href={app.resume} target="_blank" rel="noreferrer" className="p-2 hover:bg-blue-50 rounded-lg transition-all inline-block">
                          <Download size={18} />
                        </a>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                          ${app.status === 'shortlisted' ? 'bg-emerald-100 text-emerald-700' : 
                            app.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 
                            'bg-blue-100 text-blue-700'}`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentApplicants.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-400 font-bold">No applicants found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Upcoming Interviews - Right column */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-[#000613] rounded-2xl shadow-xl p-6 text-white h-full border border-white/5 relative overflow-hidden group">
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors" />
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h2 className="text-lg font-black tracking-tight">Upcoming Interviews</h2>
              <Calendar className="text-white/40" size={20} />
            </div>

            <div className="space-y-5 relative z-10">
              {interviews.map((interview, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/item">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-sm font-black tracking-tight">{interview.student?.name}</h4>
                      <p className="text-[11px] font-bold text-white/40 uppercase tracking-wide mt-0.5">{interview.job?.title}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest 
                      ${interview.mode === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-orange-500/20 text-orange-300'}`}>
                      {interview.mode || 'ONLINE'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/60">
                      <Clock size={12} />
                      {new Date(interview.interviewDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/60">
                      <Globe size={12} />
                      {new Date(interview.interviewDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {interviews.length === 0 && (
                <div className="p-4 text-center text-white/30 text-sm font-bold italic">No interviews scheduled</div>
              )}
            </div>

            <button className="w-full mt-8 py-3.5 bg-white text-[#000613] rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2 relative z-10 shadow-lg active:scale-95">
              <span>View Calendar</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Job Analytics Section */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Recruitment Funnel</h2>
            <p className="text-gray-400 text-[12px] font-black uppercase tracking-widest mt-1">Deep insights into your job posting performance.</p>
          </div>
          <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100 min-w-[300px]">
            <Filter size={18} className="text-gray-400 ml-2" />
            <select 
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="bg-transparent border-none font-black text-[13px] text-gray-900 focus:outline-none flex-1 py-1 cursor-pointer"
            >
              {jobs.map(job => (
                <option key={job._id} value={job._id}>{job.title}</option>
              ))}
            </select>
          </div>
        </div>

        {analytics ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Views</span>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Total Traffic</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-gray-900 leading-none">{analytics.views}</span>
                <span className="text-[11px] font-bold text-gray-400 pb-1">Uniques</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-full" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Applications</span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                  {analytics.views > 0 ? ((analytics.applications / analytics.views) * 100).toFixed(1) : 0}% Conv.
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-gray-900 leading-none">{analytics.applications}</span>
                <span className="text-[11px] font-bold text-gray-400 pb-1">Total</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${analytics.views > 0 ? (analytics.applications / analytics.views) * 100 : 0}%` }} 
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Shortlisted</span>
                <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">Pipeline</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-gray-900 leading-none">{analytics.shortlisted}</span>
                <span className="text-[11px] font-bold text-gray-400 pb-1">Candidates</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${analytics.applications > 0 ? (analytics.shortlisted / analytics.applications) * 100 : 0}%` }} 
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Hired</span>
                <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">Final</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-gray-900 leading-none">{analytics.selected}</span>
                <span className="text-[11px] font-bold text-gray-400 pb-1">Placed</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${analytics.applications > 0 ? (analytics.selected / analytics.applications) * 100 : 0}%` }} 
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex py-10 items-center justify-center text-gray-400 font-bold italic">Select a job to view analytics</div>
        )}
      </div>

      {/* Rounds Section */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-base font-black text-gray-900 tracking-tight">Manage Placement Rounds</h3>
          <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Quickly switch between active hiring phases.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {['Technical', 'HR Round', 'Management', 'Final Offer'].map(round => (
            <button key={round} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
              ${round === 'Technical' ? 'bg-[#000613] text-white shadow-lg' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>
              {round}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default RecruiterDashboard;
