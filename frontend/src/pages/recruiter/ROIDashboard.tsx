import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, Target, Clock, 
  Download, Filter, ArrowUpRight, ChevronRight,
  PieChart as PieChartIcon, BarChart3, Loader2,
  CheckCircle2, AlertCircle, HelpCircle
} from 'lucide-react';
import { 
  Funnel, FunnelChart, LabelList, 
  ResponsiveContainer, Tooltip, 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import api from '../../api';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
import toast from 'react-hot-toast';

const ROIDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('All Jobs');

  useEffect(() => {
    const fetchROI = async () => {
      try {
        const res = await api.get('/jobs/roi');
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load ROI metrics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchROI();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

  const kpis = [
    { 
      label: 'Avg. Match Score', 
      value: `${data?.kpis.avgMatchScore}%`, 
      desc: 'Overall applicant quality',
      icon: Target,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      label: 'Time-to-Hire', 
      value: `${data?.kpis.avgTimeToFill || 'N/A'} Days`, 
      desc: 'Avg. days to first selection',
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    { 
      label: 'Offer Acceptance', 
      value: `${data?.kpis.offerAcceptanceRate}%`, 
      desc: 'Selected candidates who accepted',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    { 
      label: 'Selected/Applications', 
      value: `${((data?.kpis.selected / data?.kpis.totalApplications) * 100).toFixed(1)}%`, 
      desc: 'Overall conversion efficiency',
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">Recruiter ROI Dashboard</h1>
          <p className="text-gray-500 font-bold mt-1 tracking-tight">Measure your recruitment efficiency and talent quality.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => exportToPDF(data, 'Recruiter_ROI_Report')}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg active:scale-95"
          >
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
            <div className={`w-12 h-12 ${kpi.bg} ${kpi.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <kpi.icon size={22} />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">{kpi.value}</h3>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{kpi.label}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-1 italic">{kpi.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Recruitment Funnel */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm h-full">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Conversion Funnel</h2>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">Stage-by-stage drop-off analytics</p>
              </div>
              <BarChart3 className="text-gray-300" size={24} />
            </div>

            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Funnel
                    dataKey="value"
                    data={data?.funnel}
                    isAnimationActive
                  >
                    <LabelList position="right" fill="#6b7280" stroke="none" dataKey="name" />
                    {data?.funnel.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Talent Distribution */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-[#000613] rounded-3xl p-8 shadow-xl text-white h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16" />
            
            <div className="flex justify-between items-center mb-10 relative z-10">
              <div>
                <h2 className="text-xl font-black tracking-tight">Hire Origin</h2>
                <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mt-1">Hires by Department</p>
              </div>
              <PieChartIcon className="text-white/20" size={20} />
            </div>

            <div className="h-[300px] relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', background: '#000', border: 'none', color: '#fff' }}
                  />
                  <Pie
                    data={data?.branchDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data?.branchDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 mt-6 relative z-10">
              {data?.branchDistribution.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="font-bold text-white/60">{item.name}</span>
                  </div>
                  <span className="font-black">{item.value} Hires</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Jobs */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Placement Efficiency by Job</h2>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">Ranking your most successful job postings</p>
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left order-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Title</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Applications</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Hired</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Avg. Match</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.jobPerformance.map((job: any) => (
                <tr key={job.id} className="hover:bg-gray-50 group transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs">
                        {job.title.charAt(0)}
                      </div>
                      <span className="text-sm font-black text-gray-900">{job.title}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center text-sm font-bold text-gray-500">{job.applications}</td>
                  <td className="px-8 py-6 text-center text-sm font-bold text-gray-500">{job.selected}</td>
                  <td className="px-8 py-6 text-center">
                    <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-black uppercase text-gray-600">
                      High Quality
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-3 font-black text-sm text-gray-900">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${job.conversionRate}%` }}
                        />
                      </div>
                      {job.conversionRate}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default ROIDashboard;
