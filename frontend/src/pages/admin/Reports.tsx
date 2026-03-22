import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, TrendingUp, Download, 
  UserCheck, Briefcase, Calendar, CheckCircle, Search, ArrowUpRight, Loader2
} from 'lucide-react';
import api from '../../api';

const Reports: React.FC = () => {
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

  const placementRecords = data?.placementRecords || [];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-center pt-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Reports & Analytics</h1>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#000613] transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search analytics..." 
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:border-[#000613] outline-none transition-all w-64"
            />
          </div>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`${stat.bg} border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group`}>
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`${stat.color === 'text-white' ? 'text-white/50' : stat.color} group-hover:scale-110 transition-transform`} size={18} />
              {stat.label !== 'Placement %' && <ArrowUpRight className="text-gray-300 group-hover:text-gray-500" size={14} />}
            </div>
            <h3 className={`text-2xl font-black ${stat.color === 'text-white' ? 'text-white' : 'text-gray-900'} tracking-tighter`}>{stat.value}</h3>
            <p className={`text-[10px] font-black uppercase tracking-widest ${stat.color === 'text-white' ? 'text-white/60' : 'text-gray-400'} mt-1`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Section */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <select className="bg-gray-50 border-none rounded-xl py-2 px-4 text-xs font-black text-gray-700 focus:ring-1 focus:ring-gray-200 cursor-pointer">
            <option>Course: All</option>
          </select>
          <select className="bg-gray-50 border-none rounded-xl py-2 px-4 text-xs font-black text-gray-700 focus:ring-1 focus:ring-gray-200 cursor-pointer">
            <option>Company: All</option>
          </select>
          <select className="bg-gray-50 border-none rounded-xl py-2 px-4 text-xs font-black text-gray-700 focus:ring-1 focus:ring-gray-200 cursor-pointer">
            <option>Year: 2024</option>
          </select>
          <select className="bg-gray-50 border-none rounded-xl py-2 px-4 text-xs font-black text-gray-700 focus:ring-1 focus:ring-gray-200 cursor-pointer">
            <option>Status: All</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-6 py-2 bg-[#000613] text-white rounded-xl font-black text-xs hover:bg-gray-800 transition-colors shadow-lg shadow-black/10"
          >
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department-wise Placement */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Dept-wise Placement %</h3>
          </div>
          <div className="space-y-6">
            {analytics?.deptPlacement?.map((item: any, idx: number) => (
              <div key={idx} className="space-y-2 group">
                <div className="flex justify-between text-xs font-black text-gray-700">
                  <span>{item.department}</span>
                  <span className="group-hover:text-[#000613] transition-colors">{item.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#000613] rounded-full transition-all duration-1000" 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  {item.placed} Placed / {item.total} Total
                </p>
              </div>
            ))}
            {(!analytics?.deptPlacement || analytics.deptPlacement.length === 0) && (
              <p className="py-10 text-center text-xs font-bold text-gray-400 italic">No department data available</p>
            )}
          </div>
        </div>

        {/* Salary Trends & Top Hiring */}
        <div className="space-y-6">
          {/* Salary Trends */}
          <div className="bg-[#000613] border border-gray-100 rounded-3xl p-6 shadow-xl text-white">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
              <h3 className="text-sm font-black uppercase tracking-widest">Salary Trends (LPA)</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Minimum</p>
                <p className="text-xl font-black">{analytics?.salaryTrends?.min || 0}L</p>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-2xl border border-white/20 hover:shadow-lg shadow-blue-500/10 transition-all scale-105">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Average</p>
                <p className="text-xl font-black">{analytics?.salaryTrends?.avg?.toFixed(1) || 0}L</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Maximum</p>
                <p className="text-xl font-black">{analytics?.salaryTrends?.max || 0}L</p>
              </div>
            </div>
          </div>

          {/* Top Hiring Companies */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Top Hiring Companies</h3>
            </div>
            <div className="space-y-3">
              {analytics?.topHiring?.map((company: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-[#000613] text-white rounded-lg text-[10px] font-black">{idx + 1}</span>
                    <span className="text-xs font-black text-gray-900 uppercase tracking-tight">{company._id}</span>
                  </div>
                  <span className="text-xs font-black text-[#000613] bg-white px-2 py-1 rounded-lg border border-gray-200 group-hover:border-[#000613] transition-all">
                    {company.count} Hires
                  </span>
                </div>
              ))}
              {(!analytics?.topHiring || analytics.topHiring.length === 0) && (
                <p className="py-10 text-center text-xs font-bold text-gray-400 italic">No hiring data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Placement Record Table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden mt-8">
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-base font-black text-gray-900 tracking-tight">Detailed Placement Record (Recent)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="pl-8 pr-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Name</th>
                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Company</th>
                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Package</th>
                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="pr-8 pl-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {placementRecords.map((record: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50/40 transition-all duration-300">
                  <td className="pl-8 pr-4 py-5">
                    <p className="text-sm font-black text-gray-900">{record.name}</p>
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-xs font-black text-gray-700">{record.company}</p>
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-xs font-bold text-gray-500">{record.role}</p>
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-xs font-black text-gray-900 whitespace-nowrap">{record.package}</p>
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-[10px] font-bold text-gray-400 whitespace-nowrap uppercase italic">{record.date}</p>
                  </td>
                  <td className="pr-8 pl-4 py-5 text-right">
                    <span className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
              {placementRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center font-bold text-gray-400 italic">No placement records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
