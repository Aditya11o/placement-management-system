import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, TrendingUp, Download, 
  UserCheck, Briefcase, Calendar, CheckCircle, Search, ArrowUpRight,
  FileSpreadsheet, File
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import api from '../../api';
import DashboardSkeleton from '../../components/skeletons/DashboardSkeleton';
import Dropdown from '../../components/Dropdown';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Reports: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

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
            package: p.job?.salary || 0,
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

  // Filter Logic
  const filteredRecords = data?.placementRecords?.filter((r: any) => {
    const matchesYear = selectedYear === 'All' || r.student?.profile?.passingYear?.toString() === selectedYear;
    const matchesBranch = selectedBranch === 'All' || r.student?.profile?.branch === selectedBranch;
    const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus;
    const matchesSearch = searchTerm === '' || 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesYear && matchesBranch && matchesStatus && matchesSearch;
  }) || [];

  // Branch Performance Aggregation
  const branchPerformance = analytics?.branchComparison?.reduce((acc: any, curr: any) => {
    const branch = curr.branch;
    if (!acc[branch]) acc[branch] = { name: branch, placed: 0, total: 0 };
    acc[branch].total += curr._count._all;
    if (['Placed', 'Interned', 'Selected'].includes(curr.placementStatus)) {
      acc[branch].placed += curr._count._all;
    }
    return acc;
  }, {});

  const branchPerformanceData = Object.values(branchPerformance || {}).map((b: any) => ({
    name: b.name,
    rate: Math.round((b.placed / b.total) * 100),
    total: b.total
  })).sort((a: any, b: any) => b.rate - a.rate);

  const handleFullExportCSV = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/data/export/placements', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Placement_Analytics_Detailed_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data?.placementRecords) return;
    const headers = ['Student Name', 'Email', 'Company', 'Role', 'Package (LPA)', 'Date', 'Status'];
    const rows = data.placementRecords.map((r: any) => [
      `"${r.name}"`, r.email, `"${r.company}"`, `"${r.role}"`, r.package, r.date, r.status
    ]);
    const csvContent = [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Placement_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportExcel = () => {
    if (!data?.placementRecords) return;
    const worksheet = XLSX.utils.json_to_sheet(data.placementRecords.map((r: any) => ({
      'Student Name': r.name,
      'Email': r.email,
      'Company': r.company,
      'Role': r.role,
      'Package (LPA)': r.package,
      'Placement Date': r.date,
      'Status': r.status
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Placements');
    XLSX.writeFile(workbook, `Placement_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportPDF = () => {
    if (!data?.placementRecords) return;
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 6, 19);
    doc.text('Placement Management System', 14, 20);
    doc.setFontSize(14);
    doc.text('Annual Placement & Analytics Report', 14, 30);
    
    // Stats Summary
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);
    doc.text(`Total Placed: ${data.stats.selected} | Avg Salary: ${analytics?.salaryTrends?.avg?.toFixed(2)}L`, 14, 45);

    // Table
    const tableData = data.placementRecords.map((r: any) => [
      r.name, r.company, r.role, `${r.package}L`, r.date, r.status
    ]);

    doc.autoTable({
      startY: 55,
      head: [['Student', 'Company', 'Role', 'Package', 'Date', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 6, 19], fontSize: 10, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 247, 250] }
    });

    doc.save(`PMS_Placement_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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

  const COLORS = ['#000613', '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a'];

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100 italic">
        <FileText size={48} className="text-gray-200 mb-4" />
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest uppercase tracking-tight">Intelligence <span className="text-blue-600">Unavailable</span></h2>
        <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest italic">We encountered an error loading the strategic placement metrics.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-[#000613] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
        >
          Try Refreshing
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Intelligence <span className="text-blue-600">& Analytics</span></h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Strategic Placement Insights & Performance Tracking</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#000613] transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search metrics..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:border-[#000613] outline-none transition-all w-64 shadow-sm"
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

      {/* Advanced Export & Filter Section */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Academic Year</label>
            <Dropdown value={selectedYear} onChange={setSelectedYear} options={['All', '2025', '2024', '2023', '2022']} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Branch/Dept</label>
            <Dropdown value={selectedBranch} onChange={setSelectedBranch} options={['All', 'CSE', 'ECE', 'ME', 'CE', 'IT']} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Application Status</label>
            <Dropdown value={selectedStatus} onChange={setSelectedStatus} options={['All', 'Placed', 'Interned', 'Selected', 'Rejected', 'Interviewing']} />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={exportExcel}
             className="flex items-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all group"
           >
             <FileSpreadsheet size={16} className="group-hover:scale-110 transition-transform" /> Excel
           </button>
           <button 
             onClick={exportPDF}
             className="flex items-center gap-2 px-5 py-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all group"
           >
             <File size={16} className="group-hover:scale-110 transition-transform" /> PDF
           </button>
            <button 
             onClick={handleFullExportCSV}
             className="flex items-center gap-2 px-5 py-3 bg-[#000613] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/20"
           >
             <Download size={16} /> full report (CSV)
           </button>
        </div>
      </div>

      {/* Primary Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placement Trends - Area Chart */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm group">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-[#000613] rounded-full" />
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest italic font-serif">Year-over-Year Trends</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Placements vs Total Intake</p>
              </div>
            </div>
            <TrendingUp size={20} className="text-blue-600 animate-pulse" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.yearlyTrends}>
                <defs>
                  <linearGradient id="colorPlaced" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000613" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000613" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                  labelStyle={{fontWeight: 900, marginBottom: '4px', fontSize: '12px'}}
                />
                <Area type="monotone" dataKey="placed" stroke="#000613" strokeWidth={3} fillOpacity={1} fill="url(#colorPlaced)" />
                <Area type="monotone" dataKey="total" stroke="#e5e7eb" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Salary Distribution - Bar Chart */}
        <div className="bg-[#000613] border border-gray-100 rounded-[2.5rem] p-8 shadow-xl text-white overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 blur-3xl rounded-full" />
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest italic font-serif">Salary Intelligence</h3>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">LPA Distribution Frequency</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Current Average</p>
              <p className="text-xl font-black">{analytics?.salaryTrends?.avg?.toFixed(1) || 0}L</p>
            </div>
          </div>
          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.salaryDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: 'rgba(255,255,255,0.3)'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: 'rgba(255,255,255,0.3)'}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{background: '#000613', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '12px'}}
                  labelStyle={{fontWeight: 900, marginBottom: '4px', fontSize: '12px', color: '#fff'}}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {analytics?.salaryDistribution?.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 2 ? '#3b82f6' : 'rgba(255,255,255,0.1)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown - Pie Chart */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest italic font-serif">Status Mix</h3>
          </div>
          <div className="h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {analytics?.statusBreakdown?.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Hiring Companies - Detailed List */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
               <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest italic font-serif">Power Hirers</h3>
             </div>
             <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Active Recruiters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {analytics?.topHiring?.map((company: any, idx: number) => (
               <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-[1.5rem] hover:bg-gray-100 transition-all group cursor-default">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xs font-black text-blue-600 border border-gray-100">
                      {company._id?.[0]}
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{company._id}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Top Recruiter</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-xs font-black text-[#000613]">{company.count}</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Selections</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Cohort Comparative Performance Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest italic font-serif">Cohort Success Matrix</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Branch-wise Selection Rate Benchmarking</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                <span className="text-[10px] font-black text-gray-400 uppercase">Selection %</span>
              </div>
              <div className="w-px h-3 bg-gray-200 mx-2" />
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-gray-200 rounded-full" />
                <span className="text-[10px] font-black text-gray-400 uppercase">Intake</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchPerformanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f8fafc" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#64748b'}} width={60} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                />
                <Bar dataKey="rate" fill="#2563eb" radius={[0, 8, 8, 0]} barSize={20}>
                  <Cell fill="#000613" />
                </Bar>
                <Bar dataKey="total" fill="#f1f5f9" radius={[0, 8, 8, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#f8fafc] border border-gray-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 mb-6 font-black scale-110">
              %
            </div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight leading-tight mb-4">
              Strategic <span className="text-blue-600">Benchmarking</span> Logic
            </h3>
            <p className="text-[11px] font-bold text-gray-500 leading-relaxed uppercase tracking-wider">
              The cohort success matrix visualizes the efficiency of each department in converting student intake into verified career placements.
            </p>
          </div>
          
          <div className="mt-8 space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-gray-100">
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Global Success Avg</p>
               <div className="flex items-end gap-2">
                 <p className="text-2xl font-black text-gray-900">{data?.stats?.placementRate}</p>
                 <TrendingUp size={16} className="text-emerald-500 mb-1" />
               </div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-gray-100">
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Top Cohort (Branch)</p>
               <div className="flex items-center gap-2">
                 <p className="text-lg font-black text-gray-900 uppercase tracking-tighter">{branchPerformanceData[0]?.name || 'N/A'}</p>
                 <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">{branchPerformanceData[0]?.rate || 0}%</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Placement Record Table */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden mt-8">
        <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-base font-black text-gray-900 tracking-tight italic uppercase">Recent Success Stories</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Live updates from the selection board</p>
          </div>
          <button className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">View All Records</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="pl-10 pr-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Asset</th>
                <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Strategic Partner</th>
                <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Offer Package</th>
                <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Engagement Date</th>
                <th className="pr-10 pl-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRecords.map((record: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50/40 transition-all duration-300 group">
                  <td className="pl-10 pr-4 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-black">
                        {record.name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{record.name}</p>
                        <p className="text-[9px] font-bold text-gray-400">{record.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <div>
                      <p className="text-xs font-black text-gray-700 uppercase tracking-tighter">{record.company}</p>
                      <p className="text-[10px] font-bold text-blue-600/60 uppercase tracking-widest">{record.role}</p>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-lg">
                      <div className="w-1 h-1 bg-amber-400 rounded-full" />
                      <p className="text-xs font-black text-amber-900 whitespace-nowrap">{record.package} LPA</p>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <p className="text-[10px] font-black text-gray-400 whitespace-nowrap uppercase italic tracking-widest">{record.date}</p>
                  </td>
                  <td className="pr-10 pl-4 py-6 text-right">
                    <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-emerald-50 text-emerald-600 border border-emerald-100 flex-inline items-center gap-1">
                      <CheckCircle size={10} className="inline mr-1" /> {record.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <FileText size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="font-black text-gray-400 uppercase tracking-widest italic">No placement intelligence available</p>
                  </td>
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
