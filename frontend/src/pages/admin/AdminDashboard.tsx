import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Briefcase, FileText, Calendar, 
  CheckCircle, MoreVertical, Loader2
} from 'lucide-react';
import api from '../../api';
import AnnouncementsBoard from '../../components/AnnouncementsBoard';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { label: 'Total Students', value: '0', change: 'Active', icon: Users, color: 'blue' },
    { label: 'Total Recruiters', value: '0', change: 'Active', icon: Briefcase, color: 'indigo' },
    { label: 'Total Jobs Posted', value: '0', status: 'Active', icon: Briefcase, color: 'sky' },
    { label: 'Total Applications', value: '0', sub: 'Active', icon: FileText, color: 'slate' },
    { label: 'Total Interviews', value: '0', sub: 'Updated', icon: Calendar, color: 'violet' },
    { label: 'Selected Students', value: '0', sub: 'Updated', icon: CheckCircle, color: 'emerald' },
  ]);

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyJobs, setCompanyJobs] = useState<any[]>([]);
  const [appStatus, setAppStatus] = useState<any[]>([
    { label: 'Applied', value: 0, color: 'bg-[#000613]' },
    { label: 'Shortlisted', value: 0, color: 'bg-[#1a2b4b]' },
    { label: 'Selected', value: 0, color: 'bg-[#4a5d7e]' },
    { label: 'Rejected', value: 0, color: 'bg-[#e2e4e6]' },
  ]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/activities')
        ]);
        
        const s = statsRes.data;
        setStats([
          { label: 'Total Students', value: s.totalStudents.toLocaleString(), change: 'Active', icon: Users, color: 'blue' },
          { label: 'Total Recruiters', value: s.totalRecruiters.toLocaleString(), change: 'Active', icon: Briefcase, color: 'indigo' },
          { label: 'Total Jobs Posted', value: s.totalJobs.toLocaleString(), status: 'Active', icon: Briefcase, color: 'sky' },
          { label: 'Total Applications', value: s.totalApplications.toLocaleString(), sub: 'Active', icon: FileText, color: 'slate' },
          { label: 'Total Interviews', value: s.totalInterviews.toLocaleString(), sub: 'Next: 2PM', icon: Calendar, color: 'violet' },
          { label: 'Selected Students', value: s.placedStudents.toLocaleString(), sub: '68% Rate', icon: CheckCircle, color: 'emerald' },
        ]);
        setActivities(activitiesRes.data);

        // Process dynamic charts
        if (s.jobsPerCompany && s.jobsPerCompany.length > 0) {
          const colors = ['#000613', '#1a2b4b', '#4a5d7e', '#8a9ab3', '#c4ced9'];
          setCompanyJobs(s.jobsPerCompany.map((c: any, i: number) => ({
            name: c._id.toUpperCase(),
            jobs: c.count,
            color: colors[i % colors.length]
          })));
        } else {
          setCompanyJobs([
            { name: 'TECHCORP', jobs: 0, color: '#000613' },
            { name: 'SYSTEMS', jobs: 0, color: '#1a2b4b' },
          ]);
        }

        if (s.appBreakdown && s.totalApplications > 0) {
          const breakdown = s.appBreakdown;
          const getCount = (label: string) => breakdown.find((b: any) => b._id === label)?.count || 0;
          const total = s.totalApplications;
          
          setAppStatus([
            { label: 'Applied', value: Math.round((getCount('Applied') / total) * 100), color: 'bg-[#000613]' },
            { label: 'Shortlisted', value: Math.round((getCount('Shortlisted') / total) * 100), color: 'bg-[#1a2b4b]' },
            { label: 'Selected', value: Math.round((getCount('Selected') / total) * 100), color: 'bg-[#4a5d7e]' },
            { label: 'Rejected', value: Math.round((getCount('Rejected') / total) * 100), color: 'bg-[#e2e4e6]' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);


  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Announcements */}
      <AnnouncementsBoard />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
              {stat.change && (
                <span className="text-[10px] font-black px-2 py-1 bg-blue-50 text-blue-600 rounded-lg">{stat.change}</span>
              )}
              {stat.status && (
                <span className="text-[10px] font-black px-2 py-1 bg-orange-50 text-orange-600 rounded-lg uppercase tracking-wider">{stat.status}</span>
              )}
              {stat.sub && (
                <span className="text-[10px] font-black px-2 py-1 bg-gray-50 text-gray-400 rounded-lg whitespace-nowrap">{stat.sub}</span>
              )}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-12 gap-6">
        {/* Jobs Posted per Company */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-base font-black text-gray-900 tracking-tight">Jobs Posted per Company</h3>
            <button className="text-gray-400 hover:text-gray-900 transition-colors"><MoreVertical size={20} /></button>
          </div>
          
          <div className="space-y-8">
            {companyJobs.map((company) => (
              <div key={company.name} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] font-black text-gray-400 tracking-widest">{company.name}</span>
                  <span className="text-[11px] font-black text-gray-900">{company.jobs} JOBS</span>
                </div>
                <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${companyJobs.length > 0 ? (company.jobs / Math.max(...companyJobs.map(c => c.jobs))) * 100 : 0}%`,
                      backgroundColor: company.color 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Status Donut */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-base font-black text-gray-900 tracking-tight">Application Status</h3>
            <button className="text-gray-400 hover:text-gray-900 transition-colors"><MoreVertical size={20} /></button>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 mb-8">
              {/* Custom Donut implementation using SVG */}
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f3f4f6" strokeWidth="4"></circle>
                {/* Applied */}
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#000613" strokeWidth="4" strokeDasharray={`${appStatus[0].value} 100`} strokeDashoffset="0"></circle>
                {/* Shortlisted */}
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#1a2b4b" strokeWidth="4" strokeDasharray={`${appStatus[1].value} 100`} strokeDashoffset={`-${appStatus[0].value}`}></circle>
                {/* Selected */}
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#4a5d7e" strokeWidth="4" strokeDasharray={`${appStatus[2].value} 100`} strokeDashoffset={`-${appStatus[0].value + appStatus[1].value}`}></circle>
                {/* Rejected */}
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#e2e4e6" strokeWidth="4" strokeDasharray={`${appStatus[3].value} 100`} strokeDashoffset={`-${appStatus[0].value + appStatus[1].value + appStatus[2].value}`}></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-gray-900">
                  {stats[3].value}
                </span>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-4 w-full px-8">
              {appStatus.map((status) => (
                <div key={status.label} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${status.color}`}></div>
                  <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap">{status.label} ({status.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-base font-black text-gray-900 tracking-tight">Recent Activities</h3>
          <button 
            onClick={() => navigate('/admin/audit')}
            className="text-[11px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors">
            View History
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Activity Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User (S/R)</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activities.map((activity, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-xs font-bold text-gray-500">
                    {new Date(activity.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 group-hover:text-blue-600 transition-colors">
                        {activity.type.includes('Job') ? <Briefcase size={14} /> : activity.type.includes('Student') ? <Users size={14} /> : <FileText size={14} />}
                      </div>
                      <span className="text-xs font-bold text-gray-900">{activity.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-500">{activity.desc}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-[#000613]/5 rounded-full flex items-center justify-center text-[10px] font-black text-[#000613]">
                        {activity.user.initials}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-none mb-1">{activity.user.role}: {activity.user.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      activity.status === 'Published' || activity.status === 'Verified' ? 'bg-[#000613] text-white' :
                      'bg-orange-50 text-orange-600'
                    }`}>
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
              {activities.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400 font-bold">No recent activities</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
