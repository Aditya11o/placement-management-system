import React, { useState, useEffect } from 'react';
import { Bell, Megaphone, Clock, ChevronRight, X, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface AnnouncementsBoardProps {
  initialAnnouncements?: any[];
}

const AnnouncementsBoard: React.FC<AnnouncementsBoardProps> = ({ initialAnnouncements = [] }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>(initialAnnouncements);
  const [loading, setLoading] = useState(initialAnnouncements.length === 0);
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(!!selectedNotice, modalRef);

  useEffect(() => {
    if (initialAnnouncements.length > 0) {
      setAnnouncements(initialAnnouncements);
      setLoading(false);
      return;
    }

    const fetchAnnouncements = async () => {
      try {
        const { data } = await api.get('/notifications/announcements');
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
  
  const handleViewAll = () => {
    if (!user) return;
    
    if (user.role === 'admin') {
      navigate('/admin/notifications');
    } else if (user.role === 'student') {
      navigate('/student/notifications');
    } else if (user.role === 'recruiter') {
      navigate('/recruiter/notifications');
    }
  };

  if (loading) return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-ambient animate-pulse">
      <div className="h-4 bg-surface-container-low rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-20 bg-surface-container rounded-xl"></div>
        <div className="h-20 bg-surface-container rounded-xl"></div>
      </div>
    </div>
  );

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 shadow-ambient hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 text-orange-600 rounded-xl">
            <Megaphone size={20} />
          </div>
          <h3 className="text-base font-black text-on-surface tracking-tight uppercase">News & Announcements</h3>
        </div>
        <Bell className="text-on-surface-variant/40" size={18} />
      </div>

      <div className="space-y-4">
        {announcements.length > 0 ? (
          announcements.map((ann) => (
            <div 
              key={ann._id} 
              onClick={() => setSelectedNotice(ann)}
              className="p-4 bg-surface-container-low hover:bg-surface-container border border-transparent hover:border-outline-variant/30 rounded-2xl transition-all group flex gap-4 cursor-pointer"
            >
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-[13px] font-black text-on-surface group-hover:text-surface-tint transition-colors uppercase tracking-tight">
                    {ann.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant/50">
                    <Clock size={10} />
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-[12px] font-bold text-on-surface-variant line-clamp-2 leading-relaxed">
                  {ann.message}
                </p>
              </div>
              <div className="self-center text-on-surface-variant/30 group-hover:text-surface-tint transition-colors">
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

      {/* Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            onClick={() => setSelectedNotice(null)}
          ></div>
          <div 
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ann-modal-title"
            aria-describedby="ann-modal-description"
            className="relative w-full max-w-lg bg-surface-container-lowest rounded-[2.5rem] shadow-2xl border border-outline-variant p-8 animate-in zoom-in-95 duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8">
              <button 
                onClick={() => setSelectedNotice(null)}
                aria-label="Close notice"
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-surface-tint/10 text-surface-tint rounded-2xl">
                  <Megaphone size={24} />
                </div>
                <div>
                   <span className="px-3 py-1 bg-surface-container-high rounded-lg text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Official Notice</span>
                   <h2 id="ann-modal-title" className="text-2xl font-black text-on-surface tracking-tight mt-1">{selectedNotice.title}</h2>
                </div>
              </div>

              <div id="ann-modal-description" className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30">
                <p className="text-sm font-bold text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                  {selectedNotice.message}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={14} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">
                    {new Date(selectedNotice.createdAt).toLocaleDateString('en-US', { 
                      month: 'long', day: 'numeric', year: 'numeric' 
                    })}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedNotice(null)}
                  className="px-6 py-3 bg-[#000613] text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-105 transition-all active:scale-95"
                >
                  Close Notice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {announcements.length > 0 && (
        <button 
          onClick={handleViewAll}
          className="w-full mt-6 py-3 text-[11px] font-black text-on-surface-variant hover:text-on-surface border-t border-outline-variant/30 transition-all uppercase tracking-widest"
        >
          View All Notices
        </button>
      )}
    </div>
  );
};

export default AnnouncementsBoard;
