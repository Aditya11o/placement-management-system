import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Video, Play, FileText, 
  ArrowLeft, Search, Sparkles, Download
} from 'lucide-react';
import api from '../../api';
import DashboardSkeleton from '../../components/skeletons/DashboardSkeleton';
import { useNotification } from '../../context/NotificationContext';

const categoryTitles: Record<string, { title: string, subtitle: string }> = {
  'all': { title: 'All Resources', subtitle: 'Complete collection of placement materials' },
  'technical': { title: 'Technical Preparation', subtitle: 'DSA, Algorithms, and Core Subjects' },
  'hr': { title: 'HR & Behavioral', subtitle: 'Communication, Culture Fit, and Soft Skills' },
  'aptitude': { title: 'Aptitude Prep', subtitle: 'Quants, Verbal, and Logical Reasoning' },
  'gd': { title: 'Group Discussion', subtitle: 'Topics, Etiquette, and Strategy' },
};

const ResourceCategory: React.FC = () => {
  const { category = 'all' } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { showError } = useNotification();
  
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        // We fetch all resources and then filter on client side. 
        // If the backend supports category query params, it can be added here.
        const { data } = await api.get('/resources');
        setResources(data);
      } catch (err) {
        console.error(err);
        showError('Failed to load resources');
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const pageInfo = categoryTitles[category] || { title: 'Resources', subtitle: 'Curated Preparation Materials' };

  const filteredResources = resources.filter(res => {
    // Exact category match or 'all'
    const matchesCategory = category === 'all' || 
                            (res.category && res.category.toLowerCase().includes(category.toLowerCase()));
    
    const matchesSearch = res.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          res.description?.toLowerCase().includes(searchTerm.toLowerCase());
                          
    const matchesType = typeFilter === 'All' || res.type === typeFilter;
    
    return matchesCategory && matchesSearch && matchesType;
  });

  const videos = filteredResources.filter(r => r.type === 'Video');
  const documents = filteredResources.filter(r => r.type === 'File');

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Navigation Header */}
      <button 
        onClick={() => navigate('/student/resources')}
        className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-[#000613] transition-colors"
      >
        <ArrowLeft size={14} /> Back to Hub
      </button>

      {/* Page Title Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] italic">
          <Sparkles size={14} /> Knowledge Base
        </div>
        <h1 className="text-4xl font-black text-[#000613] tracking-tight uppercase italic">{pageInfo.title.split(' ')[0]} <span className="opacity-40">{pageInfo.title.split(' ').slice(1).join(' ')}</span></h1>
        <p className="text-gray-400 text-sm font-medium max-w-2xl">
          {pageInfo.subtitle}. View masterclass videos and download high-quality PDF guides.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:border-blue-600 rounded-xl font-bold text-[13px] text-gray-900 focus:outline-none focus:bg-white transition-all"
          />
        </div>
        <div className="flex p-1 bg-gray-50 rounded-xl w-full md:w-auto">
          {['All', 'Video', 'File'].map(tab => (
            <button
              key={tab}
              onClick={() => setTypeFilter(tab)}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                typeFilter === tab 
                  ? 'bg-white text-[#000613] shadow-sm' 
                  : 'text-gray-400 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Videos Section */}
      {(typeFilter === 'All' || typeFilter === 'Video') && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-gray-50 pb-4">
            <Video size={20} className="text-[#000613]" />
            <h2 className="text-2xl font-black text-[#000613] italic uppercase leading-none">Video <span className="opacity-30">Masterclasses</span></h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.length > 0 ? videos.map((video, i) => (
              <div key={i} className="group cursor-pointer space-y-4">
                <div className="aspect-video bg-gray-200 rounded-[2.5rem] relative overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
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
                    {video.instructor ? `By ${video.instructor}` : 'Expert Curated'}
                  </p>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-12 text-center bg-white rounded-[2rem] border border-gray-100 italic font-bold text-gray-400 uppercase tracking-widest text-[11px]">
                No videos available for this category.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documents Section */}
      {(typeFilter === 'All' || typeFilter === 'File') && (
        <div className="space-y-6 pt-8">
          <div className="flex items-center gap-3 border-b-2 border-gray-50 pb-4">
            <BookOpen size={20} className="text-[#000613]" />
            <h2 className="text-2xl font-black text-[#000613] italic uppercase leading-none">Curated <span className="opacity-30">Documents</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.length > 0 ? documents.map((doc, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] flex items-center justify-between group hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 cursor-default">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#000613] uppercase tracking-tight mb-1 group-hover:text-blue-600 transition-colors">{doc.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{doc.fileType || 'PDF Document'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => window.open(doc.url, '_blank')}
                  className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#000613] hover:text-white transition-all active:scale-95"
                >
                  <Download size={16} />
                </button>
              </div>
            )) : (
              <div className="col-span-full py-12 text-center bg-white rounded-[2rem] border border-gray-100 italic font-bold text-gray-400 uppercase tracking-widest text-[11px]">
                No documents available for this category.
              </div>
            )}
          </div>
        </div>
      )}

      {filteredResources.length === 0 && (
         <div className="py-20 text-center">
            <p className="text-lg font-black uppercase text-gray-300 italic tracking-widest">Nothing Found</p>
         </div>
      )}

    </div>
  );
};

export default ResourceCategory;
