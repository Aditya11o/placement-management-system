import React, { useState, useEffect } from 'react';
import { Bell, Megaphone, Clock, ChevronRight } from 'lucide-react';
import api from '../api';

interface AnnouncementsBoardProps {
  initialAnnouncements?: any[];
}

const AnnouncementsBoard: React.FC<AnnouncementsBoardProps> = ({ initialAnnouncements = [] }) => {
  const [announcements, setAnnouncements] = useState<any[]>(initialAnnouncements);
  const [loading, setLoading] = useState(initialAnnouncements.length === 0);

  useEffect(() => {
    if (initialAnnouncements.length > 0) {
      setAnnouncements(initialAnnouncements);
      setLoading(false);
      return;
    }

    const fetchAnnouncements = async () => {
      try {
        const { data } = await api.get('/notifications');
        // Filter for broadcast types if necessary, or just show last 5
        setAnnouncements(data.slice(0, 5));
      } catch (err) {
        console.error('Error fetching announcements:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [initialAnnouncements]);

  if (loading) return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-20 bg-gray-50 rounded-xl"></div>
        <div className="h-20 bg-gray-50 rounded-xl"></div>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
            <Megaphone size={20} />
          </div>
          <h3 className="text-base font-black text-gray-900 tracking-tight uppercase">News & Announcements</h3>
        </div>
        <Bell className="text-gray-300" size={18} />
      </div>

      <div className="space-y-4">
        {announcements.length > 0 ? (
          announcements.map((ann) => (
            <div key={ann._id} className="p-4 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 rounded-2xl transition-all group flex gap-4">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-[13px] font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                    {ann.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                    <Clock size={10} />
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-[12px] font-bold text-gray-500 line-clamp-2 leading-relaxed">
                  {ann.message}
                </p>
              </div>
              <div className="self-center text-gray-300 group-hover:text-blue-600 transition-colors">
                <ChevronRight size={16} />
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">No recent announcements</p>
          </div>
        )}
      </div>

      {announcements.length > 0 && (
        <button className="w-full mt-6 py-3 text-[11px] font-black text-gray-400 hover:text-gray-900 border-t border-gray-50 transition-all uppercase tracking-widest">
          View All Notices
        </button>
      )}
    </div>
  );
};

export default AnnouncementsBoard;
