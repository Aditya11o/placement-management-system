import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Search, ExternalLink, 
  FileText, Clock, 
  ChevronRight, Sparkles, Loader2 
} from 'lucide-react';
import api from '../../api';

const CareerResources: React.FC = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Interview Questions', 'Mock Tests', 'Aptitude', 'Technical', 'General'];

  const fetchResources = async () => {
    try {
      setLoading(true);
      const url = category === 'All' ? '/resources' : `/resources?category=${category}`;
      const { data } = await api.get(url);
      setResources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [category]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="relative overflow-hidden bg-blue-950 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-blue-500/30">
            <Sparkles size={12} /> Resource Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 uppercase">Career <span className="text-blue-400">Preparation</span> Library</h1>
          <p className="text-blue-100/70 text-lg font-medium leading-relaxed">
            Access curated study materials, past interview questions, and mock tests to sharpen your skills and ace your placements.
          </p>
        </div>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap shadow-sm ${
                category === cat 
                  ? 'bg-blue-950 text-white shadow-blue-900/20 shadow-lg scale-105' 
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-900/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search resources..." 
            className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-xl transition-all group flex flex-col justify-between hover:-translate-y-1 duration-300">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${
                  resource.type === 'File' ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'
                }`}>
                  {resource.type === 'File' ? <FileText size={20} /> : <ExternalLink size={20} />}
                </div>
                <span className="px-2.5 py-1 bg-gray-50 text-gray-400 text-[9px] font-black uppercase rounded-lg tracking-widest border border-gray-100">
                  {resource.category}
                </span>
              </div>
              <h3 className="text-lg font-black text-gray-900 leading-tight mb-2 group-hover:text-blue-950 transition-colors uppercase italic">{resource.title}</h3>
              <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-6">
                {resource.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
              <div className="flex items-center gap-2 text-gray-400">
                <Clock size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(resource.createdAt).toLocaleDateString()}</span>
              </div>
              <a 
                href={resource.content}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-blue-600 font-black text-[11px] uppercase tracking-widest group-hover:gap-3 transition-all"
              >
                {resource.type === 'File' ? 'Download' : 'Open Link'}
                <ChevronRight size={14} />
              </a>
            </div>
          </div>
        ))}
        {resources.length === 0 && (
          <div className="col-span-12 py-20 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
            <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-400">No resources found in this category.</h3>
            <p className="text-sm text-gray-300 mt-2 font-medium italic">Check back later for new preparation materials!</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default CareerResources;
