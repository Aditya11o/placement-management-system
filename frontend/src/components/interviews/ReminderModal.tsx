import React from 'react';
import { X } from 'lucide-react';

interface ReminderModalProps {
  isOpen: boolean;
  data: { title: string; date: string; time: string; reminderBefore: string };
  onChange: (updates: Partial<ReminderModalProps['data']>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, data, onChange, onSubmit, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000613]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-full max-w-[500px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-10 pt-10 pb-6 flex justify-between items-center text-gray-900 border-b border-gray-100 mb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight uppercase">Add Reminder</h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Set a custom alert for your upcoming screening.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="px-10 pb-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Interview Title</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Google Technical Round"
              className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
              value={data.title}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</label>
              <input 
                type="date" 
                required
                className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
                value={data.date}
                onChange={(e) => onChange({ date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</label>
              <input 
                type="time" 
                required
                className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
                value={data.time}
                onChange={(e) => onChange({ time: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reminder Before</label>
            <div className="grid grid-cols-4 gap-2">
              {['15 min', '30 min', '1 hour', '1 day'].map((opt) => (
                <button 
                  key={opt}
                  type="button"
                  onClick={() => onChange({ reminderBefore: opt })}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    data.reminderBefore === opt 
                      ? 'bg-[#000613] text-white shadow-lg' 
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-[#000613] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/20 active:scale-95 mt-4"
          >
            Save Reminder
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReminderModal;
