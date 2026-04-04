import React from 'react';
import { X as CloseIcon } from 'lucide-react';

interface StudentViewModalProps {
  isOpen: boolean;
  student: any;
  onClose: () => void;
  onEdit: (student: any) => void;
}

const StudentViewModal: React.FC<StudentViewModalProps> = ({ isOpen, student, onClose, onEdit }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <img src={student.avatar} className="w-16 h-16 rounded-2xl bg-gray-100 object-cover" />
              <div>
                <h3 className="text-xl font-black text-gray-900 leading-tight">{student.name}</h3>
                <p className="text-sm font-bold text-gray-400">{student.email}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <CloseIcon size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
              <p className={`text-sm font-black uppercase ${student.status === 'Approved' ? 'text-emerald-600' : 'text-orange-500'}`}>
                {student.status}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Course</p>
              <p className="text-sm font-black text-gray-900">{student.course}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current CGPA</p>
              <p className="text-sm font-black text-gray-900">{student.cgpa}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Registration</p>
              <p className="text-sm font-black text-gray-900">{student.regDate}</p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Key Skills</p>
            <div className="flex flex-wrap gap-2">
              {student.skills.length > 0 ? student.skills.map((s: string) => (
                <span key={s} className="px-3 py-1.5 bg-gray-100 text-[10px] font-black text-gray-500 rounded-xl uppercase tracking-widest border border-gray-200">{s}</span>
              )) : (
                <p className="text-sm font-bold text-gray-400 italic">No skills listed yet.</p>
              )}
            </div>
          </div>

          <button 
            onClick={() => { onClose(); onEdit(student); }}
            className="w-full py-4 bg-[#000613] text-white rounded-2xl font-black text-sm shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Modify Student Record
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentViewModal;
