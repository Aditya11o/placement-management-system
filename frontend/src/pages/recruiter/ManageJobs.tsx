import React, { useState, useEffect } from 'react';
import api from '../../api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Plus } from 'lucide-react';
import type { Job } from '../../types';

const ManageJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newJob, setNewJob] = useState<Partial<Job>>({ 
    title: '', description: '', companyName: '', location: '', salary: 0, jobType: 'Full-time', deadline: '' 
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/jobs');
      setJobs(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api.post('/jobs', newJob);
      setShowModal(false);
      fetchJobs();
      alert('Job created successfully');
    } catch (err: any) {
      alert('Failed to create job');
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-[var(--error-container)] text-[var(--primary)]';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="display-md mb-2">Manage Jobs</h2>
          <p className="text-[var(--on-surface-variant)] text-lg">Create and track your company's job postings.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus size={20} /> Post New Job
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--surface-container-low)]">
              <th className="p-4 label-sm font-semibold border-b border-[var(--surface-container)]">Role</th>
              <th className="p-4 label-sm font-semibold border-b border-[var(--surface-container)]">Type</th>
              <th className="p-4 label-sm font-semibold border-b border-[var(--surface-container)]">Posted</th>
              <th className="p-4 label-sm font-semibold border-b border-[var(--surface-container)]">Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center">No jobs posted yet.</td></tr>
            ) : (
              jobs.map(job => (
                <tr key={job._id} className="border-b border-[var(--surface-container)] hover:bg-[var(--surface)]">
                  <td className="p-4 font-bold text-[var(--primary)]">{job.title}</td>
                  <td className="p-4 text-[var(--on-surface-variant)]">{job.jobType}</td>
                  <td className="p-4 text-[var(--on-surface-variant)]">{new Date(job.createdAt || Date.now()).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 glass-panel flex justify-center items-center z-50">
          <Card className="w-full max-w-xl mx-4">
            <h3 className="title-md mb-4">Post a New Job</h3>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <Input label="Job Title" required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />
              <Input label="Company Name" required value={newJob.companyName} onChange={e => setNewJob({...newJob, companyName: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Location" required value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} />
                <Input label="Salary (LPA)" type="number" required value={newJob.salary} onChange={e => setNewJob({...newJob, salary: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Job Type" required value={newJob.jobType} onChange={e => setNewJob({...newJob, jobType: e.target.value})} />
                <Input label="Deadline" type="date" required value={newJob.deadline as string} onChange={e => setNewJob({...newJob, deadline: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="label-sm">Description</label>
                <textarea 
                  required
                  className="input-sleek h-24 resize-none" 
                  value={newJob.description} 
                  onChange={e => setNewJob({...newJob, description: e.target.value})}
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 font-semibold text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] rounded-md">Cancel</button>
                <Button type="submit">Publish Job</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;
