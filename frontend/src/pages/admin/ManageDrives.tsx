import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Briefcase, ChevronRight, Clock, Edit2, Trash2, Building } from 'lucide-react';
import DriveModal from '../../components/admin/DriveModal';
import { toast } from 'react-hot-toast';
import api from '../../api';

interface Drive {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  _count: { jobs: number };
  jobs: any[];
}

const ManageDrives: React.FC = () => {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState<Drive | undefined>();

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/drives');
      if (data.success) {
        setDrives(data.data);
      } else {
        toast.error('Failed to fetch drives');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Server error while fetching drives');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDrive = async (driveData: any) => {
    try {
      const isEditing = !!selectedDrive;
      const url = isEditing ? `/drives/${selectedDrive.id}` : `/drives`;
      
      const { data } = isEditing 
        ? await api.put(url, driveData)
        : await api.post(url, driveData);
      
      if (data.success) {
        toast.success(`Drive ${isEditing ? 'updated' : 'created'} successfully!`);
        fetchDrives();
      } else {
        toast.error(data.message || 'Failed to save drive');
      }
    } catch (error: any) {
      console.error('Error saving drive:', error);
      toast.error(error.response?.data?.message || 'Server error while saving drive');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this placement drive?')) {
      try {
        const { data } = await api.delete(`/drives/${id}`);
        if (data.success) {
          toast.success('Drive deleted successfully');
          fetchDrives();
        } else {
          toast.error(data.message || 'Failed to delete drive');
        }
      } catch (error: any) {
        console.error('Error:', error);
        toast.error(error.response?.data?.message || 'Server error deleting drive');
      }
    }
  };

  const openCreateModal = () => {
    setSelectedDrive(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (drive: Drive) => {
    setSelectedDrive(drive);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>;
      case 'UPCOMING':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">Upcoming</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider">Completed</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-full -z-10 opacity-70"></div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Placement Drives</h1>
          <p className="text-gray-500 font-medium max-w-2xl text-sm">
            Organize multiple job postings into unified campus hiring events. Group companies, set deadlines, and track overall application progress.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="shrink-0 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 hover:shadow-lg hover:shadow-gray-900/20 shadow-md"
        >
          <Plus className="w-5 h-5" />
          Create New Drive
        </button>
      </div>

      {/* Drives Grid */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : drives.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No placement drives yet</h3>
          <p className="text-gray-500 mb-6">Create your first drive to group jobs together for students.</p>
          <button
            onClick={openCreateModal}
            className="text-blue-600 font-bold hover:text-blue-700 flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" /> Create Drive
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {drives.map((drive, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={drive.id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
            >
              {/* Status Banner */}
              <div className="flex items-center justify-between mb-4">
                {getStatusBadge(drive.status)}
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditModal(drive)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                    title="Edit Drive"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(drive.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    title="Delete Drive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Info */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{drive.name}</h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2 min-h-[40px]">
                {drive.description || 'No description provided.'}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Jobs Link</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900">{drive._count?.jobs || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Timeline</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {new Date(drive.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    {' - '}
                    {new Date(drive.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Companies Preview */}
              {drive.jobs && drive.jobs.length > 0 && (
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      Including: {Array.from(new Set(drive.jobs.map(j => j.companyName))).slice(0, 2).join(', ')}
                      {new Set(drive.jobs.map(j => j.companyName)).size > 2 ? '...' : ''}
                    </span>
                  </div>
                  <button 
                    onClick={() => openEditModal(drive)}
                    className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group/btn"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Drive Modal */}
      <DriveModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDrive}
        initialData={selectedDrive}
      />
    </div>
  );
};

export default ManageDrives;
