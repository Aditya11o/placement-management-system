import React, { useState } from 'react';
import { 
  ShieldCheck, Trash2, CheckCircle, 
  Filter, Search, 
  MessageSquare, ThumbsUp,
  Building2, ExternalLink, AlertCircle
} from 'lucide-react';
import { useExperiences, useDeleteExperience, Experience } from '../../hooks/useExperiences';
import { useNotification } from '../../context/NotificationContext';
import ListSkeleton from '../../components/skeletons/ListSkeleton';
import EmptyState from '../../components/EmptyState';
import { format } from 'date-fns';

const AdminManageExperiences: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showOnlyUnverified, setShowOnlyUnverified] = useState(false);
  
  const { data: experiences = [], isLoading } = useExperiences({ 
    search, 
    type: filterType === 'all' ? undefined : filterType 
  });
  
  const { mutate: deleteExp } = useDeleteExperience();
  const { showSuccess, showError } = useNotification();

  const filteredExperiences = experiences.filter((exp: Experience) => 
    showOnlyUnverified ? !exp.isVerified : true
  );

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this experience? This action cannot be undone.')) {
      deleteExp(id, {
        onSuccess: () => showSuccess('Experience deleted successfully'),
        onError: () => showError('Failed to delete experience')
      });
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase tracking-tighter flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-blue-600" strokeWidth={2.5} />
            Experience <span className="text-blue-600">Moderation</span>
          </h1>
          <p className="text-gray-500 font-medium mt-1">Review, verify, and moderate placement stories shared by students.</p>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Posts</p>
              <h3 className="text-2xl font-black text-gray-900">{experiences.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Verified</p>
              <h3 className="text-2xl font-black text-gray-900">
                {experiences.filter((e: Experience) => e.isVerified).length}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Pending Review</p>
              <h3 className="text-2xl font-black text-gray-900 line-clamp-1">
                {experiences.filter((e: Experience) => !e.isVerified).length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search by company or student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/20 font-medium transition-all"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="all">All Types</option>
              <option value="Interview">Interview</option>
              <option value="Placement">Placement</option>
              <option value="Internship">Internship</option>
            </select>
            <button 
              onClick={() => setShowOnlyUnverified(!showOnlyUnverified)}
              className={`px-6 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
                showOnlyUnverified 
                ? 'bg-amber-100 text-amber-700 shadow-inner' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Filter size={18} />
              Unverified Only
            </button>
          </div>
        </div>
      </div>

      {/* Content Table */}
      {isLoading ? (
        <ListSkeleton rows={5} />
      ) : filteredExperiences.length === 0 ? (
        <EmptyState 
          icon={ShieldCheck}
          title="Clear Slate" 
          description="No experiences match your current filters. Great job keeping the hub clean!"
        />
      ) : (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Contributor</th>
                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Company / Role</th>
                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Engagement</th>
                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredExperiences.map((exp: Experience) => (
                <tr key={exp.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-bold">
                        {exp.author.name[0]}
                      </div>
                      <div>
                        <p className="font-black text-gray-900">{exp.author.name}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          {format(new Date(exp.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-gray-400" />
                        <span className="font-black text-gray-900">{exp.company}</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600 mt-1">{exp.role}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-gray-500">
                        <ThumbsUp size={16} />
                        <span className="text-sm font-bold">{exp.upvotes.length}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <MessageSquare size={16} />
                        <span className="text-sm font-bold">{exp.comments.length}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {exp.isVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-green-100">
                        <CheckCircle size={12} /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-100">
                        <AlertCircle size={12} /> Pending Review
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => window.open(`/student/experiences/${exp.id}`, '_blank')}
                        className="p-3 bg-white text-gray-400 hover:text-blue-600 rounded-xl border border-gray-100 shadow-sm transition-all"
                        title="View Details"
                      >
                        <ExternalLink size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(exp.id)}
                        className="p-3 bg-white text-gray-400 hover:text-rose-600 rounded-xl border border-gray-100 shadow-sm transition-all"
                        title="Delete Post"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminManageExperiences;
