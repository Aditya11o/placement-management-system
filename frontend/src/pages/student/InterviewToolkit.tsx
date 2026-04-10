import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Lightbulb, 
  Target, 
  BookOpen, 
  Terminal, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp,
  Download,
  AlertCircle,
  Brain,
  Workflow,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  FileText,
  Star as StarIcon,
  ShieldCheck,
  Zap,
  Loader2
} from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';

interface ChecklistItem {
  id: string;
  category: 'Fundamentals' | 'Behavioral' | 'Technical' | 'Final Checks';
  text: string;
  completed: boolean;
  description: string;
}

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 'resume', category: 'Fundamentals', text: 'ATS-Friendly Resume', completed: false, description: 'Ensure your resume uses a clean layout and includes keywords from top job descriptions.' },
  { id: 'linkedin', category: 'Fundamentals', text: 'LinkedIn Profile Optimization', completed: false, description: 'Update your headline, about section, and ensure your experience matches your resume.' },
  { id: 'elevator', category: 'Fundamentals', text: '60-Second Elevator Pitch', completed: false, description: "Prepare a concise summary of who you are, what you've done, and what you're looking for." },
  { id: 'star-draft', category: 'Behavioral', text: 'Draft STAR Stories', completed: false, description: "Complete at least 3 stories using the SITUATION-TASK-ACTION-RESULT blueprint." },
  { id: 'values', category: 'Behavioral', text: 'Company Core Values Research', completed: false, description: "Map your experiences to the values of the companies you're targeting." },
  { id: 'dsa', category: 'Technical', text: 'DSA Top 100 Review', completed: false, description: "Review top coding patterns: Arrays, Strings, Trees, Graphs, DP." },
  { id: 'sys-design', category: 'Technical', text: 'System Design Patterns', completed: false, description: "Understand Load Balancing, Caching, Databases (SQL vs NoSQL), and Scalability." },
  { id: 'mock', category: 'Final Checks', text: 'Booked Mock Interview', completed: false, description: "Schedule a session with an alumni/mentor through the Mentorship portal." },
  { id: 'questions', category: 'Final Checks', text: 'Questions for the Interviewer', completed: false, description: "Prepare thoughtful questions about team culture and technical challenges." },
];

const STAR_STEPS = [
  { id: 's', label: 'Situation', placeholder: 'Set the scene...' },
  { id: 't', label: 'Task', placeholder: 'What was your goal?' },
  { id: 'a', label: 'Action', placeholder: 'What did YOU do?' },
  { id: 'r', label: 'Result', placeholder: 'What was the outcome?' },
];

const HR_QUESTIONS = [
  { 
    q: "Tell me about yourself.", 
    a: "Focus on the 'Past-Present-Future' model. 20% past, 60% present (skills/projects), 20% future (why this role)." 
  },
  { 
    q: "What is your greatest weakness?", 
    a: "Analyze a genuine professional growth area and explain common steps you take to manage it." 
  },
  { 
    q: "Why this company?", 
    a: "Show you've researched their recent product launches or engineering blogs." 
  }
];

const InterviewToolkit: React.FC = () => {
  // --- STATE ---
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('interview_checklist');
    return saved ? JSON.parse(saved) : INITIAL_CHECKLIST;
  });

  const [starStories, setStarStories] = useState<any[]>(() => {
    const saved = localStorage.getItem('star_stories_v2');
    return saved ? JSON.parse(saved) : [{ id: 1, title: 'Leadership Story', s: '', t: '', a: '', r: '' }];
  });
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);

  const [mockFeedback, setMockFeedback] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem('interview_checklist', JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem('star_stories_v2', JSON.stringify(starStories));
  }, [starStories]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [feedbackRes, resourceRes] = await Promise.all([
          api.get('/mock-interviews/history'),
          api.get('/resources?category=Interview')
        ]);
        setMockFeedback(feedbackRes.data.slice(0, 3)); // Latest 3
        setResources(resourceRes.data);
      } catch (err) {
        console.error('Failed to fetch toolkit data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- HANDLERS ---
  const toggleCheck = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const updateStory = (field: string, val: string) => {
    setStarStories(prev => {
      const newStories = [...prev];
      newStories[activeStoryIdx] = { ...newStories[activeStoryIdx], [field]: val };
      return newStories;
    });
  };

  const addNewStory = () => {
    if (starStories.length >= 5) {
      toast.error('Maximum 5 stories allowed');
      return;
    }
    const nextId = Math.max(0, ...starStories.map(s => s.id)) + 1;
    setStarStories([...starStories, { id: nextId, title: `New Story ${nextId}`, s: '', t: '', a: '', r: '' }]);
    setActiveStoryIdx(starStories.length);
  };

  const deleteStory = (idx: number) => {
    if (starStories.length === 1) return;
    const newStories = starStories.filter((_, i) => i !== idx);
    setStarStories(newStories);
    setActiveStoryIdx(0);
  };

  const progress = Math.round((checklist.filter(i => i.completed).length / checklist.length) * 100);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Hero / HUD */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-950 via-[#0d1b2a] to-blue-950 p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-6 text-center md:text-left flex-1">
             <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-black tracking-widest uppercase">
                <Sparkles size={14} className="mr-2 text-blue-400 animate-pulse" />
                Prep Cockpit Alpha
             </div>
             <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9]">
               MISSION <br /> <span className="text-blue-500 italic">READINESS</span>
             </h1>
             <p className="text-blue-100/60 max-w-sm text-sm font-bold uppercase tracking-wide leading-relaxed">
               Consolidated intelligence for your high-stakes interviews.
             </p>
          </div>

          <div className="flex gap-8 items-center bg-white/5 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/10 shadow-inner">
             <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Checklist</p>
                <p className="text-4xl font-black">{progress}%</p>
             </div>
             <div className="w-[2px] h-12 bg-white/10" />
             <div className="text-center space-y-2 text-emerald-400">
                <p className="text-[10px] font-black uppercase tracking-widest">Mock Feedback</p>
                <p className="text-4xl font-black">{mockFeedback.length > 0 ? 'ACTIVE' : 'NONE'}</p>
             </div>
          </div>
        </div>

        {/* HUD Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -ml-10 -mb-10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Preparation Feed & Mock Feedback (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* MOCK FEEDBACK INSIGHTS */}
          <div className="bg-white border border-gray-100 rounded-[3rem] shadow-sm overflow-hidden">
             <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <h2 className="text-2xl font-black flex items-center gap-3 italic uppercase tracking-tighter">
                   <ShieldCheck className="text-emerald-500" /> 
                   Target <span className="text-blue-600">Feedback</span>
                </h2>
                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                   Latest Sessions
                </div>
             </div>
             <div className="p-8">
                {loading ? (
                  <div className="flex items-center justify-center h-32"><Loader2 className="animate-spin text-blue-600" /></div>
                ) : mockFeedback.length > 0 ? (
                  <div className="space-y-4">
                     {mockFeedback.map((m, i) => (
                       <div key={i} className="p-5 rounded-3xl bg-gray-50 border border-gray-100 group hover:border-blue-200 transition-all">
                          <div className="flex justify-between items-start mb-3">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-blue-600 font-black">
                                   {m.performance?.overallScore || 'N/A'}
                                </div>
                                <div>
                                   <p className="text-xs font-black uppercase tracking-tight">{m.type}</p>
                                   <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(m.date).toLocaleDateString()}</p>
                                </div>
                             </div>
                             <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <FileText size={16} />
                             </div>
                          </div>
                          <p className="text-sm font-medium text-gray-600 leading-relaxed italic">
                             "{m.feedback || 'No written feedback provided yet.'}"
                          </p>
                       </div>
                     ))}
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-3 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                     <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-gray-300">
                        <MessageSquare size={32} />
                     </div>
                     <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No mock interview insights yet</p>
                     <p className="text-[10px] text-gray-400 max-w-[200px] mx-auto uppercase">Complete a mock interview to see analysis here.</p>
                  </div>
                )}
             </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-[3rem] shadow-sm">
             <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-2xl font-black flex items-center gap-3 italic uppercase tracking-tighter">
                   <CheckCircle2 className="text-blue-500" /> 
                   Execution <span className="text-blue-600">Log</span>
                </h2>
                <div className="flex gap-2">
                   {['All', 'Essential', 'Technical'].map(f => (
                     <button key={f} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${f === 'All' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                        {f}
                     </button>
                   ))}
                </div>
             </div>
             <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {checklist.map((item) => (
                     <div 
                       key={item.id} 
                       onClick={() => toggleCheck(item.id)}
                       className={`p-5 rounded-3xl border transition-all cursor-pointer group flex gap-4 ${item.completed ? 'bg-emerald-50/50 border-emerald-100 opacity-60' : 'bg-white border-gray-100 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5'}`}
                     >
                        <div className={`mt-1 h-6 w-12 rounded-full flex items-center justify-center transition-colors ${item.completed ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-300 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                           {item.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                        </div>
                        <div className="space-y-1">
                           <p className={`text-sm font-black uppercase tracking-tight ${item.completed ? 'line-through text-gray-400' : 'text-gray-900 group-hover:text-blue-600'}`}>{item.text}</p>
                           <p className="text-[10px] font-bold text-gray-400 leading-normal uppercase">{item.description}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tools & Cabinet (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* STAR DRAFTING */}
          <div className="bg-[#001d3d] text-white rounded-[3rem] shadow-2xl overflow-hidden group">
             <div className="p-8 bg-blue-600 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black flex items-center gap-2 italic uppercase tracking-tighter">
                    <Target size={24} /> STAR <span className="text-blue-100/60">Canvas</span>
                  </h3>
                  <p className="text-[9px] font-black text-blue-200 uppercase tracking-[0.2em] mt-1">Multi-Story Drafting</p>
                </div>
                <button 
                  onClick={addNewStory}
                  className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all text-white"
                >
                  <Plus size={20} />
                </button>
             </div>
             <div className="p-4 bg-blue-900/40 flex gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
                {starStories.map((s, idx) => (
                  <button 
                    key={s.id}
                    onClick={() => setActiveStoryIdx(idx)}
                    className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase whitespace-nowrap transition-all border ${idx === activeStoryIdx ? 'bg-blue-500 border-transparent shadow-lg scale-105' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                  >
                    {s.title}
                  </button>
                ))}
             </div>
             <div className="p-8 space-y-6">
                <input 
                  type="text" 
                  value={starStories[activeStoryIdx].title}
                  onChange={(e) => updateStory('title', e.target.value)}
                  className="bg-white/5 border-b border-white/10 w-full py-2 px-1 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-blue-400 transition-colors placeholder:text-white/20"
                  placeholder="Story Identifier..."
                />

                <div className="space-y-5">
                   {STAR_STEPS.map((step) => (
                     <div key={step.id} className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-blue-400/80 ml-1">{step.label}</label>
                        <textarea
                          placeholder={step.placeholder}
                          value={starStories[activeStoryIdx][step.id]}
                          onChange={(e) => updateStory(step.id, e.target.value)}
                          className="w-full h-24 p-5 rounded-3xl bg-white/5 border border-white/10 focus:border-blue-500 focus:bg-white/10 transition-all text-sm font-medium resize-none placeholder:text-white/10 custom-scrollbar outline-none text-white shadow-inner"
                        />
                     </div>
                   ))}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                        const story = starStories[activeStoryIdx];
                        const text = `STAR STORY: ${story.title}\n\n${STAR_STEPS.map(s => `${s.label.toUpperCase()}:\n${story[s.id] || '(Empty)'}`).join('\n\n')}`;
                        const blob = new Blob([text], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${story.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
                        a.click();
                    }}
                    className="flex-1 py-4 bg-blue-600 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    <Download size={16} /> Export
                  </button>
                  <button 
                    onClick={() => deleteStory(activeStoryIdx)}
                    className="p-4 bg-red-500/10 text-red-400 rounded-3xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
             </div>
          </div>

          {/* QUICK CABINET / RESOURCES */}
          <div className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm space-y-8">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-black flex items-center gap-2 italic uppercase tracking-tighter">
                   <BookOpen className="text-blue-500" /> Quick <span className="text-blue-600">Cabinet</span>
                </h3>
             </div>
             
             <div className="space-y-3">
                {loading ? (
                   <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin text-blue-600" /></div>
                ) : resources.length > 0 ? (
                  resources.map((res, i) => (
                    <div key={i} className="group p-5 rounded-3xl bg-gray-50 border border-gray-100 hover:border-blue-300 hover:bg-white transition-all cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                             <Terminal size={18} />
                          </div>
                          <div className="flex-1 overflow-hidden">
                             <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-0.5">{res.tags?.[0] || 'Technical'}</p>
                             <p className="text-xs font-black text-gray-900 truncate uppercase">{res.title}</p>
                          </div>
                          <ExternalLink size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest text-center py-4">No specific cheat sheets found.</p>
                )}
             </div>

             <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-200/50 space-y-3">
                <div className="flex items-center gap-2 text-amber-600">
                   <Zap size={18} fill="currentColor" />
                   <span className="font-black text-[10px] uppercase tracking-widest">Master Strategy</span>
                </div>
                <p className="text-[10px] text-amber-900 font-bold leading-relaxed uppercase">
                   Connect your projects to company values. Always ask "Why did you build this?" and be ready to explain trade-offs.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewToolkit;
