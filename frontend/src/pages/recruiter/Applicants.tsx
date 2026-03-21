import React, { useState, useEffect } from 'react';
import api from '../../api';
import Card from '../../components/Card';
import type { Job, Application } from '../../types';

const Applicants: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/jobs');
      setJobs(data);
      if (data.length > 0) handleSelectJob(data[0]._id);
      else setLoading(false);
    } catch (err: any) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSelectJob = async (jobId: string) => {
    setLoading(true);
    setSelectedJob(jobId);
    try {
      const { data } = await api.get(`/applications/job/${jobId}`);
      setApplicants(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: string, status: string) => {
    try {
      await api.put(`/applications/${appId}`, { status });
      if (selectedJob) handleSelectJob(selectedJob); // Refresh list
    } catch (err: any) {
      alert('Failed to update status');
    }
  };

  if (loading && jobs.length === 0) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="display-md mb-2">Applicants</h2>
        <p className="text-[var(--on-surface-variant)] text-lg">Review and shortlist candidates for your roles.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4">
        {jobs.map(job => (
          <button
            key={job._id}
            onClick={() => handleSelectJob(job._id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              selectedJob === job._id 
                ? 'bg-[var(--primary-container)] text-[var(--on-primary)]' 
                : 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)]'
            }`}
          >
            {job.title}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--surface-container-low)]">
                <th className="p-4 label-sm font-semibold border-b border-[var(--surface-container)]">Candidate Name</th>
                <th className="p-4 label-sm font-semibold border-b border-[var(--surface-container)]">Email</th>
                <th className="p-4 label-sm font-semibold border-b border-[var(--surface-container)]">Resume</th>
                <th className="p-4 label-sm font-semibold border-b border-[var(--surface-container)]">Current Status</th>
                <th className="p-4 label-sm font-semibold border-b border-[var(--surface-container)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicants.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center">No applicants for this role yet.</td></tr>
              ) : (
                applicants.map((app) => (
                  <tr key={app._id} className="border-b border-[var(--surface-container)] hover:bg-[var(--surface)] transition-colors">
                    <td className="p-4 font-bold text-[var(--primary)]">{(app.student as any)?.name}</td>
                    <td className="p-4 text-[var(--on-surface-variant)]">{(app.student as any)?.email}</td>
                    <td className="p-4">
                      {app.resume ? <a href={app.resume} target="_blank" rel="noreferrer" className="text-[var(--surface-tint)] underline">View</a> : 'N/A'}
                    </td>
                    <td className="p-4 font-semibold">{app.status}</td>
                    <td className="p-4 text-right space-x-2">
                       {app.status === 'Pending' && (
                         <>
                           <button onClick={() => handleUpdateStatus(app._id, 'Shortlisted')} className="text-sm font-bold text-green-700 bg-green-100 px-3 py-1 rounded-md">Shortlist</button>
                           <button onClick={() => handleUpdateStatus(app._id, 'Rejected')} className="text-sm font-bold text-red-700 bg-red-100 px-3 py-1 rounded-md">Reject</button>
                         </>
                       )}
                       {app.status === 'Shortlisted' && (
                         <button onClick={() => handleUpdateStatus(app._id, 'Selected')} className="text-sm font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-md">Mark Hired</button>
                       )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Applicants;
