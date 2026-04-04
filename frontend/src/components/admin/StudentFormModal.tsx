import React from 'react';
import { 
  X as CloseIcon, User, Mail, BookOpen, ClipboardCheck, 
  ShieldCheck, Loader2
} from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  isEdit: boolean;
  formData: { name: string; email: string; password: string; course: string; branch: string; cgpa: string };
  submitting: boolean;
  onFormChange: (updates: Partial<StudentFormModalProps['formData']>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen, isEdit, formData, submitting, onFormChange, onSubmit, onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-black text-gray-900">{isEdit ? 'Edit Student' : 'Add New Student'}</h3>
              <p className="text-sm text-gray-500 font-bold">Fill in the details for the student account.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <CloseIcon size={20} />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => onFormChange({ name: e.target.value })}
                    placeholder="Aditya Halder"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:bg-white focus:border-black outline-none transition-all" 
                  />
                </div>
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    required
                    disabled={isEdit}
                    type="email" 
                    value={formData.email}
                    onChange={(e) => onFormChange({ email: e.target.value })}
                    placeholder="aditya@tnu.in"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:bg-white focus:border-black outline-none transition-all disabled:opacity-50" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Course</label>
                <div className="relative group">
                  <BookOpen size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select 
                    value={formData.course}
                    onChange={(e) => onFormChange({ course: e.target.value })}
                    className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:bg-white focus:border-black outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option>BCA</option>
                    <option>B.Tech CS</option>
                    <option>B.Tech ME</option>
                    <option>MCA</option>
                    <option>MBA</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CGPA</label>
                <div className="relative group">
                  <ClipboardCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="number"
                    step="0.01" 
                    value={formData.cgpa}
                    onChange={(e) => onFormChange({ cgpa: e.target.value })}
                    placeholder="8.5"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:bg-white focus:border-black outline-none transition-all" 
                  />
                </div>
              </div>
            </div>

            {!isEdit && (
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Temporary Password</label>
                <input 
                  type="text" 
                  value={formData.password}
                  onChange={(e) => onFormChange({ password: e.target.value })}
                  placeholder="Default: Password@123"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:bg-white focus:border-black outline-none transition-all shadow-inner" 
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-[#000613] text-white rounded-xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-black/10 flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                {isEdit ? 'Save Changes' : 'Create Student'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentFormModal;
