import React, { useState, useEffect } from 'react';
import { X, Calendar, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';

interface Job {
  id: string;
  title: string;
  companyName: string;
}

interface DriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const DriveModal: React.FC<DriveModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('UPCOMING');
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setDescription(initialData.description || '');
        setStartDate(initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '');
        setEndDate(initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '');
        setStatus(initialData.status || 'UPCOMING');
        setSelectedJobIds(initialData.jobs ? initialData.jobs.map((j: any) => j.id) : []);
      } else {
        setName('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setStatus('UPCOMING');
        setSelectedJobIds([]);
      }
      fetchAvailableJobs();
    }
  }, [isOpen, initialData]);

  const fetchAvailableJobs = async () => {
    try {
      const { data } = await api.get('/jobs');
      if (data.success) {
        // Fetch only jobs that are not assigned to a drive or assigned to THIS drive
        const targetDriveId = initialData?.id;
        const validJobs = data.data.filter((job: any) => 
          !job.placementDriveId || job.placementDriveId === targetDriveId
        );
        setAvailableJobs(validJobs);
        setFilteredJobs(validJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  useEffect(() => {
    setFilteredJobs(
      availableJobs.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, availableJobs]);

  const handleToggleJob = (jobId: string) => {
    setSelectedJobIds(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const connectJobIds = selectedJobIds;
      // Find jobs that were connected before but are not anymore
      const disconnectJobIds = initialData?.jobs
        ? initialData.jobs.filter((j: any) => !selectedJobIds.includes(j.id)).map((j: any) => j.id)
        : [];

      await onSave({
        name,
        description,
        startDate,
        endDate,
        status,
        jobIds: connectJobIds, // for create
        connectJobIds, // for update
        disconnectJobIds // for update
      });
      onClose();
    } catch (error) {
      console.error('Error saving drive:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed inset-x-4 max-w-2xl mx-auto top-[5vh] bottom-[5vh] bg-white rounded-3xl shadow-2xl z-[9999] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                {initialData ? 'Edit Placement Drive' : 'Create Placement Drive'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Drive Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., Summer Internship Drive 2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Brief description of the hiring event..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Attach Jobs</h3>
                
                <div className="relative mb-4">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by job title or company..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div className="border border-gray-200 rounded-xl max-h-60 overflow-y-auto bg-gray-50 p-2 space-y-2">
                  {filteredJobs.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      No available jobs found.
                    </div>
                  ) : (
                    filteredJobs.map(job => {
                      const isSelected = selectedJobIds.includes(job.id);
                      return (
                        <div
                          key={job.id}
                          onClick={() => handleToggleJob(job.id)}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${
                            isSelected 
                              ? 'bg-blue-50 border-blue-200 text-blue-900' 
                              : 'bg-white border-transparent hover:border-gray-200 shadow-sm'
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-sm">{job.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{job.companyName}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  {selectedJobIds.length} job(s) selected
                </p>
              </div>
            </form>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-3xl">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : null}
                {initialData ? 'Save Changes' : 'Create Drive'}
              </button>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};

export default DriveModal;
