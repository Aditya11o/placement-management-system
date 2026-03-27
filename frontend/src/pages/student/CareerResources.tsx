import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  FileText, Clock, 
  Sparkles, Loader2, CheckCircle2, 
  Play, Download, MessageSquare,
  Video, Award,
  ArrowUpRight, Users
} from 'lucide-react';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

const CareerPrepHub: React.FC = () => {
  const navigate = useNavigate();
  const { showError } = useNotification();
  const [profile, setProfile] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);



  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, resourcesRes, announcementsRes] = await Promise.all([
        api.get('/profile/me'),
        api.get('/resources'),
        api.get('/notifications?isBroadcast=true&limit=3')
      ]);
      setProfile(profileRes.data);
      setResources(resourcesRes.data);
      setAnnouncements(announcementsRes.data);
    } catch (err) {
      console.error(err);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);



  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  const interviewModules = [
    { title: 'Technical Rounds', desc: 'Data structures, algorithms, and domain-specific concepts.', icon: <ArrowUpRight size={20} />, path: '/student/resources/technical' },
    { title: 'HR Questions', desc: 'Behavioral questions, culture-fit, and communication tips.', icon: <Users size={20} />, path: '/student/resources/hr' },
    { title: 'Aptitude Prep', desc: 'Quantitative, logical reasoning, and verbal ability modules.', icon: <Award size={20} />, path: '/student/resources/aptitude' },
    { title: 'Group Discussion', desc: 'Mock sessions, trending topics, and etiquette training.', icon: <MessageSquare size={20} />, path: '/student/resources/gd' },
  ];

  return (
    <div className="space-y-10 pb-12">
      
      {/* Page Title Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] italic">
          <Sparkles size={14} /> The Digital Curator
        </div>
        <h1 className="text-4xl font-black text-[#000613] tracking-tight uppercase italic">Career <span className="opacity-40">Prep Hub</span></h1>
        <p className="text-gray-400 text-sm font-medium max-w-2xl">
          Your editorial-grade workspace for placement excellence. Curate your profile, master technical interviews, and track your progress toward your dream role.
        </p>
      </div>

      {/* 1. Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Resume Status', value: (profile?.resume_path || profile?.resume) ? 'Completed' : 'Pending', icon: <CheckCircle2 size={18} className="text-green-500" />, sub: 'ATS Friendly' },
          { label: 'Aptitude Prep', value: profile?.aptitude_prep_status || 'Not Started', icon: <Play size={18} className="text-blue-500" />, sub: 'Mock tests' },
          { label: 'Interview Prep', value: profile?.interview_prep_status || 'Not Started', icon: <Video size={18} className="text-purple-500" />, sub: 'Mock calls' },
          { label: 'Profile Completion', value: `${profile?.profile_completion || 0}%`, isProgress: true, sub: 'Target 100%' }
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-[0_12px_32px_rgba(0,31,63,0.06)] border border-transparent hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 group cursor-default">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</span>
              {card.icon}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xl font-black text-[#000613] italic uppercase">{card.value}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{card.sub}</span>
            </div>
            {card.isProgress && (
              <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#000613] rounded-full transition-all duration-1000" 
                  style={{ width: `${profile?.profile_completion || 0}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: 2 & 3 */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col md:flex-row gap-12 relative overflow-hidden group min-h-[400px] items-center justify-center text-center">
            <div className="space-y-6 max-w-xl">
              <h2 className="text-3xl font-black text-[#000613] italic uppercase leading-none mb-4 underline decoration-blue-600/20 underline-offset-8">Career <span className="text-blue-600">Excellence</span></h2>
              <p className="text-gray-400 text-sm font-medium leading-relaxed">
                Elevate your professional identity with our curated collection of interview modules, technical preparation guides, and industry masterclasses. Your placement journey starts with mastering the fundamentals.
              </p>
              <div className="flex justify-center pt-4">
                 <button 
                  onClick={() => navigate('/student/settings')}
                  className="bg-[#000613] text-white px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-black/20 hover:bg-blue-600 hover:-translate-y-1 active:scale-95 transition-all"
                >
                  Manage Your Profile & Resume
                 </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 4. Announcements */}
        <div 
          onClick={() => navigate('/student/announcements')}
          className="bg-[#000613] rounded-[3rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group cursor-pointer hover:shadow-blue-900/10 hover:-translate-y-1 transition-all duration-500"
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all"></div>
          <div className="relative z-10 flex flex-col h-full">
            <h2 className="text-2xl font-black italic uppercase mb-8 text-gray-100 tracking-tight">Announcements</h2>
            
            <div className="flex-1 space-y-8">
              {announcements.length > 0 ? announcements.map((ann: any, i: number) => (
                <div key={i} className="space-y-3 group/item">
                  <span className="inline-block px-2.5 py-1 bg-blue-600/20 text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-lg border border-blue-600/30">
                    {ann.type || 'PLACEMENT'}
                  </span>
                  <h4 className="text-sm font-black italic uppercase leading-tight group-hover/item:text-blue-400 transition-colors">{ann.title}</h4>
                  <p className="text-[10px] text-gray-400 font-bold tracking-wide italic leading-relaxed">
                    {ann.message.substring(0, 80)}...
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                    <Clock size={10} /> {new Date(ann.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center text-gray-500 italic font-bold">No active announcements</div>
              )}
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); navigate('/student/announcements'); }}
              className="w-full mt-8 py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all"
            >
              View All Notices
            </button>
          </div>
        </div>
      </div>

      {/* 5. Interview Mastery Sections */}
      <div className="space-y-8 pt-12">
        <div className="flex justify-between items-end border-b-2 border-gray-100 pb-6">
          <div>
            <h2 className="text-3xl font-black text-[#000613] italic uppercase tracking-tighter">Interview <span className="opacity-30">Mastery</span></h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Focused content modules for every stage</p>
          </div>
          <button 
            onClick={() => navigate('/student/resources/all')}
            className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors border-b-2 border-transparent hover:border-blue-600 pb-1 italic"
          >
            Full Curriculum
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {interviewModules.map((mod, i) => (
            <div 
              key={i} 
              onClick={() => navigate(mod.path)}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-[#000613] group-hover:text-white transition-all mb-6">
                {mod.icon}
              </div>
              <h3 className="text-lg font-black text-[#000613] italic uppercase mb-3">{mod.title}</h3>
              <p className="text-[11px] text-gray-400 font-bold leading-relaxed mb-8">
                {mod.desc}
              </p>
              <button className="w-full py-3 bg-gray-50 group-hover:bg-blue-600 group-hover:text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all">
                View Content
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Video Masterclass Section */}
      <div className="space-y-8 pt-12">
        <h2 className="text-2xl font-black text-[#000613] italic uppercase">Video <span className="opacity-30">Masterclass</span></h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.filter((r: any) => r.type === 'Video').map((video: any, i: number) => (
            <div key={i} className="group cursor-pointer space-y-4">
              <div className="aspect-video bg-gray-200 rounded-[2.5rem] relative overflow-hidden shadow-lg group-hover:shadow-2xl transition-all">
                <img 
                  src={video.thumbnail || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop`} 
                  alt={video.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#000613] shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                    <Play size={24} className="ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-6 right-6 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-widest italic">
                  {video.duration || '00:00'}
                </div>
              </div>
              <div className="px-2">
                <h4 className="text-lg font-black text-[#000613] italic uppercase leading-tight mb-1 group-hover:text-blue-600 transition-colors">{video.title}</h4>
                <p className="text-[10px] text-gray-400 font-bold italic uppercase tracking-wider">
                  By {video.instructor || 'Campus Expert'} • {video.addedBy?.role || 'Authority'}
                </p>
              </div>
            </div>
          ))}
          {resources.filter((r: any) => r.type === 'Video').length === 0 && (
            <div className="col-span-12 py-12 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100 italic font-bold text-gray-400 uppercase tracking-widest">
              Check back for new masterclasses
            </div>
          )}
        </div>
      </div>

      {/* 7. Curated Resources Section */}
      <div className="bg-gray-50 rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-inner">
        <div className="flex items-center gap-3 mb-10">
          <BookOpen size={24} className="text-[#000613]" />
          <h2 className="text-2xl font-black text-[#000613] italic uppercase leading-none">Curated <span className="opacity-30">Resources</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.filter((r: any) => r.type === 'File' && r.category === 'Curated Resources').map((res: any, i: number) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] flex items-center justify-between group hover:shadow-xl hover:-translate-y-1 transition-all border border-transparent hover:border-blue-100 cursor-default">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#000613] italic uppercase group-hover:text-blue-600 transition-colors">{res.title}</h4>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate max-w-[150px]">
                    {res.tags?.join(' • ') || 'Resource Guide'} • {res.duration || 'Portable PDF'}
                  </p>
                </div>
              </div>
              <a 
                href={res.content} 
                download 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white transition-all active:scale-90"
              >
                <Download size={18} />
              </a>
            </div>
          ))}
          
          <div 
            onClick={() => navigate('/student/resources/all')}
            className="bg-[#000613] p-6 rounded-[2rem] flex items-center justify-center group cursor-pointer shadow-xl shadow-black/20 hover:bg-blue-600 hover:-translate-y-1 transition-all"
          >
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic mr-2">Explore All Resources</span>
            <ArrowUpRight size={18} className="text-blue-400 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-12 pb-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start group cursor-default">
          <span className="text-lg font-black text-[#000613] italic tracking-tight uppercase">The Digital <span className="text-blue-600 group-hover:underline underline-offset-4">Curator</span></span>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Official Placement Management System v3.2.0</p>
        </div>
        <div className="flex gap-8">
          {[
            { name: 'Terms of Use', path: '/terms' },
            { name: 'Privacy Policy', path: '/privacy' },
            { name: 'Support Hub', path: '/support' }
          ].map(link => (
            <button 
              key={link.name} 
              onClick={() => navigate(link.path)}
              className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] hover:text-blue-600 transition-colors italic border-b border-transparent hover:border-blue-600 pb-0.5"
            >
              {link.name}
            </button>
          ))}
        </div>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest select-none">© 2024 University Academic Authority</p>
      </div>

    </div>
  );
};

export default CareerPrepHub;
