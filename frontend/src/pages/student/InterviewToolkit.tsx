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
  ExternalLink
} from 'lucide-react';

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
  { id: 'star', category: 'Behavioral', text: '5 STAR Stories Ready', completed: false, description: "Draft 5 stories (Leadership, Failure, Conflict, Achievement, Technical) using the STAR method." },
  { id: 'values', category: 'Behavioral', text: 'Company Core Values Research', completed: false, description: "Map your experiences to the values of the companies you're targeting." },
  { id: 'dsa', category: 'Technical', text: 'DSA Blind 75 / Top 100', completed: false, description: "Review top coding patterns: Arrays, Strings, Trees, Graphs, DP." },
  { id: 'projects', category: 'Technical', text: 'Deep Project Knowledge', completed: false, description: "Be ready to explain every technical decision made in your top 2 projects." },
  { id: 'mock', category: 'Final Checks', text: '1 Recorded Mock Interview', completed: false, description: "Record yourself answering questions to analyze your body language and tone." },
  { id: 'questions', category: 'Final Checks', text: '3 Questions for the Interviewer', completed: false, description: "Prepare thoughtful questions about team culture, technical stack, or company growth." },
];

const STAR_TEMPLATE = [
  { id: 's', label: 'Situation', placeholder: 'Set the scene: What was the goal? Who was involved?' },
  { id: 't', label: 'Task', placeholder: 'What was your specific responsibility in that situation?' },
  { id: 'a', label: 'Action', placeholder: 'What did YOU do? What tools/skills did you use? (Most important part)' },
  { id: 'r', label: 'Result', placeholder: 'What was the outcome? Use numbers if possible (e.g., speed up by 20%)' },
];

const HR_QUESTIONS = [
  { 
    q: "Tell me about yourself.", 
    a: "Focus on the 'Past-Present-Future' model. 20% past (education/early interest), 60% present (current skills/major projects), 20% future (why this role/company specifically). Avoid listing personal hobbies unless they tie to tech." 
  },
  { 
    q: "What is your greatest weakness?", 
    a: "Pick a genuine professional weakness (e.g., perfectionism, public speaking, overly technical focus). Explain how you RECOGNIZE it and what specific steps you are taking to OVERCOME it." 
  },
  { 
    q: "Why should we hire you?", 
    a: "Align your unique value proposition with the company's biggest pain point. Show you've done research on their recent challenges and explain how your skills address them directly." 
  },
  { 
    q: "Describe a conflict with a teammate.", 
    a: "Focus on professional resolution, not personal blame. Show empathy, active listening, and how you reached a compromise that moved the project forward." 
  }
];

const CHEAT_SHEETS = [
  { title: "React Lifecycle & Hooks", tag: "Frontend", icon: Brain },
  { title: "System Design Basics", tag: "Fullstack", icon: Workflow },
  { title: "SQL Joins & Indexing", tag: "Database", icon: Target },
  { title: "OOP Principles", tag: "CS Core", icon: Terminal },
];

const InterviewToolkit: React.FC = () => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('interview_checklist');
    return saved ? JSON.parse(saved) : INITIAL_CHECKLIST;
  });

  const [starStories, setStarStories] = useState<{ [key: string]: string }>(() => {
    const saved = localStorage.getItem('star_stories');
    return saved ? JSON.parse(saved) : {};
  });

  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('interview_checklist', JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem('star_stories', JSON.stringify(starStories));
  }, [starStories]);

  const toggleCheck = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleStarChange = (field: string, value: string) => {
    setStarStories(prev => ({ ...prev, [field]: value }));
  };

  const progress = Math.round((checklist.filter(i => i.completed).length / checklist.length) * 100);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-widest uppercase">
              <Sparkles size={14} className="mr-2 text-yellow-400" />
              Interview Mission Control
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Premium Prep <br /> <span className="text-blue-400">Toolkit 2.0</span>
            </h1>
            <p className="text-blue-100/70 max-w-md text-lg font-medium">
              Transform your anxiety into action. Your end-to-end cockpit for interview readiness.
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-4 bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 w-full md:w-auto min-w-[280px]">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={364}
                  strokeDashoffset={364 - (364 * progress) / 100}
                  className="text-blue-400 transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black">{progress}%</span>
                <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Ready</span>
              </div>
            </div>
            <p className="font-bold text-sm text-center">Complete your checklist <br /> to reach 100%</p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500/20 blur-[100px] rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Readiness Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--surface-container-low)] rounded-[2.5rem] border border-[var(--outline-variant)] shadow-sm overflow-hidden">
            <div className="p-8 border-b border-[var(--outline-variant)]/50 bg-gradient-to-r from-transparent to-[var(--surface-container-high)]/30">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <CheckCircle2 className="text-primary" />
                Readiness Tracker
              </h2>
            </div>
            <div className="p-4 md:p-8 space-y-2">
              {['Fundamentals', 'Behavioral', 'Technical', 'Final Checks'].map((cat) => (
                <div key={cat} className="space-y-2 mb-6 last:mb-0">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)]/60 px-4 mb-3">{cat}</h3>
                  <div className="space-y-2">
                    {checklist.filter(item => item.category === cat).map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => toggleCheck(item.id)}
                        className={`group flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                          item.completed 
                            ? 'bg-green-500/5 border-green-500/20 opacity-75' 
                            : 'bg-[var(--surface-container)] border-[var(--outline-variant)]/50 hover:border-primary/30 hover:shadow-md'
                        }`}
                      >
                        <div className={`mt-1 transition-colors ${item.completed ? 'text-green-500' : 'text-[var(--on-surface-variant)] group-hover:text-primary'}`}>
                          {item.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                        </div>
                        <div className="space-y-1">
                          <p className={`font-bold text-sm transition-all ${item.completed ? 'line-through text-[var(--on-surface-variant)]' : 'text-[var(--on-surface)]'}`}>
                            {item.text}
                          </p>
                          <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HR Questions Bank */}
          <div className="bg-[var(--surface-container-low)] rounded-[2.5rem] border border-[var(--outline-variant)] shadow-sm overflow-hidden">
            <div className="p-8 border-b border-[var(--outline-variant)]/50">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <MessageSquare className="text-secondary" />
                Power Question Bank
              </h2>
            </div>
            <div className="p-8 space-y-4">
              {HR_QUESTIONS.map((q, idx) => (
                <div 
                  key={idx}
                  className="rounded-2xl border border-[var(--outline-variant)]/50 overflow-hidden bg-[var(--surface-container)]"
                >
                  <button 
                    onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-[var(--surface-container-high)] transition-colors"
                  >
                    <span className="font-bold text-sm">{q.q}</span>
                    <div className="p-1 rounded-lg bg-[var(--surface-container-highest)]">
                      {expandedQuestion === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>
                  {expandedQuestion === idx && (
                    <div className="p-6 border-t border-[var(--outline-variant)]/30 bg-[var(--surface-container-low)] animate-in slide-in-from-top-2 duration-300">
                      <div className="flex gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl h-fit">
                          <Lightbulb className="text-blue-600" size={20} />
                        </div>
                        <div className="space-y-3">
                          <p className="p-1 px-2.5 rounded-md bg-blue-500/10 text-blue-700 text-[10px] font-black uppercase tracking-wider w-fit">Expert Strategry</p>
                          <p className="text-sm leading-relaxed text-[var(--on-surface-variant)] font-medium italic">
                            "{q.a}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STAR Blueprint & Cheat Sheets */}
        <div className="space-y-8">
          {/* STAR Method Guide */}
          <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-xl shadow-blue-900/5 rotate-1">
            <div className="p-8 bg-blue-600 rounded-t-[2.5rem] text-white space-y-2">
              <h3 className="text-xl font-black flex items-center gap-2">
                <Target size={24} />
                STAR Blueprint
              </h3>
              <p className="text-xs text-blue-100 font-medium">Draft your stories for precision delivery.</p>
            </div>
            <div className="p-8 space-y-6">
              {STAR_TEMPLATE.map((step) => (
                <div key={step.id} className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">{step.label}</label>
                  <textarea
                    placeholder={step.placeholder}
                    value={starStories[step.id] || ''}
                    onChange={(e) => handleStarChange(step.id, e.target.value)}
                    className="w-full h-24 p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-blue-500 focus:bg-white transition-all text-sm font-medium resize-none placeholder:text-gray-400 custom-scrollbar outline-none"
                  />
                </div>
              ))}
              <button 
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
                onClick={() => {
                  const text = `STAR STORY\n\n${STAR_TEMPLATE.map(s => `${s.label.toUpperCase()}:\n${starStories[s.id] || '(Empty)'}`).join('\n\n')}`;
                  const blob = new Blob([text], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'star-story-draft.txt';
                  a.click();
                }}
              >
                <Download size={18} />
                Save Draft (.txt)
              </button>
            </div>
          </div>

          {/* Quick Cheat Sheets */}
          <div className="bg-[var(--surface-container-low)] rounded-[2.5rem] border border-[var(--outline-variant)] shadow-sm p-8 space-y-6">
            <h3 className="text-xl font-black flex items-center gap-2">
              <BookOpen className="text-primary" />
              Quick Cabinet
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {CHEAT_SHEETS.map((sheet, i) => {
                const Icon = sheet.icon;
                return (
                  <div key={i} className="group p-4 rounded-2xl bg-[var(--surface-container)] border border-[var(--outline-variant)]/50 hover:border-primary/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-wider text-primary/70">{sheet.tag}</p>
                        <p className="text-sm font-bold text-[var(--on-surface)]">{sheet.title}</p>
                      </div>
                      <ExternalLink size={14} className="text-[var(--on-surface-variant)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle size={18} />
                <span className="font-bold text-xs">Pro Tip</span>
              </div>
              <p className="text-xs text-amber-900/80 font-medium leading-relaxed">
                Consistency is key. Spend 15 minutes each morning reviewing one technical concept and one STAR story.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewToolkit;
