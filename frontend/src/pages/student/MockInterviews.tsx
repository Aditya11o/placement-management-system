import React, { useState } from 'react';
import { 
  MessageSquare, Search, 
  ExternalLink, ChevronRight, 
  Trophy, BookOpen, Clock, Building2
} from 'lucide-react';

const MockInterviews: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const questions = [
    { company: 'Google', title: 'Data Structures & Algorithms', type: 'Technical', difficulty: 'Hard', views: '2.4k' },
    { company: 'Amazon', title: 'Leadership Principles & Scenarios', type: 'Behavioral', difficulty: 'Medium', views: '1.8k' },
    { company: 'Microsoft', title: 'System Design Fundamentals', type: 'Technical', difficulty: 'Hard', views: '1.6k' },
    { company: 'TCS', title: 'Basic C++/Java & OS Concepts', type: 'Technical', difficulty: 'Easy', views: '3.1k' },
    { company: 'Adobe', title: 'OOPS & Problem Solving', type: 'Technical', difficulty: 'Medium', views: '1.2k' },
  ];

  const experiences = [
    { name: 'Rahul S.', company: 'Amazon', role: 'SDE Intern', date: 'March 2024', content: 'The interview focused heavily on Leadership Principles. Multiple rounds of DSA (Graphs/DP)...' },
    { name: 'Priya K.', company: 'Google', role: 'Software Engineer', date: 'Feb 2024', content: 'Focus on clean code and edge cases. Round 1 was purely on Trees and Recursion...' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mock Interview Bank</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Prepare with real company questions and peer experiences.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search company or topic..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/5 outline-none font-medium text-sm transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Featured Questions</h2>
          </div>

          {questions.map((q, i) => (
            <div key={i} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer group relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-900 translate-x-[-100%] group-hover:translate-x-0 transition-transform"></div>
               <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-lg tracking-wider">
                         {q.company}
                      </span>
                      <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg tracking-wider ${
                        q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' :
                        q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                         {q.difficulty}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-900 transition-colors">{q.title}</h3>
                    <div className="flex items-center gap-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                       <span className="flex items-center gap-1.5"><Clock size={14} /> 15 mins read</span>
                       <span className="flex items-center gap-1.5"><Trophy size={14} /> {q.views} Views</span>
                    </div>
                  </div>
                  <button className="p-3 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-blue-900 group-hover:text-white transition-all shadow-sm">
                     <ChevronRight size={18} />
                  </button>
               </div>
            </div>
          ))}

          {/* Peer Experiences Section */}
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="text-amber-500" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Peer Interview Experiences</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {experiences.map((exp, i) => (
                <div key={i} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            {exp.name[0]}
                         </div>
                         <div>
                            <h4 className="text-sm font-bold text-gray-900">{exp.name}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{exp.company} • {exp.role}</p>
                         </div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{exp.date}</span>
                   </div>
                   <p className="text-sm text-gray-600 line-clamp-3 italic">"{exp.content}"</p>
                   <button className="mt-4 text-xs font-black text-blue-600 uppercase tracking-widest hover:text-black transition-colors">Read More</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar / Tips */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-[#000613] rounded-2xl p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
              <BookOpen className="text-blue-400 mb-6" size={32} />
              <h3 className="text-xl font-black tracking-tight mb-3">Interview Tips</h3>
              <ul className="space-y-4 text-gray-300 text-sm font-medium">
                 <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    Always research the company's core values before behavioral rounds.
                 </li>
                 <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    Practice your self-introduction (Tell me about yourself).
                 </li>
                 <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    Explain your thought process while solving coding problems.
                 </li>
              </ul>
              <button className="w-full mt-8 py-3 bg-white text-blue-950 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group">
                 Read Full Guide <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
           </div>

           <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Top Companies</h3>
              <div className="grid grid-cols-2 gap-3">
                 {['Google', 'Meta', 'Amazon', 'Apple', 'Netflix', 'Microsoft'].map((c, i) => (
                   <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer group">
                      <Building2 size={16} className="text-gray-400 group-hover:text-blue-600" />
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{c}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterviews;
