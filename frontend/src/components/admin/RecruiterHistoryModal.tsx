import React from 'react';
import { X, Loader2 } from 'lucide-react';

interface RecruiterHistoryModalProps {
  isOpen: boolean;
  loading: boolean;
  history: any[] | null;
  onClose: () => void;
}

const RecruiterHistoryModal: React.FC<RecruiterHistoryModalProps> = ({ isOpen, loading, history, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#000613]/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-scale-in">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Placement History</h3>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Full engagement trail for this partner</p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all shadow-sm">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 text-[#000613] animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">Retrieving Data...</p>
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item: any) => (
                <div key={item._id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:border-[#000613]/10 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#000613] text-white flex items-center justify-center font-black text-lg">
                      {item.student?.name?.[0]}
                    </div>
                    <div>
                      <p className="text-lg font-black text-gray-900 tracking-tight">{item.student?.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.job?.title}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-xs font-black text-emerald-600">{item.job?.salary}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      item.status === 'Selected' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-100' :
                      item.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {item.status}
                    </span>
                    <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase italic">
                      Updated: {new Date(item.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center font-black text-gray-300 uppercase tracking-widest italic">
              No placement history found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterHistoryModal;
