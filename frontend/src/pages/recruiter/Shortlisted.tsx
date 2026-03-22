import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Square, 
  Download, Eye, 
  Calendar, X, UserMinus, 
  UserCheck,
  Video, MapPin, ArrowRight
} from 'lucide-react';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

const Shortlisted: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [activeTab, setActiveTab] = useState('All');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [candidateToSchedule, setCandidateToSchedule] = useState<any>(null);
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Evaluation state
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [evaluationData, setEvaluationData] = useState({
    technical: 0,
    communication: 0,
    problemSolving: 0,
    overallFeedback: ''
  });

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/my');
      setJobs(res.data);
      if (res.data.length > 0) setSelectedJob(res.data[0]._id);
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      showError('Failed to fetch jobs', 'Fetch Error');
    }
  };

  const fetchCandidates = async () => {
    if (!selectedJob) return;
    try {
      setLoading(true);
      const res = await api.get(`/applications/job/${selectedJob}`);
      // Filter only shortlisted, accepted, or Selected
      const filtered = res.data.filter((app: any) => 
        ['shortlisted', 'accepted', 'Selected'].includes(app.status)
      );
      setCandidates(filtered);
    } catch (err: any) {
      console.error('Error fetching candidates:', err);
      showError('Failed to fetch candidates', 'Fetch Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [selectedJob]);

  const exportToCSV = async () => {
    if (!selectedJob) return;
    try {
      const res = await api.get(`/applications/export/${selectedJob}`);
      const data = res.data;
      const csvRows = [
        ['Name', 'Email', 'Course', 'Branch', 'CGPA', 'Status', 'Applied Date'].join(','),
        ...data.map((row: any) => [
          `"${row.StudentName}"`,
          row.Email,
          `"${row.Course}"`,
          `"${row.Branch}"`,
          row.CGPA,
          row.Status,
          new Date(row.AppliedDate).toLocaleDateString()
        ].join(','))
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `Shortlisted_Candidates_${selectedJob}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showSuccess('Data exported to CSV successfully!', 'Export Success');
    } catch (err: any) {
      console.error('Export error:', err);
      showError('Failed to export data', 'Export Error');
    }
  };

  const handleEvaluationSubmit = async () => {
    if (!candidateToSchedule) return;
    try {
      await api.patch(`/applications/${candidateToSchedule._id}/status`, {
        status: 'accepted',
        evaluation: evaluationData
      });
      setShowEvaluationModal(false);
      fetchCandidates();
      showSuccess('Evaluation submitted and candidate selected!', 'Success');
    } catch (err: any) {
      console.error('Evaluation error:', err);
      showError(err.response?.data?.message || 'Failed to submit evaluation', 'Evaluation Error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-black uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />Shortlisted</span>;
      case 'accepted':
      case 'Selected':
        return <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[9px] font-black uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Selected</span>;
      default:
        return <span className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 rounded text-[9px] font-black uppercase tracking-widest">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shortlisted Candidates</h1>
          <p className="text-gray-500 text-[14px] mt-1">Filter, evaluate, and manage candidates in your selection pipeline.</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="px-6 py-3 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-black/10 flex items-center gap-2 active:scale-95"
        >
          <Download size={16} />
          Export to CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-6 items-center">
        <div className="w-full md:w-[300px] space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select Job Posting</label>
          <select 
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-[13px] text-gray-900 focus:outline-none transition-all appearance-none cursor-pointer"
          >
            {jobs.map(job => (
              <option key={job._id} value={job._id}>{job.title}</option>
            ))}
          </select>
        </div>
        <div className="flex p-1 bg-gray-100 rounded-xl w-full md:w-auto h-fit self-end mb-0.5">
          {['All', 'Not Scheduled', 'Scheduled', 'Selected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-[13px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 w-12">
                  <button className="text-gray-300 hover:text-gray-900">
                    <Square size={20} />
                  </button>
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Course / Degree</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Skills</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {candidates.map((candidate) => (
                <tr key={candidate._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <button 
                      onClick={() => {
                        const id = candidate._id;
                        setSelectedCandidates(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
                      }}
                      className={`${selectedCandidates.includes(candidate._id) ? 'text-blue-600' : 'text-gray-200 group-hover:text-gray-300'}`}
                    >
                      {selectedCandidates.includes(candidate._id) ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center overflow-hidden border border-blue-100">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.student?.name}`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900 tracking-tight text-[14px]">{candidate.student?.name}</span>
                        <span className="text-[11px] font-bold text-gray-400 mt-0.5">{candidate.student?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-gray-600 font-bold">
                    {candidate.studentProfile?.studentDetails?.course || 'N/A'}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.studentProfile?.studentDetails?.skills?.slice(0, 3).map((skill: string) => (
                        <span key={skill} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded text-[9px] font-black uppercase tracking-tighter border border-gray-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      {getStatusBadge(candidate.status)}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setCandidateToSchedule(candidate);
                          setShowEvaluationModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Evaluate & Select">
                        <UserCheck size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Reject">
                        <UserMinus size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {candidates.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center font-bold text-gray-400">No candidates in funnel</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white border border-gray-200 rounded-2xl p-6 shadow-sm gap-4">
        <div className="text-[12px] font-bold text-gray-400">
          <span className="text-gray-900 font-black">{selectedCandidates.length}</span> candidates selected
        </div>
        <button className="px-10 py-3.5 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center gap-2 active:scale-95 invisible group-hover:visible" style={{ visibility: selectedCandidates.length > 0 ? 'visible' : 'hidden' }}>
          Move Selected to Final List
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Evaluation Modal */}
      {showEvaluationModal && (
        <div className="fixed inset-0 bg-[#000613]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-[500px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-10 pt-10 pb-6 flex justify-between items-center text-gray-900">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Technical Evaluation</h2>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Candidate: {candidateToSchedule?.student?.name}</p>
              </div>
              <button 
                onClick={() => setShowEvaluationModal(false)}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="px-10 pb-8 space-y-6">
              {[
                { key: 'technical', label: 'Technical Proficiency' },
                { key: 'communication', label: 'Communication Skills' },
                { key: 'problemSolving', label: 'Problem Solving' }
              ].map((skill) => (
                <div key={skill.key} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{skill.label}</label>
                    <span className="text-[14px] font-black text-blue-600">{(evaluationData as any)[skill.key]}/10</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="10" 
                    value={(evaluationData as any)[skill.key]}
                    onChange={(e) => setEvaluationData({...evaluationData, [skill.key]: parseInt(e.target.value)})}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              ))}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Overall Feedback</label>
                <textarea 
                  placeholder="Summarize the candidate's performance..."
                  value={evaluationData.overallFeedback}
                  onChange={(e) => setEvaluationData({...evaluationData, overallFeedback: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-[13px] outline-none h-24 resize-none focus:bg-white focus:border-gray-200 transition-all"
                />
              </div>

              <button 
                onClick={handleEvaluationSubmit}
                className="w-full py-4 bg-[#000613] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/20 active:scale-95"
              >
                Submit Evaluation & Select
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shortlisted;
