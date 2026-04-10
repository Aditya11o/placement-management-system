import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, XCircle, CheckCircle2, 
  User, List, Search, Loader2, Info, Star
} from 'lucide-react';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

import EvaluationModal from '../../components/recruiter/EvaluationModal';

const InterviewPipeline: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get('jobId') || '';

  const [loading, setLoading] = useState(true);
  const [pipelineData, setPipelineData] = useState<{ rounds: string[], pipeline: any[] }>({ rounds: [], pipeline: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal States
  const [evalModal, setEvalModal] = useState({
    isOpen: false,
    appId: '',
    candidateName: '',
    currentStage: ''
  });

  const fetchPipeline = async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      const res = await api.get(`/applications/job/${jobId}/pipeline`);
      setPipelineData(res.data);
    } catch (err: any) {
      showError('Failed to fetch pipeline data');
      navigate('/recruiter/applicants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, [jobId]);

  const handleAdvanceClick = (appId: string, candidateName: string, currentStage: string) => {
    setEvalModal({
      isOpen: true,
      appId,
      candidateName,
      currentStage
    });
  };

  const handleConfirmAdvance = async (data: { feedback: string, evaluationData: any }) => {
    try {
      setIsSubmitting(true);
      await api.patch(`/applications/${evalModal.appId}/advance`, data);
      showSuccess('Applicant advanced to next round with evaluation');
      setEvalModal(p => ({ ...p, isOpen: false }));
      fetchPipeline();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to advance applicant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (appId: string) => {
    if (!confirm('Are you sure you want to reject this candidate?')) return;
    try {
      await api.patch(`/applications/${appId}/reject-pipeline`, {
        feedback: 'Rejected from recruitment pipeline'
      });
      showSuccess('Applicant rejected');
      fetchPipeline();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to reject applicant');
    }
  };


  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            <span className="cursor-pointer hover:text-gray-600" onClick={() => navigate('/recruiter/applicants')}>Applicants</span>
            <span className="opacity-40">/</span>
            <span className="text-gray-900">Pipeline Board</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none uppercase tracking-tighter italic">Recruitment <span className="text-blue-600">Pipeline</span></h1>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => navigate(`/recruiter/applicants?jobId=${jobId}`)}
            className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center gap-2"
          >
            <List size={16} /> List View
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar min-h-[70vh]">
        {pipelineData.pipeline.map((column, idx) => (
          <div key={column.stage} className="flex-shrink-0 w-80 flex flex-col gap-4">
            {/* Column Header */}
            <div className={`p-4 rounded-2xl border-b-4 ${
              column.stage === 'Rejected' ? 'bg-rose-50 border-rose-500 text-rose-700' :
              column.stage === 'Selected' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' :
              'bg-gray-50 border-blue-500 text-gray-700'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[12px] font-black uppercase tracking-widest truncate max-w-[180px]">{column.stage}</h3>
                <span className="px-2 py-1 bg-white/50 backdrop-blur rounded-lg font-black text-[10px]">{column.applicants.length}</span>
              </div>
              <p className="text-[9px] font-bold opacity-60 uppercase tracking-wider italic">
                {idx === 0 ? 'Entry Point' : idx === pipelineData.pipeline.length - 2 ? 'Final Round' : column.stage === 'Rejected' ? 'Out of Process' : 'Intermediate Stage'}
              </p>
            </div>

            {/* Applicant Cards */}
            <div className="space-y-4">
              {column.applicants.map((app: any) => (
                <div key={app._id} className="group bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                      {app.student?.profilePhoto ? (
                        <img src={app.student.profilePhoto} alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <User size={20} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[14px] font-black text-gray-900 truncate tracking-tight">{app.student?.name}</h4>
                      <p className="text-[11px] font-bold text-gray-400 truncate uppercase italic">{app.student?.profile?.branch || 'N/A'}</p>
                    </div>
                    {app.student?.profile?.cgpa && (
                      <div className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg font-black text-[10px] shadow-inner">
                        {app.student.profile.cgpa}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(app.student?.profile?.skills || []).slice(0, 3).map((s: string) => (
                      <span key={s} className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded-md text-[9px] font-black uppercase">{s}</span>
                    ))}
                    {app.evaluation?.averageScore && (
                      <span className="ml-auto px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md text-[9px] font-black uppercase flex items-center gap-1">
                        <Star size={10} fill="currentColor" /> {app.evaluation.averageScore}
                      </span>
                    )}
                  </div>

                  {/* Historical Snippets */}
                  {app.interviews && app.interviews.length > 0 && (
                    <div className="mb-4 bg-gray-50/50 rounded-xl p-3 border border-gray-100 flex flex-col gap-2">
                       {app.interviews.map((int: any) => (
                         <div key={int.id} className="flex gap-2">
                            <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <p className="text-[10px] font-bold text-gray-500 italic line-clamp-2 leading-tight">
                              "<span className="text-gray-900">{int.feedback}</span>"
                            </p>
                         </div>
                       ))}
                    </div>
                  )}

                  {/* Actions */}
                  {column.stage !== 'Selected' && column.stage !== 'Rejected' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleReject(app._id)}
                        className="p-2.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                        title="Reject Candidate"
                      >
                        <XCircle size={18} />
                      </button>
                      <button 
                        onClick={() => handleAdvanceClick(app._id, app.student?.name, column.stage)}
                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                      >
                        Advance <ArrowRight size={14} />
                      </button>
                    </div>
                  )}

                  {column.stage === 'Rejected' && (
                    <div className="py-2 px-3 bg-gray-50 rounded-xl flex items-center gap-3">
                      <div className="p-1 bg-white rounded-lg shadow-sm">
                        <Info size={14} className="text-gray-300" />
                      </div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase italic">Archived on {new Date(app.updatedAt).toLocaleDateString()}</p>
                    </div>
                  )}

                  {column.stage === 'Selected' && (
                    <div className="py-2 px-3 bg-emerald-50 rounded-xl flex items-center gap-3 border border-emerald-100">
                      <div className="p-1 bg-white rounded-lg shadow-sm">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      </div>
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Hiring Protocol Ready</p>
                    </div>
                  )}
                </div>
              ))}

              {column.applicants.length === 0 && (
                <div className="py-8 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-center opacity-40">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center mb-2">
                    <Search size={16} className="text-gray-300" />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest">No Applicants</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <EvaluationModal 
        isOpen={evalModal.isOpen}
        onClose={() => setEvalModal(p => ({ ...p, isOpen: false }))}
        onConfirm={handleConfirmAdvance}
        candidateName={evalModal.candidateName}
        currentStage={evalModal.currentStage}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default InterviewPipeline;
