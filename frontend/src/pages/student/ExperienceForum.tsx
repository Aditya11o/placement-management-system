import React, { useState } from 'react';
import { 
  Search, MessageSquare, 
  ThumbsUp, Sparkles,
  Building2,
  Plus, History, ShieldCheck, HelpCircle
} from 'lucide-react';
import { useExperiences, useToggleUpvote } from '../../hooks/useExperiences';
import { useNotification } from '../../context/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';
import ListSkeleton from '../../components/skeletons/ListSkeleton';
import EmptyState from '../../components/EmptyState';
import { formatDistanceToNow } from 'date-fns';

const ExperienceForum: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  
  const { data: experiences = [], isLoading } = useExperiences({
    search: searchTerm,
    type: activeType === 'All' ? undefined : activeType,
    difficulty: activeDifficulty === 'All' ? undefined : activeDifficulty
  });

  const toggleUpvote = useToggleUpvote();

  const types = ['All', 'Interview', 'Internship', 'Placement'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-600 bg-emerald-50';
      case 'Medium': return 'text-amber-600 bg-amber-50';
      case 'Hard': return 'text-rose-600 bg-rose-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleUpvote.mutate(id, {
      onError: () => showError('Failed to upvote'),
    });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Search Section */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-blue-950 p-8 md:p-12 text-white shadow-2xl shadow-blue-900/20">
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/50 border border-blue-800 text-[10px] font-black uppercase tracking-widest mb-6">
            <Sparkles size={14} className="text-blue-400" />
            Institutional Knowledge Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 leading-none uppercase">
            Peer Experience <span className="text-blue-400 block sm:inline">FORUM</span>
          </h1>
          <p className="text-blue-200/70 text-lg font-bold max-w-2xl leading-relaxed mb-10">
            Discover unfiltered insights from seniors and peers. Real interview questions, preparation tips, and internship stories.
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-white transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search by company, role, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-blue-900/40 border border-blue-800 rounded-2xl py-4 pl-14 pr-6 text-white placeholder:text-blue-400/50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-blue-900/60 transition-all font-bold"
              />
            </div>
            <button 
              onClick={() => navigate('/experiences/create')}
              className="px-8 py-4 bg-white text-blue-950 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-blue-50 transition-all active:scale-95 shadow-xl shadow-black/20 flex items-center justify-center gap-3"
            >
              <Plus size={18} />
              Share Experience
            </button>
          </div>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-900/20 to-transparent"></div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-800/20 rounded-full blur-3xl"></div>
      </div>

      {/* Filters Hub */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                activeType === t 
                ? 'bg-blue-950 text-white shadow-lg shadow-blue-900/20' 
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-3">Difficulty:</span>
          {difficulties.map(d => (
            <button
              key={d}
              onClick={() => setActiveDifficulty(d)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeDifficulty === d 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Feed */}
      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : experiences.length === 0 ? (
        <EmptyState 
          icon={HelpCircle}
          title="No Experiences Found" 
          description="Be the first one to share a placement insight or adjust your filters."
          actionText="Share My Journey"
          onAction={() => navigate('/experiences/create')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp: any) => (
            <Link 
              to={`/experiences/${exp.id}`}
              key={exp.id}
              className="group bg-white rounded-[2rem] border border-gray-100 p-6 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-900/5 transition-all relative flex flex-col h-full overflow-hidden"
            >
              {/* Card Meta */}
              <div className="flex items-center justify-between mb-6">
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getDifficultyColor(exp.difficulty)}`}>
                  {exp.difficulty}
                </div>
                <div className="text-[10px] font-bold text-gray-400 flex items-center gap-2">
                  <History size={14} />
                  {formatDistanceToNow(new Date(exp.createdAt), { addSuffix: true })}
                </div>
              </div>

              {/* Company & Role */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-blue-950 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <Building2 size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-blue-950 leading-tight group-hover:text-blue-600 transition-colors">{exp.companyName}</h3>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mt-0.5">{exp.role}</p>
                </div>
              </div>

              {/* Title & Glimpse */}
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900 leading-snug mb-3">{exp.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed font-medium">
                  {exp.content}
                </p>
              </div>

              {/* Questions Preview Tag */}
              {exp.questions?.length > 0 && (
                <div className="mt-6 flex items-center gap-2 px-4 py-3 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                  <HelpCircle size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">{exp.questions.length} Interview Questions Shared</span>
                </div>
              )}

              {/* Footer Interaction */}
              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={(e) => handleUpvote(exp.id, e)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${
                      exp.upvotes?.includes('currentUserPlaceholder') // Logic will be improved with user context
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <ThumbsUp size={14} />
                    <span className="text-[11px] font-black">{exp.upvotes?.length || 0}</span>
                  </button>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MessageSquare size={14} />
                    <span className="text-[11px] font-black">{exp._count?.comments || 0}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Shared By</p>
                    <p className="text-[11px] font-bold text-blue-950">{exp.isAnonymous ? 'Anonymous' : exp.student?.name}</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 overflow-hidden flex items-center justify-center shrink-0 border border-white outline outline-4 outline-gray-50">
                    {exp.isAnonymous ? (
                      <ShieldCheck size={18} className="text-blue-600" />
                    ) : exp.student?.profilePhoto ? (
                      <img src={exp.student.profilePhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 size={16} className="text-blue-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Verification Badge */}
              {exp.isVerified && (
                <div className="absolute -top-1 -right-1 p-3">
                  <div className="bg-emerald-500 text-white p-1 rounded-lg shadow-lg rotate-12" title="Verified Information">
                    <ShieldCheck size={14} />
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceForum;
