import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Loader2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface JobTableProps {
  initialJobs?: any[];
}

const JobTable: React.FC<JobTableProps> = ({ initialJobs = [] }) => {
  const { showError } = useNotification();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(initialJobs);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialJobs.length > 0) {
      setJobs(initialJobs);
    }
  }, [initialJobs]);
// ... existing useEffects
  const handleApply = async (jobId: string) => {
    try {
      setLoading(true);
      await api.post(`/applications/${jobId}`);
      setAppliedJobIds([...appliedJobIds, jobId]);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to apply for this job', 'Application Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-xl font-semibold text-on-surface">Recent Job Openings</h3>
        <button 
          onClick={() => navigate('/student/jobs')}
          className="text-blue-600 font-semibold text-sm hover:underline"
        >
          View All Openings
        </button>
      </div>
      <div className="bg-surface-container-lowest rounded-xl shadow-ambient border border-outline-variant overflow-hidden w-full transition-all hover:shadow-lg">
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="text-on-surface-variant text-xs font-medium border-b border-outline-variant/30">
                <th scope="col" className="px-4 py-3 uppercase">Company</th>
                <th scope="col" className="px-4 py-3 uppercase">Role & Package</th>
                <th scope="col" className="px-4 py-3 uppercase">Location</th>
                <th scope="col" className="px-4 py-3 uppercase">Deadline</th>
                <th scope="col" className="px-4 py-3 uppercase text-center">Status</th>
                <th scope="col" className="px-4 py-3 uppercase text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {jobs.map((job: any) => {
                const isApplied = appliedJobIds.includes(job._id);
                return (
                  <tr key={job._id} className="hover:bg-surface-container transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center font-bold text-on-surface-variant flex-shrink-0">
                          {job.companyName?.[0] || 'J'}
                        </div>
                        <span className="font-semibold text-on-surface truncate">{job.companyName || 'Tech Corp'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-on-surface">{job.title}</span>
                        <span className="text-xs text-on-surface-variant">{job.salary}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-on-surface-variant">{job.location}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-on-surface-variant">
                        {new Date(job.last_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-medium uppercase ${
                        isApplied ? 'bg-orange-100 text-orange-700' :
                        job.status === 'Open' ? 'bg-green-100 text-green-700' :
                        'bg-surface-container text-on-surface-variant'
                      }`}>
                        {isApplied ? 'Applied' : job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => handleApply(job._id)}
                        disabled={isApplied || loading}
                        aria-label={isApplied ? `Already applied for ${job.title} at ${job.companyName}` : `Apply for ${job.title} at ${job.companyName}`}
                        className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                          isApplied || loading
                            ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed' 
                            : 'bg-primary text-on-primary hover:opacity-90 shadow-sm'
                        }`}
                      >
                        {loading && !isApplied ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : (isApplied ? 'Applied' : 'Apply')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobTable;
