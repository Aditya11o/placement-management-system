import React from 'react';
import { X } from 'lucide-react';

interface RecruiterFormModalProps {
  isOpen: boolean;
  title: string;
  subtitle: string;
  formId: string;
  formData: { name: string; email: string; password: string; companyName: string; website: string; industry: string; location: string };
  onFormChange: (updates: Partial<RecruiterFormModalProps['formData']>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  submitLabel: string;
  submitClassName?: string;
  showPassword?: boolean;
}

const RecruiterFormModal: React.FC<RecruiterFormModalProps> = ({
  isOpen, title, subtitle, formId, formData, onFormChange, onSubmit, onClose,
  submitLabel, submitClassName = "px-6 py-3 rounded-xl font-bold text-white bg-[#000613] hover:scale-105 transition-all text-sm shadow-xl shadow-black/10",
  showPassword = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#000613]/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">{title}</h3>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">{subtitle}</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all shadow-sm">
            <X size={24} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <form id={formId} onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Recruiter Name{showPassword && '*'}</label>
                <input required={showPassword} type="text" value={formData.name} onChange={e => onFormChange({ name: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#000613]/10 focus:border-[#000613] transition-all" placeholder={showPassword ? "John Doe" : ""} />
              </div>
              {showPassword ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address*</label>
                  <input required type="email" value={formData.email} onChange={e => onFormChange({ email: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#000613]/10 focus:border-[#000613] transition-all" placeholder="john@company.com" />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Company Name</label>
                  <input type="text" value={formData.companyName} onChange={e => onFormChange({ companyName: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#000613]/10 focus:border-[#000613] transition-all" />
                </div>
              )}
              {showPassword && (
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Password (Optional)</label>
                  <input type="text" value={formData.password} onChange={e => onFormChange({ password: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#000613]/10 focus:border-[#000613] transition-all" placeholder="Leave blank for 'Password@123'" />
                </div>
              )}
              {showPassword && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Company Name*</label>
                  <input required type="text" value={formData.companyName} onChange={e => onFormChange({ companyName: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#000613]/10 focus:border-[#000613] transition-all" placeholder="Company Inc." />
                </div>
              )}
              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Website</label>
                <input type="text" value={formData.website} onChange={e => onFormChange({ website: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#000613]/10 focus:border-[#000613] transition-all" placeholder="www.company.com" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Industry</label>
                <input type="text" value={formData.industry} onChange={e => onFormChange({ industry: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#000613]/10 focus:border-[#000613] transition-all" placeholder="e.g. Technology" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Location</label>
                <input type="text" value={formData.location} onChange={e => onFormChange({ location: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#000613]/10 focus:border-[#000613] transition-all" placeholder="e.g. Mumbai, India" />
              </div>
            </div>
          </form>
        </div>
        <div className="p-8 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all text-sm">Cancel</button>
          <button type="submit" form={formId} className={submitClassName}>{submitLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default RecruiterFormModal;
