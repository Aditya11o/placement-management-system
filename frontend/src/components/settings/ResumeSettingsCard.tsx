import React from 'react';
import { FileText, Trash2, Upload } from 'lucide-react';

interface ResumeSettingsCardProps {
  resumes: any[];
  onDelete: (id: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ResumeSettingsCard: React.FC<ResumeSettingsCardProps> = ({ resumes, onDelete, onUpload }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
          <FileText size={20} className="text-gray-900" />
        </div>
        <h2 className="text-lg font-black text-gray-900 tracking-tight">Resume Settings</h2>
      </div>

      <div className="space-y-4">
        {resumes.length > 0 ? (
          resumes.map((resume) => (
            <div key={resume._id} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
                    <FileText className="text-orange-600 w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-black text-gray-900 uppercase truncate" title={resume.resume_name}>
                      {resume.resume_name}
                    </h4>
                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 mt-0.5 sm:mt-1 uppercase tracking-wider italic">
                      Uploaded {new Date(resume.upload_date || resume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => window.open(resume.resume_url.startsWith('/') ? `${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${resume.resume_url}` : resume.resume_url, '_blank')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <FileText size={14} className="text-blue-600" />
                    <span>View</span>
                  </button>
                  <button 
                    onClick={() => onDelete(resume._id)}
                    className="p-2.5 text-rose-400 hover:text-rose-600 transition-colors bg-white border border-gray-100 rounded-lg shadow-sm"
                    title="Delete Resume"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">No resumes uploaded yet</p>
          </div>
        )}
        
        <div className="flex items-center gap-4 pt-4">
          <label className="flex-1 flex items-center justify-center px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-blue-400 hover:bg-blue-50/30 transition-all shadow-sm cursor-pointer gap-2 group">
            <Upload size={14} className="group-hover:scale-110 transition-transform" />
            <span>Upload New Resume</span>
            <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={onUpload} />
          </label>
        </div>
      </div>
    </div>
  );
};

export default ResumeSettingsCard;
