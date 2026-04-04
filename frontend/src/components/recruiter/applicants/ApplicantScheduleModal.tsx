import React from 'react';
import { X } from 'lucide-react';

interface ApplicantScheduleModalProps {
  isVisible: boolean;
  onClose: () => void;
  applicant: any;
  interviewDetails: { date: string; time: string; mode: string; link: string };
  setInterviewDetails: (details: any) => void;
  onConfirm: () => void;
}

const ApplicantScheduleModal: React.FC<ApplicantScheduleModalProps> = ({
  isVisible,
  onClose,
  applicant,
  interviewDetails,
  setInterviewDetails,
  onConfirm
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-[#000613]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-full max-w-[500px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-10 pt-10 pb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Schedule Interview</h2>
            <p className="text-gray-400 text-[12px] font-bold mt-1 uppercase tracking-wide">
              Candidate: {applicant?.student?.name}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="px-10 pb-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Date</label>
              <input 
                type="date" 
                value={interviewDetails.date}
                onChange={(e) => setInterviewDetails({...interviewDetails, date: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-[13px] outline-none" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Time</label>
              <input 
                type="time" 
                value={interviewDetails.time}
                onChange={(e) => setInterviewDetails({...interviewDetails, time: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-[13px] outline-none" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Interview Mode</label>
            <div className="flex p-1 bg-gray-100 rounded-xl gap-1">
              <button 
                onClick={() => setInterviewDetails({...interviewDetails, mode: 'Online'})}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${interviewDetails.mode === 'Online' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
                Online
              </button>
              <button 
                onClick={() => setInterviewDetails({...interviewDetails, mode: 'Offline'})}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${interviewDetails.mode === 'Offline' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
                Offline
              </button>
            </div>
          </div>

          {interviewDetails.mode === 'Online' && (
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Meeting Link</label>
              <input 
                type="text" 
                placeholder="https://meet.google.com/..."
                value={interviewDetails.link}
                onChange={(e) => setInterviewDetails({...interviewDetails, link: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-[13px] outline-none" 
              />
            </div>
          )}

          <button 
            onClick={onConfirm}
            className="w-full py-4 bg-[#000613] text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-black/20"
          >
            Confirm & Shortlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicantScheduleModal;
