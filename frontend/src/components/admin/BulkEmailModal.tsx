import React, { useState } from 'react';
import { X, Send, Mail, Type, AlignLeft } from 'lucide-react';

interface BulkEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { subject: string; message: string; title: string }) => void;
  selectedCount: number;
  submitting: boolean;
}

const BulkEmailModal: React.FC<BulkEmailModalProps> = ({ 
  isOpen, onClose, onSubmit, selectedCount, submitting 
}) => {
  const [data, setData] = useState({ subject: '', message: '', title: '' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000613]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-[600px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-8 pt-8 pb-4 flex justify-between items-center text-gray-900 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Bulk Communications</h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Sending to {selectedCount} selected recipients</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
              <Type size={12} /> Email Title (Banner)
            </label>
            <input 
              type="text"
              placeholder="e.g. Placement Alert, Verification Update..."
              value={data.title}
              onChange={(e) => setData({...data, title: e.target.value})}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-[13px] outline-none focus:bg-white focus:border-blue-600 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
              <Mail size={12} /> Subject Line
            </label>
            <input 
              type="text"
              placeholder="Enter subject..."
              value={data.subject}
              onChange={(e) => setData({...data, subject: e.target.value})}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-[13px] outline-none focus:bg-white focus:border-blue-600 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
              <AlignLeft size={12} /> Message Body
            </label>
            <textarea 
              placeholder="Type your message here. Use clear, professional language..."
              value={data.message}
              onChange={(e) => setData({...data, message: e.target.value})}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-[13px] outline-none h-40 resize-none focus:bg-white focus:border-blue-600 transition-all"
            />
            <p className="text-[9px] text-gray-400 font-bold italic">* HTML is not supported, but line breaks are preserved.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              onClick={() => onSubmit(data)}
              disabled={submitting || !data.subject || !data.message}
              className="flex-[2] py-4 bg-[#000613] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {submitting ? 'Sending Batch...' : (
                <><Send size={16} /> Send to Group</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEmailModal;
