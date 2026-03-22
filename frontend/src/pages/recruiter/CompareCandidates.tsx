import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Users,
  Loader2, ArrowLeft, BarChart3, 
  Mail, Phone, 
  ChevronRight, ExternalLink
} from 'lucide-react';
import api from '../../api';

const CompareCandidates: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get('jobId');
  
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!jobId) return;
      try {
        const [jobRes, appsRes] = await Promise.all([
          api.get(`/jobs/${jobId}`),
          api.get(`/applications/job/${jobId}`)
        ]);
        setJob(jobRes.data);
        // Only compare shortlisted or pending for now
        setApplications(appsRes.data.filter((app: any) => app.status !== 'rejected'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Candidate Comparison</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Side-by-side evaluation for <span className="text-blue-600">"{job?.title}"</span></p>
          </div>
        </div>
        <div className="flex gap-4">
           <button className="bg-white border border-gray-200 text-gray-600 px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2">
              <BarChart3 size={16} /> Export Analysis
           </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="overflow-x-auto pb-8">
        <div className="flex gap-6 min-w-max">
          {/* Comparison Labels Column */}
          <div className="w-64 space-y-4 pt-48 shrink-0">
             <div className="h-20 flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Academic Performance</div>
             <div className="h-32 flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Core Skills</div>
             <div className="h-48 flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Screening Answers</div>
             <div className="h-24 flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Evaluation Scores</div>
          </div>

          {/* Candidate Cards */}
          {applications.map((app) => (
            <div key={app._id} className="w-80 bg-white border border-gray-100 rounded-[32px] shadow-sm hover:shadow-2xl transition-all overflow-hidden flex flex-col group relative">
              {/* Card Header/Profile */}
              <div className="p-8 pb-6 bg-gray-50/50 border-b border-gray-50 text-center space-y-4">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden mx-auto">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${app.student?.name}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-xs ring-4 ring-blue-50">
                    {app.studentProfile?.studentDetails?.cgpa}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">{app.student?.name}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{app.studentProfile?.studentDetails?.branch}</p>
                </div>
                <div className="flex justify-center gap-2">
                  <button className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-all"><Mail size={14} /></button>
                  <button className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-all"><Phone size={14} /></button>
                  <button className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-all"><ExternalLink size={14} /></button>
                </div>
              </div>

              {/* Data Sections */}
              <div className="p-8 space-y-4 flex-1">
                {/* Academics */}
                <div className="h-20 space-y-2 border-b border-gray-50">
                  <div className="flex justify-between text-xs font-bold text-gray-600">
                    <span>CGPA</span>
                    <span className="text-blue-600">{app.studentProfile?.studentDetails?.cgpa}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(app.studentProfile?.studentDetails?.cgpa || 0) * 10}%` }}></div>
                  </div>
                </div>

                {/* Skills */}
                <div className="h-32 border-b border-gray-50 py-2 overflow-y-auto custom-scrollbar">
                  <div className="flex flex-wrap gap-1.5">
                    {app.studentProfile?.studentDetails?.skills?.slice(0, 6).map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-black uppercase rounded tracking-tighter border border-gray-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Screening Answers */}
                <div className="h-48 border-b border-gray-50 py-4 overflow-y-auto custom-scrollbar space-y-4">
                   {app.answers?.map((ans: any, i: number) => (
                     <div key={i} className="space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight line-clamp-1">{ans.question}</p>
                        <p className="text-[11px] font-medium text-gray-700 bg-gray-50 p-2 rounded-lg line-clamp-3 italic">"{ans.answer}"</p>
                     </div>
                   ))}
                   {(!app.answers || app.answers.length === 0) && (
                     <p className="text-center text-gray-300 italic text-xs py-10">No questions asked</p>
                   )}
                </div>

                {/* Evaluation Scores */}
                <div className="h-24 py-2 space-y-3">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <span>Technical</span>
                      <span className="text-gray-900">{app.evaluation?.technical || 'N/A'}</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <span>Communication</span>
                      <span className="text-gray-900">{app.evaluation?.communication || 'N/A'}</span>
                   </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-6 bg-white border-t border-gray-50">
                <button className="w-full py-4 bg-[#000613] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group/btn">
                  Select Candidate <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}

          {/* Empty Comparison Slot */}
          <div className="w-80 border-4 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center p-8 text-center space-y-4 opacity-50">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                <Users size={32} />
             </div>
             <p className="text-sm font-bold text-gray-400">Add another candidate<br/>to compare</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareCandidates;
