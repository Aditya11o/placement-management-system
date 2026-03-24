import React, { useState, useEffect } from 'react';
import { X, Loader2, Sparkles } from 'lucide-react';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project?: any; // Optional project for editing
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onSuccess, project }) => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    link: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies || '',
        link: project.link || '',
        start_date: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        end_date: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : ''
      });
    } else if (!project && isOpen) {
      setFormData({
        title: '',
        description: '',
        technologies: '',
        link: '',
        start_date: '',
        end_date: ''
      });
    }
  }, [project, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (project?._id) {
        await api.put(`/profile/projects/${project._id}`, formData);
        showSuccess('Project updated successfully!', 'Update Success');
      } else {
        await api.post('/profile/projects', formData);
        showSuccess('Project added successfully!', 'Addition Success');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to save project', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-hidden">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-zoom-in border border-white/20 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gradient-to-r from-blue-950 to-blue-900 text-white relative shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="relative z-10">
            <h3 className="text-2xl font-black tracking-tight">{project ? 'Update Project' : 'Add New Project'}</h3>
            <p className="text-blue-200 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
              {project ? 'Refine your work details' : 'Showcase your best work'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-95 relative z-10">
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-gray-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Project Title</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. AI-Powered Portfolio"
                  className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm placeholder:text-gray-300"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Technical Description</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Briefly explain what you built and the problems you solved..."
                  className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-600 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm resize-none placeholder:text-gray-300"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Technologies Used</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="React, Tailwind, Node.js..."
                    className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 pl-12 text-sm font-bold text-blue-600 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm placeholder:text-gray-300"
                    value={formData.technologies}
                    onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  />
                  <Sparkles size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Live Link / Repository (Optional)</label>
                <input 
                  type="url" 
                  placeholder="https://github.com/username/project"
                  className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-600 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm placeholder:text-gray-300"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Start Date</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">End Date</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex gap-4 pt-4 shrink-0">
              <button 
                type="button"
                onClick={onClose}
                className="px-8 py-4 bg-white text-gray-500 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-gray-100 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
              >
                Discard
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 px-8 py-4 bg-[#000613] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl group"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    {project ? 'Update Project' : 'Add to Profile'}
                    <Sparkles size={14} className="transition-transform group-hover:scale-125 group-hover:rotate-12" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal;
