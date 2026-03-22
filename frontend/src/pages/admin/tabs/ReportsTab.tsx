import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, TrendingUp, Download, 
  UserCheck, Briefcase, Calendar, CheckCircle, ArrowUpRight, Loader2
} from 'lucide-react';
import api from '../../../api';

const ReportsTab: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [statsRes, placementsRes, analyticsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/reports/placements'),
          api.get('/admin/analytics')
        ]);
        
        const statsData = statsRes.data;
        const rate = statsData.totalApplications > 0 
          ? ((statsData.placedStudents / statsData.totalApplications) * 100).toFixed(1) 
          : '0';

        setAnalytics(analyticsRes.data);
        setData({
          stats: {
            students: statsData.totalStudents,
            recruiters: statsData.totalRecruiters,
            jobs: statsData.totalJobs,
            applications: statsData.totalApplications,
            interviews: statsData.totalInterviews,
            selected: statsData.placedStudents,
            placementRate: `${rate}%`
          },
          placementRecords: placementsRes.data.map((p: any) => ({
            name: p.student?.name,
            email: p.student?.email,
            company: p.job?.companyName,
            role: p.job?.title,
            package: p.job?.salary || 'N/A',
            date: new Date(p.updatedAt).toLocaleDateString(),
            status: p.status
          }))
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const exportCSV = () => {
    if (!data?.placementRecords) return;
    const headers = ['Student Name', 'Email', 'Company', 'Role', 'Package', 'Date', 'Status'];
    const rows = data.placementRecords.map((r: any) => [
      `"${r.name}"`, r.email, `"${r.company}"`, `"${r.role}"`, `"${r.package}"`, r.date, r.status
    ]);
    const csvContent = [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Placement_Report_${new Date().toLocaleDateString()}.csv`;
    a.click();
  };

  const stats = data ? [
    { label: 'Students', value: data.stats.students.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Recruiters', value: data.stats.recruiters.toLocaleString(), icon: UserCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Jobs', value: data.stats.jobs.toLocaleString(), icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Applications', value: data.stats.applications.toLocaleString(), icon: FileText, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Interviews', value: data.stats.interviews.toLocaleString(), icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Selected', value: data.stats.selected.toLocaleString(), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Placement %', value: data.stats.placementRate, icon: TrendingUp, color: 'text-white', bg: 'bg-[#000613]' }
  ] : [];

  if (loading) return <div className="flex py-20 items-center justify-center"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">System Performance Reports</h2>
          <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mt-1">Institutional analytics snapshot</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-8 py-4 bg-[#000613] text-white rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] transition-all">
          <Download size={18} /> Export Full Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`${stat.bg} border border-gray-100 rounded-3xl p-5 group hover:shadow-lg transition-all`}>
             <div className="flex items-center justify-between mb-4">
               <stat.icon className={`${stat.color === 'text-white' ? 'text-white/50' : stat.color}`} size={16} />
               <ArrowUpRight className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
             </div>
             <h4 className={`text-xl font-black ${stat.color === 'text-white' ? 'text-white' : 'text-gray-900'}`}>{stat.value}</h4>
             <p className={`text-[9px] font-black uppercase tracking-widest ${stat.color === 'text-white' ? 'text-white/60' : 'text-gray-400'} mt-1`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Analytics Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-10 flex items-center gap-3">
             <div className="w-1.5 h-6 bg-blue-600 rounded-full" /> Dept-wise Placement
          </h3>
          <div className="space-y-6">
            {analytics?.deptPlacement?.map((item: any, idx: number) => (
              <div key={idx} className="space-y-3">
                <div className="flex justify-between text-xs font-black">
                  <span>{item.department}</span>
                  <span>{item.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                  <div className="h-full bg-[#000613] transition-all duration-1000" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#000613] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />
          <h3 className="text-sm font-black uppercase tracking-widest mb-10 relative z-10">Package Distribution</h3>
          <div className="grid grid-cols-3 gap-6 relative z-10">
             {[
               { label: 'Minimum', val: `${analytics?.salaryTrends?.min || 0}L` },
               { label: 'Average', val: `${analytics?.salaryTrends?.avg?.toFixed(1) || 0}L`, highlight: true },
               { label: 'Maximum', val: `${analytics?.salaryTrends?.max || 0}L` }
             ].map((s, i) => (
               <div key={i} className={`p-6 rounded-3xl border border-white/10 ${s.highlight ? 'bg-white/10 border-white/20' : 'bg-white/5'}`}>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">{s.label}</p>
                  <p className="text-2xl font-black">{s.val}</p>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;
