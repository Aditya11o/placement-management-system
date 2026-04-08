import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, CheckCircle2, XCircle, 
  Filter, BarChart3, X, LayoutGrid
} from 'lucide-react';

import Dropdown from '../../components/Dropdown';
import ApplicantsTable from '../../components/recruiter/applicants/ApplicantsTable';
import ApplicantScheduleModal from '../../components/recruiter/applicants/ApplicantScheduleModal';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

const Applicants: React.FC = () => {
  const { showSuccess, showError, showWarning } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialJobId = searchParams.get('jobId') || '';
  
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState(initialJobId);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  
  // Modal for scheduling
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulingApplicant, setSchedulingApplicant] = useState<any>(null);
  const [interviewDetails, setInterviewDetails] = useState({
    date: '',
    time: '',
    mode: 'Online',
    link: ''
  });

  const fetchRecruiterJobs = async () => {
    try {
      const res = await api.get('/jobs/my', { params: { limit: 0 } });
      const items = res.data?.data || res.data;
      setJobs(items);
      if (!selectedJob && items.length > 0) {
        setSelectedJob(items[0]._id);
      }
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      showError('Failed to fetch job postings', 'Fetch Error');
    }
  };

  const fetchApplicants = async () => {
    if (!selectedJob) return;
    try {
      setLoading(true);
      const res = await api.get(`/applications/job/${selectedJob}`, { params: { limit: 0 } });
      const items = res.data?.data || res.data;
      setApplicants(items);
    } catch (err: any) {
      console.error('Error fetching applicants:', err);
      showError('Failed to fetch applicants list', 'Fetch Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiterJobs();
  }, []);

  useEffect(() => {
    fetchApplicants();
  }, [selectedJob]);

  const handleUpdateStatus = async (id: string, status: string, additionalData = {}) => {
    try {
      await api.patch(`/applications/${id}/status`, { status, ...additionalData });
      fetchApplicants(); // Refresh list
    } catch (err: any) {
      console.error('Error updating status:', err);
      showError(err.response?.data?.message || 'Failed to update applicant status', 'Update Error');
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedApplicants.length === 0) return;
    try {
      setLoading(true);
      await api.patch('/applications/bulk-status', { ids: selectedApplicants, status });
      setSelectedApplicants([]);
      fetchApplicants();
      showSuccess(`Bulk update to ${status} successful!`, 'Bulk Update');
    } catch (err: any) {
      console.error('Error in bulk update:', err);
      showError(err.response?.data?.message || 'Failed to update applicants in bulk', 'Bulk Error');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedApplicants(prev => 
      prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedApplicants.length === filteredApplicants.length) {
      setSelectedApplicants([]);
    } else {
      setSelectedApplicants(filteredApplicants.map(app => app._id));
    }
  };

  const selectHighCGPA = () => {
    const highCgpaIds = filteredApplicants
      .filter(app => (app.studentProfile?.studentDetails?.cgpa || 0) >= 8.5)
      .map(app => app._id);
    setSelectedApplicants(highCgpaIds);
  };

  const openScheduleModal = (applicant: any) => {
    setSchedulingApplicant(applicant);
    setShowScheduleModal(true);
  };

  const handleConfirmSchedule = async () => {
    if (!interviewDetails.date || !interviewDetails.time) {
      showWarning('Please provide both date and time for the interview.', 'Missing Information');
      return;
    }

    const interviewDate = new Date(`${interviewDetails.date}T${interviewDetails.time}`);
    
    await handleUpdateStatus(schedulingApplicant._id, 'shortlisted', {
      interviewDate,
      interviewLink: interviewDetails.mode === 'Online' ? interviewDetails.link : '',
      feedback: `Interview scheduled for ${interviewDate.toLocaleString()}`
    });
    
    setShowScheduleModal(false);
    showSuccess('Interview scheduled and applicant shortlisted!', 'Schedule Success');
    setInterviewDetails({ date: '', time: '', mode: 'Online', link: '' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-black uppercase tracking-widest">Applied</span>;
      case 'shortlisted':
        return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[9px] font-black uppercase tracking-widest">Shortlisted</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded text-[9px] font-black uppercase tracking-widest">Rejected</span>;
      case 'accepted':
        return <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[9px] font-black uppercase tracking-widest">Hired</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 rounded text-[9px] font-black uppercase tracking-widest">{status}</span>;
    }
  };

  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = app.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         app.student?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || 
                      (activeTab === 'Applied' && app.status === 'pending') ||
                      (activeTab === 'Shortlisted' && app.status === 'shortlisted');
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
            <span>Portal</span>
            <span className="opacity-40">/</span>
            <span className="text-gray-900">Applicant Management</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Applicant Management</h1>
          <p className="text-gray-500 text-[14px] mt-2 max-w-2xl">
            Review, filter, and track candidates across your active job postings.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            disabled={!selectedJob}
            onClick={() => navigate(`/recruiter/pipeline?jobId=${selectedJob}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <LayoutGrid size={16} /> Pipeline View
          </button>
          <button 
            disabled={!selectedJob}
            onClick={() => navigate(`/recruiter/compare?jobId=${selectedJob}`)}
            className="px-6 py-3 bg-blue-950 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <BarChart3 size={16} /> Compare Candidates
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-12 gap-6 items-end">
          
          <div className="col-span-12 md:col-span-4 space-y-2">
            <Dropdown 
              label="Active Job Posting"
              value={selectedJob}
              onChange={(val) => {
                setSelectedJob(val);
                setSearchParams({ jobId: val });
              }}
              options={jobs.map(job => ({ label: job.title, value: job._id }))}
            />
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Search Candidates</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-[13px] text-gray-900 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Filter</label>
            <div className="flex p-1 bg-gray-100 rounded-xl">
              {['All', 'Applied', 'Shortlisted'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
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

        </div>
      </div>

      {/* Applicants Table Component */}
      <ApplicantsTable 
        loading={loading}
        filteredApplicants={filteredApplicants}
        selectedApplicants={selectedApplicants}
        toggleSelect={toggleSelect}
        toggleSelectAll={toggleSelectAll}
        getStatusBadge={getStatusBadge}
        openScheduleModal={openScheduleModal}
        handleUpdateStatus={handleUpdateStatus}
      />

      {/* Bulk Floating Action Bar */}
      {selectedApplicants.length > 0 && (
        <div className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 bg-[#000613] text-white px-4 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col md:flex-row items-center gap-4 md:gap-8 z-40 animate-in slide-in-from-bottom-10 duration-500 w-[90%] md:w-auto">
          <div className="flex flex-row md:flex-col items-baseline md:items-start gap-2 md:gap-0">
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">Selection</span>
            <span className="text-xs md:text-sm font-black tracking-tight">{selectedApplicants.length} Applicants</span>
          </div>
          <div className="hidden md:block h-8 w-px bg-white/10" />
          <div className="flex gap-2 md:gap-3 w-full md:w-auto">
            <button 
              onClick={() => handleBulkStatusUpdate('shortlisted')}
              className="flex-1 md:flex-none px-4 md:px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <CheckCircle2 size={14} /> <span className="md:inline">Bulk Shortlist</span>
            </button>
            <button 
              onClick={() => handleBulkStatusUpdate('rejected')}
              className="flex-1 md:flex-none px-4 md:px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <XCircle size={14} /> <span className="md:inline">Bulk Reject</span>
            </button>
          </div>
          <button 
            onClick={() => setSelectedApplicants([])}
            className="absolute top-2 right-2 md:static p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Criteria Selection Quick Action */}
      <div className="flex justify-end">
        <button 
          onClick={selectHighCGPA}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-200"
        >
          <Filter size={14} /> Select All CGPA ≥ 8.5
        </button>
      </div>

      {/* Schedule Modal Component */}
      <ApplicantScheduleModal 
        isVisible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        applicant={schedulingApplicant}
        interviewDetails={interviewDetails}
        setInterviewDetails={setInterviewDetails}
        onConfirm={handleConfirmSchedule}
      />

    </div>
  );
};

export default Applicants;
