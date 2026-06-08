import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { Loader2, ChevronRight, ExternalLink } from 'lucide-react';

interface InterviewPanelProps {
  initialInterviews?: any[];
}

const InterviewPanel: React.FC<InterviewPanelProps> = ({ initialInterviews = [] }) => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<any[]>(initialInterviews);
  const [loading, setLoading] = useState(initialInterviews.length === 0);
  const { showSuccess, showError } = useNotification();
  const [selectedSlotUI, setSelectedSlotUI] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialInterviews.length > 0) {
      setInterviews(initialInterviews);
      setLoading(false);
      return;
    }

    const fetchInterviews = async () => {
      try {
        const { data } = await api.get('/applications/interviews');
        // Handle both paginated { data, pagination } and flat array responses
        setInterviews(Array.isArray(data) ? data : (data.data || []));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, [initialInterviews]);

  if (loading) {
    return (
      <div className="bg-surface-container-low p-5 rounded-xl shadow-ambient border border-outline-variant h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-surface-tint" />
      </div>
    );
  }

  const handleSelectSlot = async (interviewModelId: string, slotId: string) => {
    try {
      await api.patch(`/interviews/${interviewModelId}/select-slot`, { slotId });
      showSuccess('Interview slot selected successfully!', 'Slot Confirmed');
      setSelectedSlotUI(prev => ({ ...prev, [interviewModelId]: slotId }));
      // Optional: Refetch
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to select slot', 'Error');
    }
  };

  return (
    <div 
      onClick={() => navigate('/student/interviews')}
      className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-outline-variant/30 h-full hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[13px] font-black text-on-surface uppercase tracking-tight italic">
          Upcoming <span className="text-surface-tint">Interviews</span> {interviews.length > 0 && <span className="text-xs opacity-40 ml-1">({interviews.length})</span>}
        </h3>
        <ChevronRight size={18} className="text-on-surface-variant group-hover:text-surface-tint group-hover:translate-x-1 transition-all" />
      </div>
      <div className="space-y-4">
        {interviews.map((app: any, i: number) => {
          // Flatten nested Interview models if present, or just use app data
          const nestedInterviews = app.interviews || [];
          return (
            <div key={i} className="p-4 rounded-xl border border-outline-variant/50 bg-surface-container-lowest hover:border-outline-variant hover:shadow-sm transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-on-surface">{app.job?.title || 'Job Interview'}</h4>
                  <p className="text-xs text-on-surface-variant font-bold mt-1">{app.job?.companyName}</p>
                  <p className="text-[10px] text-on-surface-variant/70 mt-1 uppercase tracking-wider font-medium">
                    {app.interviewDate ? new Date(app.interviewDate).toLocaleString() : 'TBD'}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-tight ${
                  app.mode === 'ONLINE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {app.mode || 'ONLINE'}
                </span>
              </div>
              
              {/* Slot Selection UI */}
              {nestedInterviews.map((intModel: any) => {
                const slots = typeof intModel.availableSlots === 'string' ? JSON.parse(intModel.availableSlots) : (intModel.availableSlots || []);
                const currentSelection = selectedSlotUI[intModel.id] || intModel.selectedSlot;
                
                if (slots.length > 0) {
                  return (
                    <div key={intModel.id} className="mt-4 pt-4 border-t border-dashed border-outline-variant/30">
                      <p className="text-xs font-bold text-on-surface mb-2">Select Interview Slot:</p>
                      {currentSelection ? (
                        <div className="text-xs text-green-600 font-semibold bg-green-50 p-2 rounded inline-block">
                          Slot Confirmed: {new Date(slots.find((s:any) => s.id === currentSelection)?.time || intModel.date).toLocaleString()}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {slots.map((slot: any) => (
                            <button
                              key={slot.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectSlot(intModel.id, slot.id);
                              }}
                              className="px-3 py-1.5 border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white rounded text-[10px] font-black tracking-widest uppercase transition-all"
                            >
                              {new Date(slot.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}

              {app.interviewLink && (
                <a 
                  href={app.interviewLink} 
                  target="_blank" 
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mt-4 hover:underline transition-colors"
                >
                  <ExternalLink size={14} /> Join Meeting
                </a>
              )}
            </div>
          );
        })}
        {interviews.length === 0 && (
          <p className="text-center py-10 text-on-surface-variant/60 font-medium italic">No upcoming interviews. Check your applications regularly.</p>
        )}
      </div>
    </div>
  );
};

export default InterviewPanel;
