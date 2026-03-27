import React from 'react';
import { X, HelpCircle, MessageCircle, AlertTriangle, BookOpen, ChevronRight } from 'lucide-react';

interface HelpSupportPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpSupportPanel: React.FC<HelpSupportPanelProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Slide-out Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-surface-container-lowest shadow-2xl z-[70] transform transition-transform duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-container/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <HelpCircle size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-on-surface tracking-tight uppercase italic">Help & <span className="text-blue-600">Support</span></h2>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">Assistance Center</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2.5 text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center gap-3 p-5 bg-blue-50/50 border border-blue-100 rounded-3xl group hover:bg-blue-600 transition-all duration-300">
                <MessageCircle size={24} className="text-blue-600 group-hover:text-white transition-colors" />
                <span className="text-xs font-black text-blue-900 group-hover:text-white uppercase tracking-wider italic">Contact Admin</span>
              </button>
              <button className="flex flex-col items-center gap-3 p-5 bg-rose-50/50 border border-rose-100 rounded-3xl group hover:bg-rose-600 transition-all duration-300">
                <AlertTriangle size={24} className="text-rose-600 group-hover:text-white transition-colors" />
                <span className="text-xs font-black text-rose-900 group-hover:text-white uppercase tracking-wider italic">Report Issue</span>
              </button>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              {/* FAQ */}
              <div>
                <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] italic mb-4 flex items-center gap-2">
                  <span className="w-8 h-[1px] bg-outline-variant"></span> Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  {[
                    "How to upload my resume?",
                    "How to apply for a job?",
                    "What happens after selection?",
                    "Trouble resetting password?"
                  ].map((q, i) => (
                    <button key={i} className="w-full flex items-center justify-between p-4 bg-surface-container border border-outline-variant rounded-2xl hover:border-surface-tint/40 hover:bg-surface-container-lowest transition-all group">
                      <span className="text-sm font-bold text-on-surface-variant group-hover:text-on-surface">{q}</span>
                      <ChevronRight size={16} className="text-on-surface-variant group-hover:text-surface-tint group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              {/* User Guide */}
              <div>
                <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] italic mb-4 flex items-center gap-2">
                  <span className="w-8 h-[1px] bg-outline-variant"></span> User Guide
                </h3>
                <div className="bg-primary rounded-3xl p-6 text-on-primary relative overflow-hidden group shadow-xl">
                  <BookOpen size={60} className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                  <h4 className="text-lg font-black tracking-tight mb-2 uppercase italic">Quick <span className="text-blue-400">Tutorial</span></h4>
                  <p className="text-xs text-gray-400 font-bold leading-relaxed mb-4">Master the portal features in less than 5 minutes. Learn about job tracking, interviews, and more.</p>
                  <button className="px-5 py-2.5 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-colors">Start Learning</button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-outline-variant bg-surface-container/30">
            <p className="text-[10px] font-bold text-on-surface-variant text-center uppercase tracking-widest">Version 2.4.0 • PMS Support</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpSupportPanel;
