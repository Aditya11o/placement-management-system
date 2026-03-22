import React from 'react';
import { 
  Users, UserCheck, Briefcase, 
  FileText, Calendar, CheckCircle, 
  TrendingUp, Download, Printer, 
  ChevronLeft, ChevronRight,
  ArrowUpRight, Search, Home, User
} from 'lucide-react';

const Reports: React.FC = () => {
  const stats = [
    { label: 'Students', value: '1,284', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Recruiters', value: '86', icon: UserCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Jobs', value: '312', icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Applications', value: '4,520', icon: FileText, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Interviews', value: '1,840', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Selected', value: '942', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Placement %', value: '73.4%', icon: TrendingUp, color: 'text-white', bg: 'bg-[#000613]' }
  ];

  const placementRecords = [
    { name: 'Aarav Sharma', course: 'B.Tech (CSE)', company: 'Google', role: 'SDE-1', package: '₹24.5 LPA', date: '12 Oct 2023', status: 'PLACED' },
    { name: 'Ishani Patel', course: 'MCA', company: 'Amazon', role: 'Cloud Associate', package: '₹18.0 LPA', date: '05 Nov 2023', status: 'PLACED' },
    { name: 'Rohan Mehra', course: 'B.Tech (IT)', company: 'Microsoft', role: 'Technical Support', package: '₹15.2 LPA', date: '28 Oct 2023', status: 'PENDING' },
    { name: 'Sanya Gupta', course: 'BCA', company: 'Meta', role: 'QA Engineer', package: '₹12.5 LPA', date: '15 Nov 2023', status: 'REJECTED' },
    { name: 'Kabir Singh', course: 'B.Tech (ECE)', company: 'TCS', role: 'Graduate Engineer', package: '₹7.2 LPA', date: '02 Dec 2023', status: 'PLACED' },
  ];

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
          <button className="p-2 text-gray-400 hover:text-[#000613] transition-colors"><Home size={20} /></button>
          <button className="p-2 text-gray-400 hover:text-[#000613] transition-colors"><User size={20} /></button>
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
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl font-black text-xs hover:bg-gray-100 transition-colors">
            <Download size={14} /> PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl font-black text-xs hover:bg-gray-100 transition-colors">
            <Download size={14} /> Excel
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-[#000613] text-white rounded-xl font-black text-xs hover:bg-gray-800 transition-colors shadow-lg shadow-black/10">
            <Printer size={14} /> Print Report
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company-wise Selections */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Company-wise Selections</h3>
          </div>
          <div className="space-y-6">
            {[ {name: 'Google', val: 42, color: 'bg-[#000613]'}, {name: 'Amazon', val: 38, color: 'bg-gray-700'}, {name: 'Microsoft', val: 35, color: 'bg-gray-400'}, {name: 'Meta', val: 28, color: 'bg-gray-300'} ].map((item, idx) => (
              <div key={idx} className="space-y-2 group">
                <div className="flex justify-between text-xs font-black text-gray-700">
                  <span>{item.name}</span>
                  <span className="group-hover:text-[#000613] transition-colors">{item.val}</span>
                </div>
                <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${(item.val / 42) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Distribution */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Application Distribution</h3>
          </div>
          <div className="flex items-center justify-center relative py-8">
            <div className="w-48 h-48 rounded-full border-[12px] border-gray-100 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-[12px] border-transparent border-t-[#000613] border-r-gray-700 border-b-gray-400 border-l-gray-300 rotate-45 transform-gpu transition-transform duration-1000"></div>
              <div className="text-center">
                <p className="text-3xl font-black text-gray-900 tracking-tighter">4.5k</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
              </div>
            </div>
            <div className="ml-12 space-y-3">
              {[ {label: 'Applied', per: '30%', color: 'bg-[#000613]'}, {label: 'Shortlisted', per: '25%', color: 'bg-gray-700'}, {label: 'Selected', per: '20%', color: 'bg-gray-400'}, {label: 'Rejected', per: '25%', color: 'bg-gray-300'} ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <p className="text-[10px] font-bold text-gray-500 whitespace-nowrap">{item.label} ({item.per})</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Placements Trend */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Monthly Placements Trend</h3>
          </div>
          <div className="h-48 flex items-end justify-between gap-1 px-2">
            {[ 30, 45, 35, 55, 75, 95, 80, 70, 60, 60, 40, 25 ].map((val, idx) => (
              <div key={idx} className="flex flex-col items-center gap-3 flex-1">
                <div className={`w-full rounded-t-lg transition-all duration-700 hover:scale-x-110 cursor-pointer ${val === 95 ? 'bg-[#000613]' : 'bg-gray-300/60 hover:bg-gray-400'}`} style={{ height: `${val}%` }}></div>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                  {['JAN', 'MAR', 'MAY', 'JUL', 'SEP', 'NOV'][idx/2] || ''}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Course-wise Placement % */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Course-wise Placement %</h3>
          </div>
          <div className="space-y-6">
            {[ {name: 'B.Tech', per: 85}, {name: 'MCA', per: 78}, {name: 'BCA', per: 72}, {name: 'MBA', per: 65} ].map((item, idx) => (
              <div key={idx} className="space-y-2 group">
                <div className="flex justify-between text-xs font-black text-gray-700 uppercase tracking-wide">
                  <span>{item.name}</span>
                  <span className="group-hover:text-blue-600 transition-colors">{item.per}%</span>
                </div>
                <div className="h-3 w-full bg-gray-50 rounded-full border border-gray-100 p-0.5">
                  <div className="h-full bg-[#000613] rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${item.per}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Placement Record Table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden mt-8">
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-base font-black text-gray-900 tracking-tight">Detailed Placement Record</h3>
          <button className="text-xs font-black text-gray-400 hover:text-[#000613] uppercase tracking-widest transition-colors flex items-center gap-1">
            View All Records <ChevronRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="pl-8 pr-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Name</th>
                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Course</th>
                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Company</th>
                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Package</th>
                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="pr-8 pl-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {placementRecords.map((record, idx) => (
                <tr key={idx} className="hover:bg-gray-50/40 transition-all duration-300">
                  <td className="pl-8 pr-4 py-5">
                    <p className="text-sm font-black text-gray-900">{record.name}</p>
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{record.course}</p>
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
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      record.status === 'PLACED' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                      record.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-5 border-t border-gray-50 flex justify-between items-center bg-gray-50/20">
          <p className="text-[11px] font-bold text-gray-400 tracking-tight">
            Showing <span className="text-gray-900 font-black italic">5</span> of <span className="text-gray-900 font-black text-xs">1,284</span> student placement records
          </p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"><ChevronLeft size={20} /></button>
            <button className="w-8 h-8 rounded-lg bg-[#000613] text-white text-xs font-black flex items-center justify-center">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-white text-gray-500 text-xs font-bold flex items-center justify-center transition-all border border-transparent hover:border-gray-100">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-white text-gray-500 text-xs font-bold flex items-center justify-center transition-all border border-transparent hover:border-gray-100">3</button>
            <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      {/* Canonical Footer */}
      <div className="flex justify-center pt-8 border-t border-gray-100 mt-12">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] font-mono">
          Academic Ivory Systems • Confidential Data Portal • 2024
        </p>
      </div>
    </div>
  );
};

export default Reports;
