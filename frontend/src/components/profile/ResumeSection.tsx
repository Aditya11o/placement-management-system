import React from 'react';
import { FileText, Plus, Sparkles, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ResumeSectionProps {
  student: any;
  onUploadClick: () => void;
}

const ResumeSection: React.FC<ResumeSectionProps> = ({ student, onUploadClick }) => {
  return (
    <div className="col-span-12 lg:col-span-6">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 h-full hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 blur-3xl rounded-full -mr-10 -mt-10 group-hover:bg-blue-100/50 transition-colors" />
        
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase italic">Resume <span className="text-blue-600">Assets</span></h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Manage & Track Versions</p>
            </div>
          </div>
          <Link 
            to="/student/resumes"
            className="p-2 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title="View Analytics"
          >
            <BarChart2 size={20} />
          </Link>
        </div>
        
        <div className="space-y-6">
          {student.resume_path ? (
            <div className="p-6 rounded-[2rem] border border-blue-100/50 bg-blue-50/10 flex flex-col items-center text-center gap-4 group/item transition-all">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-blue-50 flex items-center justify-center text-blue-600 mb-2">
                <FileText size={32} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-black text-gray-900 truncate max-w-[200px]" title={student.resume_path.split('/').pop()}>
                  {student.resume_path.split('/').pop() || 'Primary_Resume.pdf'}
                </h4>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase rounded tracking-widest">Active Primary</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded tracking-widest">Verified</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full mt-4">
                <Link 
                  to="/student/resumes"
                  className="px-4 py-3 bg-white text-gray-900 border border-gray-100 rounded-xl text-[10px] font-black hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  Manage All
                </Link>
                <button 
                  onClick={onUploadClick}
                  className="px-4 py-3 bg-blue-950 text-white rounded-xl text-[10px] font-black hover:bg-black transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  Replace
                </button>
              </div>
            </div>
          ) : (
            <div className="border-4 border-dashed border-gray-100 rounded-[2.5rem] p-10 flex flex-col items-center justify-center bg-gray-50/30 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-center">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-gray-300 mb-6 group-hover:scale-110 transition-transform">
                <FileText size={40} strokeWidth={1.5} />
              </div>
              <h4 className="text-lg font-black text-gray-900 italic uppercase">No active resume</h4>
              <p className="text-xs text-gray-400 mt-2 mb-8 max-w-[200px]">Unlock career opportunities by crafting your professional identity.</p>
              <button 
                onClick={onUploadClick}
                className="w-full bg-blue-950 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95"
              >
                <Plus size={16} /> Quick Upload
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-gray-50">
            <Link 
              to="/student/resume-builder"
              className="w-full py-4 bg-[#000613] text-white rounded-[1.5rem] flex items-center justify-center gap-3 group/btn relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              <FileText size={18} className="text-blue-400" />
              <span className="text-[11px] font-black uppercase tracking-[0.15em] relative z-10">Professional Resume Builder</span>
            </Link>
            <p className="text-[9px] text-gray-400 text-center mt-4 font-bold uppercase tracking-[0.2em] opacity-40 italic">
              Craft IRCC Compliant ATS Resumes in Minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeSection;
