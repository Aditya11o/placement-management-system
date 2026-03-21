import React, { useState } from 'react';
import { 
  Briefcase, Search, MapPin, DollarSign, 
  ChevronDown, Bookmark, CheckCircle, 
  BookmarkCheck, Sparkles, AlertCircle, FileText
} from 'lucide-react';

const JobFeed: React.FC = () => {
  const [jobType, setJobType] = useState<'full-time' | 'intern' | 'all'>('all');

  // Mock data
  const stats = [
    { label: 'Total Jobs', value: '124', subLabel: '12% from last week', icon: Briefcase, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'New Jobs', value: '18', subLabel: 'Posted today', icon: Sparkles, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { label: 'Jobs Applied', value: '12', subLabel: 'Active tracking', icon: CheckCircle, iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
    { label: 'Closing Soon', value: '05', subLabel: 'Action required', icon: AlertCircle, iconBg: 'bg-rose-50', iconColor: 'text-rose-600' },
  ];

  const jobs = [
    {
      id: 1,
      title: 'Software Development Intern',
      company: 'Google',
      logo: 'https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png',
      salary: '$8,500 / mo',
      location: 'Seattle, WA',
      type: 'INTERNSHIP',
      cgpa: '8.5+ CGPA',
      skills: ['Python', 'Distributed Systems', 'C++'],
      deadline: 'Oct 30, 2023',
      status: 'Open',
      bookmarked: false
    },
    {
      id: 2,
      title: 'SDE - Cloud Services',
      company: 'Amazon',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg',
      salary: '$145k / yr',
      location: 'Remote',
      type: 'FULL-TIME',
      cgpa: '8.0+ CGPA',
      skills: ['AWS', 'Java', 'Go'],
      deadline: 'Oct 12, 2023',
      status: 'Applied',
      bookmarked: true
    },
    {
      id: 3,
      title: 'Product Manager Intern',
      company: 'Microsoft',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
      salary: '$7,000 / mo',
      location: 'Redmond, WA',
      type: 'INTERNSHIP',
      cgpa: '7.5+ CGPA',
      skills: ['Product Strategy', 'Data Analysis'],
      deadline: 'Oct 05, 2023',
      status: 'Closed',
      bookmarked: false
    },
    {
      id: 4,
      title: 'Senior Data Engineer',
      company: 'Netflix',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
      salary: '$190k / yr',
      location: 'Los Gatos, CA',
      type: 'FULL-TIME',
      cgpa: '9.0+ CGPA',
      skills: ['Spark', 'Kubernetes', 'Scala'],
      deadline: 'Nov 15, 2023',
      status: 'Trending',
      bookmarked: false
    },
    {
      id: 5,
      title: 'UI/UX Product Designer',
      company: 'Dropbox',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg',
      salary: '$120k / yr',
      location: 'Remote',
      type: 'FULL-TIME',
      cgpa: 'Portfolio Required',
      skills: ['Figma', 'User Research'],
      deadline: 'Oct 25, 2023',
      status: 'Open',
      bookmarked: false
    },
    {
      id: 6,
      title: 'Backend Engineer (Node.js)',
      company: 'Spotify',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
      salary: '$155k / yr',
      location: 'New York, NY',
      type: 'FULL-TIME',
      cgpa: '8.2+ CGPA',
      skills: ['Node.js', 'PostgreSQL', 'Redis'],
      deadline: 'Nov 02, 2023',
      status: 'Open',
      bookmarked: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      
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

      {/* Filter Bar Inside One Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Job Role</label>
            <div className="relative">
              <select className="w-full border border-gray-100 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50 appearance-none pr-10">
                <option>All Roles</option>
                <option>SDE</option>
                <option>Product Manager</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
          </div>

          <div className="flex-[1.5] min-w-[200px]">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Company Name</label>
            <div className="relative">
              <input type="text" placeholder="Search companies..." className="w-full border border-gray-100 rounded-xl px-10 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Location</label>
            <div className="relative">
              <select className="w-full border border-gray-100 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50 appearance-none pr-10">
                <option>All Locations</option>
                <option>Remote</option>
                <option>Seattle, WA</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
          </div>

          <div className="flex-1 min-w-[120px]">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Package</label>
            <div className="relative">
              <select className="w-full border border-gray-100 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50 appearance-none pr-10">
                <option>Any Range</option>
                <option>10LPA+</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
          </div>

          <div className="min-w-[180px]">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Job Type</label>
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1 h-[38px] items-center">
              <button 
                onClick={() => setJobType('all')}
                className={`flex-1 h-full px-3 text-[10px] font-black uppercase tracking-tighter rounded-lg transition-all ${jobType === 'all' ? 'bg-blue-950 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                All
              </button>
              <button 
                onClick={() => setJobType('full-time')}
                className={`flex-1 h-full px-3 text-[10px] font-black uppercase tracking-tighter rounded-lg transition-all ${jobType === 'full-time' ? 'bg-blue-950 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                Full-Time
              </button>
              <button 
                onClick={() => setJobType('intern')}
                className={`flex-1 h-full px-3 text-[10px] font-black uppercase tracking-tighter rounded-lg transition-all ${jobType === 'intern' ? 'bg-blue-950 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                Intern
              </button>
            </div>
          </div>

          <button className="bg-blue-950 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95 h-[38px] flex items-center justify-center">
            Filter Results
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 flex flex-col hover:shadow-lg transition-all relative group h-full">
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-xl border border-gray-100 p-2 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  <img src={job.logo} alt={job.company} className="max-w-full max-h-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{job.title}</h3>
                    {job.status === 'Closed' && <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded tracking-tighter border border-rose-100">Closed</span>}
                    {job.status === 'Trending' && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded tracking-tighter border border-blue-100 italic">Trending</span>}
                  </div>
                  <p className="text-gray-400 text-xs font-bold leading-none">{job.company}</p>
                </div>
              </div>
              <button className={`p-2 rounded-lg transition-all ${job.bookmarked ? 'text-blue-600' : 'text-gray-200 hover:text-blue-500'}`}>
                {job.bookmarked ? <BookmarkCheck size={20} fill="currentColor" /> : <Bookmark size={20} />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-y-3 mb-6 bg-gray-50/50 rounded-xl p-4 border border-gray-50">
              <div className="flex items-center gap-2.5 text-gray-600">
                <DollarSign size={14} className="text-gray-400" />
                <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">{job.salary}</p>
              </div>
              <div className="flex items-center gap-2.5 text-gray-600">
                <MapPin size={14} className="text-gray-400" />
                <p className="text-xs font-bold text-gray-500">{job.location}</p>
              </div>
              <div className="flex items-center gap-2.5 text-gray-600">
                <FileText size={14} className="text-gray-400" />
                <p className="text-xs font-bold text-gray-500">{job.cgpa}</p>
              </div>
              <div className="flex items-center gap-2.5 text-gray-600">
                <Briefcase size={14} className="text-gray-400" />
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${job.type === 'INTERNSHIP' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>{job.type}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-6">
              {job.skills.map((skill, i) => (
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
                <span className={`text-xs font-black ${job.status === 'Applied' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {job.status === 'Applied' ? 'Successfully Applied' : job.deadline}
                </span>
              </div>
              
              <div className="flex gap-2">
                <button className="px-5 py-2 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-all">
                  View Details
                </button>
                {job.status === 'Applied' ? (
                  <button disabled className="px-6 py-2 bg-gray-100 text-gray-400 rounded-xl text-[11px] font-black uppercase tracking-widest cursor-not-allowed">
                    Applied
                  </button>
                ) : job.status === 'Closed' ? (
                  <button disabled className="px-6 py-2 bg-gray-50 text-gray-300 rounded-xl text-[11px] font-black uppercase tracking-widest cursor-not-allowed">
                    Closed
                  </button>
                ) : (
                  <button className="px-6 py-2 bg-blue-950 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black shadow-md shadow-blue-900/10 active:scale-95 transition-all">
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Container */}
      <div className="mt-8 flex flex-col items-center gap-3 pb-8">
        <button className="group flex items-center gap-3 bg-white border border-gray-200 px-10 py-3 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all active:scale-95">
          <span className="text-xs font-black text-gray-900 tracking-widest uppercase">Load More Opportunities</span>
          <ChevronDown className="text-gray-400 group-hover:text-blue-500 transition-colors animate-bounce" size={18} />
        </button>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing <span className="text-gray-900 font-black">6</span> of <span className="text-gray-900 font-black">124</span> jobs available</p>
      </div>

    </div>
  );
};

export default JobFeed;
