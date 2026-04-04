import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, ChevronRight, Loader2 } from 'lucide-react';
import api from '../../api';

interface InterviewPanelProps {
  initialInterviews?: any[];
}

const InterviewPanel: React.FC<InterviewPanelProps> = ({ initialInterviews = [] }) => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<any[]>(initialInterviews);
  const [loading, setLoading] = useState(initialInterviews.length === 0);

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

  return (
    <div 
      onClick={() => navigate('/student/interviews')}
      className="bg-surface-container-low p-5 rounded-xl shadow-ambient border border-outline-variant h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-on-surface">
          Upcoming Interviews {interviews.length > 0 && `(${interviews.length})`}
        </h3>
        <ChevronRight size={20} className="text-on-surface-variant group-hover:text-surface-tint group-hover:translate-x-1 transition-all" />
      </div>
      <div className="space-y-4">
        {interviews.map((interview: any, i: number) => (
          <div key={i} className="p-4 rounded-xl border border-outline-variant/50 bg-surface-container-lowest hover:border-outline-variant hover:shadow-sm transition-all">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-on-surface">{interview.job?.title || 'Job Interview'}</h4>
                <p className="text-xs text-on-surface-variant font-bold mt-1">{interview.job?.companyName}</p>
                <p className="text-[10px] text-on-surface-variant/70 mt-1 uppercase tracking-wider font-medium">
                  {new Date(interview.interviewDate).toLocaleString()}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-tight ${
                interview.mode === 'ONLINE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {interview.mode || 'ONLINE'}
              </span>
            </div>
            {interview.interviewLink && (
              <a 
                href={interview.interviewLink} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mt-4 hover:underline transition-colors"
              >
                <ExternalLink size={14} /> Join Meeting
              </a>
            )}
          </div>
        ))}
        {interviews.length === 0 && (
          <p className="text-center py-10 text-on-surface-variant/60 font-medium italic">No upcoming interviews. Check your applications regularly.</p>
        )}
      </div>
    </div>
  );
};

export default InterviewPanel;
