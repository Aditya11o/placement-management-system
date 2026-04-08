import React, { useState, useEffect } from 'react';
import { 
  X, User, FileText, Calendar, 
  ExternalLink, Mail, Loader2, GraduationCap
} from 'lucide-react';
import api from '../../api';
import { toast } from 'react-hot-toast';

interface ReferralApplicantsModalProps {
  jobId: string;
  jobTitle: string;
  onClose: () => void;
}

const ReferralApplicantsModal: React.FC<ReferralApplicantsModalProps> = ({ jobId, jobTitle, onClose }) => {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/alumni/referrals/${jobId}/applicants`);
        setApplicants(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load applicants');
      } finally {
        setLoading(false);
      }
    };
    fetchApplicants();
  }, [jobId]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Modal Head */}
        <div className="flex justify-between items-start mb-8 border-b border-gray-50 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
               <FileText size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase italic line-clamp-1">{jobTitle}</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Reviewing {applicants.length} Interested Candidates</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest">Scanning talent pool...</p>
             </div>
          ) : applicants.length === 0 ? (
             <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <User className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-sm font-black text-gray-300 uppercase tracking-widest italic">No applicants yet</p>
             </div>
          ) : (
            <div className="space-y-4">
              {applicants.map(app => (
                <div key={app.id} className="group bg-gray-50 hover:bg-white border border-gray-100 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/5">
                   <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white shadow-sm flex-shrink-0">
                         <img 
                            src={app.student?.user?.profilePhoto || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400"} 
                            alt="Student" 
                            className="w-full h-full object-cover"
                         />
                      </div>

                      {/* Info Container */}
                      <div className="flex-1 text-center sm:text-left min-w-0">
                         <h3 className="text-base font-black text-gray-900 truncate">{app.student?.user?.name}</h3>
                         <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                               <GraduationCap size={12} className="text-blue-600 font-black" /> {app.student?.branch || "B.Tech"} - CGPA {app.student?.cgpa || "N/A"}
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                               <Calendar size={12} className="text-blue-600 font-black" /> Applied {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                         </div>
                      </div>

                      {/* Resume / Contact Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                         <a 
                            href={app.resume} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-12 h-12 flex items-center justify-center bg-gray-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-black/10 hover:-translate-y-1 active:scale-95"
                            title="View Resume"
                         >
                            <ExternalLink size={18} />
                         </a>
                         <a 
                            href={`mailto:${app.student?.user?.email}`} 
                            className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 text-gray-400 rounded-2xl hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm hover:-translate-y-1 active:scale-95"
                            title="Contact Student"
                         >
                            <Mail size={18} />
                         </a>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Confidential Alumni Portal Access Only</p>
           <button onClick={onClose} className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:opacity-70">Close Review</button>
        </div>
      </div>
    </div>
  );
};

export default ReferralApplicantsModal;
