import React, { useState } from 'react';
import { 
  X, Star, Send, Loader2, MessageSquare, 
  Terminal, Share2, Award, Info 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { feedback: string, evaluationData: any }) => void;
  candidateName: string;
  currentStage: string;
  isSubmitting: boolean;
}

const EvaluationModal: React.FC<Props> = ({ 
  isOpen, onClose, onConfirm, candidateName, currentStage, isSubmitting 
}) => {
  const [feedback, setFeedback] = useState('');
  const [ratings, setRatings] = useState({
    technical: 5,
    communication: 5,
    culturalFit: 5
  });

  if (!isOpen) return null;

  const handleRating = (key: keyof typeof ratings, val: number) => {
    setRatings(prev => ({ ...prev, [key]: val }));
  };

  const categories = [
    { key: 'technical', label: 'Technical Prowess', icon: Terminal, color: 'text-blue-500' },
    { key: 'communication', label: 'Soft Skills & Comm', icon: Share2, color: 'text-purple-500' },
    { key: 'culturalFit', label: 'Batch/Culture Fit', icon: Award, color: 'text-emerald-500' }
  ];

  const averageScore = ((ratings.technical + ratings.communication + ratings.culturalFit) / 3).toFixed(1);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#000613]/50 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-200 border border-white/20">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">
              <Info size={14} /> Pipeline Orchestration
            </div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
              Evaluate <span className="text-blue-600">{candidateName}</span>
            </h3>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-2">
              Advancing from <span className="text-gray-900">{currentStage}</span> to next round
            </p>
          </div>
          <button onClick={onClose} className="p-3 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Evaluation Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {categories.map((cat) => (
            <div key={cat.key} className="bg-gray-50/50 border border-gray-100 p-5 rounded-3xl flex flex-col items-center gap-3">
              <div className={`p-3 bg-white rounded-2xl shadow-sm ${cat.color}`}>
                <cat.icon size={20} />
              </div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider text-center">{cat.label}</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleRating(cat.key as any, num)}
                    className={`transition-all ${ratings[cat.key as keyof typeof ratings] >= num ? 'text-amber-400' : 'text-gray-200'}`}
                  >
                    <Star size={14} fill={ratings[cat.key as keyof typeof ratings] >= num ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Feedback Area */}
        <div className="space-y-3 mb-10">
          <div className="flex justify-between items-center ml-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qualitative Feedback</label>
            <div className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black">
              SCORE: {averageScore}/5.0
            </div>
          </div>
          <div className="relative">
            <MessageSquare className="absolute left-5 top-5 text-gray-300" size={18} />
            <textarea 
              rows={4}
              placeholder="What stood out during this round? Any areas of improvement or specific commendations?"
              className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm font-bold text-gray-900 outline-none focus:border-blue-600 focus:bg-white transition-all custom-scrollbar"
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-[20px] text-[11px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ feedback, evaluationData: { ...ratings, averageScore } })}
            disabled={isSubmitting || !feedback.trim()}
            className="flex-[2] py-5 bg-[#000613] text-white rounded-[20px] text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-blue-600/10 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            Confirm Advancement
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationModal;
