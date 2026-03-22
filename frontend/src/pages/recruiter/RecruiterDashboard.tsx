import React from 'react';
import { 
  Users, Briefcase, Calendar, 
  ArrowUpRight, Download, Filter,
  Clock, Globe
} from 'lucide-react';

const RecruiterDashboard: React.FC = () => {
  const stats = [
    { label: 'Total Jobs Posted', value: '12', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50', badge: '+2 this week' },
    { label: 'Total Applicants', value: '148', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', badge: 'Active' },
    { label: 'Shortlisted Candidates', value: '42', icon: Filter, color: 'text-purple-600', bg: 'bg-purple-50', badge: 'Top 28%' },
    { label: 'Interviews Scheduled', value: '18', icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50', badge: 'Scheduled' },
  ];

  const recentApplicants = [
    { name: 'Alex Johnson', role: 'SDE I', skills: ['Python', 'React'], status: 'Shortlisted' },
    { name: 'Marcus Chen', role: 'Backend Dev', skills: ['Node.js', 'AWS'], status: 'Applied' },
    { name: 'Emily Watson', role: 'UI Designer', skills: ['Figma', 'Tailwind'], status: 'Rejected' },
  ];

  const interviews = [
    { name: 'Sarah Smith', role: 'Product Analyst Role', date: 'OCT 24, 2024', time: '10:00 AM', mode: 'ONLINE' },
    { name: 'John D.', role: 'Sr. Frontend Architect', date: 'OCT 25, 2024', time: '02:30 PM', mode: 'OFFLINE' },
    { name: 'Michael R.', role: 'Database Admin', date: 'OCT 26, 2024', time: '11:15 AM', mode: 'ONLINE' },
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500 font-bold mt-1 tracking-tight">Welcome back. Here is what is happening with your placements today.</p>
      </div>

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
                  {recentApplicants.map((applicant, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                            <img src={`https://i.pravatar.cc/150?u=${applicant.name}`} className="w-full h-full object-cover" alt="" />
                          </div>
                          <span className="text-sm font-black text-gray-900 tracking-tight">{applicant.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-gray-500 tracking-tight">{applicant.role}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex gap-2">
                          {applicant.skills.map(skill => (
                            <span key={skill} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-black uppercase tracking-tighter">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center text-gray-400 group-hover:text-blue-600 transition-colors">
                        <button className="p-2 hover:bg-blue-50 rounded-lg transition-all">
                          <Download size={18} />
                        </button>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                          ${applicant.status === 'Shortlisted' ? 'bg-emerald-100 text-emerald-700' : 
                            applicant.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 
                            'bg-blue-100 text-blue-700'}`}>
                          {applicant.status}
                        </span>
                      </td>
                    </tr>
                  ))}
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
                      <h4 className="text-sm font-black tracking-tight">{interview.name}</h4>
                      <p className="text-[11px] font-bold text-white/40 uppercase tracking-wide mt-0.5">{interview.role}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest 
                      ${interview.mode === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-orange-500/20 text-orange-300'}`}>
                      {interview.mode}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/60">
                      <Clock size={12} />
                      {interview.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/60">
                      <Globe size={12} />
                      {interview.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-8 py-3.5 bg-white text-[#000613] rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2 relative z-10 shadow-lg active:scale-95">
              <span>View Calendar</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

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
