import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Loader2 } from 'lucide-react';

interface JobTableProps {
  initialJobs?: any[];
}

const JobTable: React.FC<JobTableProps> = ({ initialJobs = [] }) => {
  const [jobs, setJobs] = useState(initialJobs);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const res = await api.get('/applications/my');
        setAppliedJobIds(res.data.map((app: any) => app.job._id));
      } catch (error) {
        console.error('Error fetching applied jobs:', error);
      }
    };
    fetchAppliedJobs();
  }, []);

  const handleApply = async (jobId: string) => {
    try {
      setLoading(true);
      await api.post(`/applications/${jobId}`);
      setAppliedJobIds([...appliedJobIds, jobId]);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to apply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-xl font-semibold text-gray-900">Recent Job Openings</h3>
        <button className="text-blue-600 font-semibold text-sm hover:underline">
          View All Openings
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden w-full transition-all hover:shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-xs font-medium border-b border-gray-50">
                <th className="px-4 py-3 uppercase">Company</th>
                <th className="px-4 py-3 uppercase">Role & Package</th>
                <th className="px-4 py-3 uppercase">Location</th>
                <th className="px-4 py-3 uppercase">Deadline</th>
                <th className="px-4 py-3 uppercase text-center">Status</th>
                <th className="px-4 py-3 uppercase text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {jobs.map((job: any) => {
                const isApplied = appliedJobIds.includes(job._id);
                return (
                  <tr key={job._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-500 flex-shrink-0">
                          {job.company_id?.company_name?.[0] || 'J'}
                        </div>
                        <span className="font-semibold text-gray-900 truncate">{job.company_id?.company_name || 'Tech Corp'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-gray-900">{job.title}</span>
                        <span className="text-xs text-gray-500">{job.salary}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{job.location}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {new Date(job.last_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-medium uppercase ${
                        isApplied ? 'bg-orange-100 text-orange-700' :
                        job.status === 'Open' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {isApplied ? 'Applied' : job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => handleApply(job._id)}
                        disabled={isApplied || loading}
                        className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                          isApplied || loading
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-blue-950 text-white hover:bg-black shadow-sm'
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
