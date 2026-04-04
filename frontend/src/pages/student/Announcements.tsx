import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, Search } from 'lucide-react';
import api from '../../api';
import DashboardSkeleton from '../../components/skeletons/DashboardSkeleton';

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        // Using limit=0 or large number to fetch all broadcasts for the page
        const { data } = await api.get('/notifications?isBroadcast=true&limit=100');
        // If the endpoint is nested differently (e.g. notifications/announcements), adjust accordingly.
        // Assuming notifications endpoint returns { data: [...] } or just [...]
        const results = data?.data || data || [];
        setAnnouncements(results);
      } catch (err) {
        console.error('Error fetching announcements:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const filteredAnnouncements = announcements.filter(ann => {
    const matchesSearch = ann.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ann.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || 
                          (activeFilter === 'General' && (!ann.type || ann.type === 'General')) ||
                          (activeFilter === 'Placement' && ann.type === 'Placement') ||
                          (activeFilter === 'Event' && ann.type === 'Event');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-8">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] italic">
            <Megaphone size={14} /> Official Board
          </div>
          <h1 className="text-4xl font-black text-[#000613] tracking-tight uppercase italic">
            Campus <span className="opacity-40">Announcements</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            Stay updated with the latest institutional notices, placement drives, and official circulars all in one curated timeline.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search notices by keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-white border border-gray-100 focus:border-blue-600 rounded-2xl font-bold text-[13px] text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
          />
        </div>
        <div className="flex p-1 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto custom-scrollbar">
          {['All', 'Placement', 'Event', 'General'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                activeFilter === tab 
                  ? 'bg-[#000613] text-white shadow-lg' 
                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Announcements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnnouncements.map((ann, i) => (
          <div 
            key={ann._id || i}
            className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-blue-100">
                {ann.type || 'Notice'}
              </span>
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-[#000613] group-hover:text-white transition-colors duration-300">
                <Megaphone size={16} />
              </div>
            </div>
            
            <h3 className="text-xl font-black text-[#000613] italic uppercase leading-tight mb-4 group-hover:text-blue-600 transition-colors">
              {ann.title}
            </h3>
            
            <p className="text-[12px] text-gray-500 font-bold leading-relaxed flex-1 whitespace-pre-wrap">
              {ann.message}
            </p>
            
            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#000613]">
                  {new Date(ann.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                Official
              </div>
            </div>
          </div>
        ))}

        {filteredAnnouncements.length === 0 && (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
            <div className="flex flex-col items-center justify-center text-gray-400">
              <Megaphone size={48} className="mb-4 opacity-50" />
              <p className="text-sm font-black uppercase tracking-[0.2em] italic text-[#000613]">No Announcements Found</p>
              <p className="text-[11px] font-bold mt-2">Try adjusting your search or filter criteria.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Announcements;
