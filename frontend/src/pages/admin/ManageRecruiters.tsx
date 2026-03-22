import React, { useState } from 'react';
import { 
  Building2, Search, Plus, 
  Eye, Check, X, 
  Edit2, Trash2, MapPin,
  TrendingUp, ShieldCheck, 
  ArrowRight, UserPlus, ExternalLink
} from 'lucide-react';

const ManageRecruiters: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Filter by Status');
  const [industryFilter, setIndustryFilter] = useState('Filter by Industry');

  const recruiters = [
    {
      id: 1,
      company: {
        name: 'Nexus Tech Solutions',
        logo: 'NT',
        website: 'www.nexustech.io',
      },
      recruiter: {
        name: 'Sarah Jenkins',
        email: 'sarah.j@nexustech.io',
      },
      industry: 'Technology',
      location: 'San Francisco, CA',
      regDate: 'Oct 24, 2023',
      status: 'Approved',
    },
    {
      id: 2,
      company: {
        name: 'Global Health Corp',
        logo: 'GH',
        website: 'globalhealth.com',
      },
      recruiter: {
        name: 'Marcus Vane',
        email: 'm.vane@globalhealth.com',
      },
      industry: 'Healthcare',
      location: 'Boston, MA',
      regDate: 'Nov 12, 2023',
      status: 'Pending',
    },
    {
      id: 3,
      company: {
        name: 'Summit Finance',
        logo: 'SF',
        website: 'summit-fin.net',
      },
      recruiter: {
        name: 'Eliza Thorne',
        email: 'ethorne@summit-fin.net',
      },
      industry: 'Finance',
      location: 'London, UK',
      regDate: 'Nov 05, 2023',
      status: 'Rejected',
    },
    {
      id: 4,
      company: {
        name: 'Astra Ventures',
        logo: 'AV',
        website: 'astra.vc',
      },
      recruiter: {
        name: 'Kevin Durant',
        email: 'k.durant@astra.vc',
      },
      industry: 'Consulting',
      location: 'New York, NY',
      regDate: 'Nov 18, 2023',
      status: 'Approved',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Manage Recruiters</h1>
          <p className="text-sm text-gray-500 font-bold mt-1 max-w-2xl leading-relaxed">
            Approve, monitor, and manage recruitment partners. Maintain a high-quality ecosystem of corporate collaborators for the placement cell.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#000613] text-white rounded-xl font-bold text-sm shadow-lg shadow-black/10 hover:scale-105 transition-all">
          <UserPlus size={18} />
          Add New Recruiter
        </button>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="relative flex-1 w-full max-w-lg group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#000613] transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search company, recruiter, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-11 pr-4 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-[#000613] focus:ring-4 focus:ring-[#000613]/5 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-black text-gray-600 outline-none hover:bg-white transition-all appearance-none cursor-pointer"
          >
            <option>Filter by Status</option>
            <option>Approved</option>
            <option>Pending</option>
            <option>Rejected</option>
          </select>
          <select 
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-black text-gray-600 outline-none hover:bg-white transition-all appearance-none cursor-pointer"
          >
            <option>Filter by Industry</option>
            <option>Technology</option>
            <option>Healthcare</option>
            <option>Finance</option>
            <option>Consulting</option>
          </select>
          <button className="p-2.5 bg-[#000613] text-white rounded-xl shadow-lg shadow-black/10 hover:scale-105 transition-all flex items-center gap-2">
            <Plus size={18} />
            <span className="text-xs font-bold">Add New Recruiter</span>
          </button>
        </div>
      </div>

      {/* Recruiters Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Company</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Recruiter</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Industry</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Reg. Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recruiters.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400 border border-gray-50 group-hover:scale-110 transition-transform">
                        {item.company.logo}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 leading-tight">{item.company.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1">
                          {item.company.website}
                          <ExternalLink size={8} />
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-xs font-black text-gray-700 leading-tight">{item.recruiter.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 italic">{item.recruiter.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-600">{item.industry}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                      <MapPin size={12} className="text-gray-300" />
                      {item.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-400 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-black">{item.regDate.split(',')[0]}</span>
                      <span className="text-[10px]">{item.regDate.split(',')[1]}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      item.status === 'Pending' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                      'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      {item.status === 'Pending' ? (
                        <>
                          <button title="Approve" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Check size={16} /></button>
                          <button title="Reject" className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><X size={16} /></button>
                        </>
                      ) : (
                        <button title="View Portfolio" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={16} /></button>
                      )}
                      <button title="Edit" className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                      <button title="Delete" className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center">
          <p className="text-[11px] font-bold text-gray-400">Showing <span className="text-gray-900 font-black">1-4</span> of <span className="text-gray-900 font-black">42</span> recruiters</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">Previous</button>
            <button className="w-8 h-8 rounded-lg bg-[#000613] text-white text-xs font-black shadow-lg shadow-black/10 flex items-center justify-center">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center transition-colors">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center transition-colors">3</button>
            <span className="text-gray-300 px-1">...</span>
            <button className="w-8 h-8 rounded-lg hover:bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center transition-colors">11</button>
            <button className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Bottom Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Partners */}
        <div className="bg-[#000613] rounded-3xl p-6 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Partners</p>
              <h3 className="text-5xl font-black text-white mb-4 tracking-tighter">124</h3>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-black">
                <TrendingUp size={16} />
                +12% from last month
              </div>
            </div>
          </div>
          {/* Decorative Cityscape/Tech Silhouette */}
          <div className="absolute bottom-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Building2 size={120} className="text-white" />
          </div>
        </div>

        {/* Waitlist Queue */}
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 flex flex-col justify-between group hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Waitlist Queue</p>
            <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">18</h3>
            <p className="text-xs text-gray-500 font-bold leading-relaxed max-w-[200px]">
              Applications pending review for the upcoming placement cycle
            </p>
          </div>
          <button className="mt-6 flex items-center gap-2 text-xs font-black text-[#000613] hover:gap-4 transition-all">
            Review Pending <ArrowRight size={14} />
          </button>
        </div>

        {/* Compliance Score */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Compliance Score</p>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-16 h-16 flex items-center justify-center">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="175.9" strokeDashoffset="3.5" className="text-emerald-500" />
                 </svg>
                 <span className="absolute text-xs font-black text-gray-900">98%</span>
              </div>
              <div>
                <p className="text-sm font-black text-gray-900">Excellent</p>
                <p className="text-[10px] font-bold text-gray-400">Profile completion rate</p>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: '98%' }}></div>
          </div>
          {/* Decorative Shield */}
          <div className="absolute top-4 right-4 text-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity">
            <ShieldCheck size={40} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageRecruiters;
