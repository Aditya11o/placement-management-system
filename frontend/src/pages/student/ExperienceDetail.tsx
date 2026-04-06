import React, { useState } from 'react';
import { 
  Building2, GraduationCap, 
  ThumbsUp, 
  ChevronLeft, Share2, ShieldCheck,
  HelpCircle, Sparkles, Send, Bookmark, AlertCircle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExperience, useToggleUpvote, useAddComment } from '../../hooks/useExperiences';
import { useNotification } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import ListSkeleton from '../../components/skeletons/ListSkeleton';

const ExperienceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  const { data: exp, isLoading } = useExperience(id!);
  const upvoteMutation = useToggleUpvote();
  const commentMutation = useAddComment();
  
  const [newComment, setNewComment] = useState('');

  const handleUpvote = () => {
    upvoteMutation.mutate(id!, {
      onError: () => showError('Failed to upvote'),
    });
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    commentMutation.mutate({ id: id!, content: newComment }, {
      onSuccess: () => {
        setNewComment('');
        showSuccess('Comment added successfully!');
      },
      onError: () => showError('Failed to add comment'),
    });
  };

  if (isLoading) return <ListSkeleton rows={3} />;
  if (!exp) return <div>Experience not found</div>;

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-600 bg-emerald-50';
      case 'Medium': return 'text-amber-600 bg-amber-50';
      case 'Hard': return 'text-rose-600 bg-rose-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate('/experiences')}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-950 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"
        >
          <ChevronLeft size={16} />
          Back to Hub
        </button>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 transition-colors shadow-sm">
            <Share2 size={18} />
          </button>
          <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 transition-colors shadow-sm">
            <Bookmark size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-2xl shadow-blue-900/5 relative overflow-hidden">
            <div className="relative z-10">
               {/* Hero Info */}
               <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-950 shadow-inner">
                  <Building2 size={40} />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-blue-950 uppercase tracking-tighter leading-none">{exp.companyName}</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-sm font-black text-blue-600 uppercase tracking-widest">{exp.role}</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                    <p className="text-sm font-bold text-gray-400">{exp.batch} Batch</p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-black text-gray-900 leading-tight mb-6">{exp.title}</h2>
              
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-600 leading-relaxed font-semibold whitespace-pre-wrap">
                  {exp.content}
                </p>
              </div>

              {/* Tips Section */}
              {exp.tips && (
                <div className="mt-12 bg-amber-50/50 border border-amber-100 rounded-[2rem] p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles size={20} className="text-amber-600" />
                    <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest">Preparation Strategy</h3>
                  </div>
                  <p className="text-sm text-amber-800/80 font-bold leading-relaxed italic">
                    "{exp.tips}"
                  </p>
                </div>
              )}
            </div>
            
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16"></div>
          </div>

          {/* Social Interactions Section */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-2xl shadow-blue-900/5">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-blue-950 uppercase tracking-tighter">Collective Wisdom ({exp.comments?.length || 0})</h3>
                <div className="flex items-center gap-4">
                   <button 
                    onClick={handleUpvote}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${
                      exp.upvotes?.includes('currentUser') // Logic placeholder
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                   >
                     <ThumbsUp size={18} />
                     <span className="text-[11px] font-black">{exp.upvotes?.length || 0} Helpful</span>
                   </button>
                </div>
             </div>

             {/* Comment Form */}
             <form onSubmit={handleComment} className="relative mb-10">
                <input 
                  type="text"
                  placeholder="Ask a clarifying question or say thanks..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-6 pr-14 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-blue-950"
                />
                <button 
                  type="submit"
                  disabled={commentMutation.isPending}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-950 text-white rounded-xl hover:bg-black transition-all"
                >
                  <Send size={18} />
                </button>
             </form>

             {/* Comments Thread */}
             <div className="space-y-6">
                {(exp.comments || []).map((comment: any) => (
                  <div key={comment.id} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                      {comment.user?.profilePhoto ? (
                        <img src={comment.user.profilePhoto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 font-black text-xs uppercase">
                          {comment.user?.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-black text-blue-950 uppercase tracking-tight">{comment.user?.name}</span>
                        <span className="text-[9px] font-bold text-gray-400">{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                      </div>
                      <p className="text-sm text-gray-600 font-bold leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
           {/* Difficulty Card */}
           <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-xl shadow-blue-950/5">
              <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-6 block text-center">Intensity Score</h3>
              <div className="flex flex-col items-center">
                <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-4 rotate-12 shadow-inner ${getDifficultyColor(exp.difficulty)}`}>
                  <AlertCircle size={40} />
                </div>
                <p className="text-2xl font-black text-blue-950 uppercase">{exp.difficulty}</p>
                <p className="text-[10px] font-bold text-gray-400 mt-2 text-center uppercase tracking-wider">Perceived Interview Difficulty</p>
              </div>
           </div>

           {/* Questions Card */}
           {exp.questions?.length > 0 && (
            <div className="bg-blue-950 rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-900/20">
              <div className="flex items-center gap-3 mb-8">
                <HelpCircle size={20} className="text-blue-400" />
                <h3 className="text-sm font-black uppercase tracking-widest leading-none">Core Questions</h3>
              </div>
              <div className="space-y-4">
                {exp.questions.map((q: string, i: number) => (
                  <div key={i} className="group cursor-default">
                    <p className="text-xs font-bold text-blue-200/60 uppercase tracking-widest mb-1">Round {i + 1}</p>
                    <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">{q}</p>
                  </div>
                ))}
              </div>
            </div>
           )}

           {/* Author Info */}
           <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100/50">
             <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-6 block text-center">Shared By</h3>
             <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-3xl p-1 shadow-xl mb-4">
                  <div className="w-full h-full rounded-2xl bg-blue-950 overflow-hidden flex items-center justify-center">
                    {exp.isAnonymous ? (
                      <ShieldCheck size={32} className="text-blue-400" />
                    ) : exp.student?.profilePhoto ? (
                      <img src={exp.student.profilePhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <GraduationCap size={32} className="text-blue-400" />
                    )}
                  </div>
                </div>
                <p className="text-lg font-black text-blue-950 uppercase tracking-tighter">{exp.isAnonymous ? 'ANONYMOUS' : exp.student?.name}</p>
                {!exp.isAnonymous && (
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Verified Student</p>
                )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetail;
