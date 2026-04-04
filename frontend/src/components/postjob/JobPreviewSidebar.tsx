import React from 'react';
import { Eye, ChevronRight, MapPin, Calendar, Briefcase, Building2 } from 'lucide-react';
import { Info } from 'lucide-react';

interface JobPreviewSidebarProps {
  formData: {
    title: string;
    location: string;
    salary: string;
    deadline: string;
    skills: string[];
  };
  companyName: string;
}

const JobPreviewSidebar: React.FC<JobPreviewSidebarProps> = ({ formData, companyName }) => {
  return (
    <div className="col-span-12 lg:col-span-4 space-y-6">
      
      {/* Live Preview Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Eye size={12} />
            Live Preview
          </h3>
        </div>
        
        <div className="p-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                <Building2 size={20} />
              </div>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-wider rounded">New</span>
            </div>

            <div>
              <h4 className="text-lg font-black text-gray-900 tracking-tight leading-tight">
                {formData.title || 'e.g. Associate Software Engineer'}
              </h4>
              <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wide">
                {companyName || 'Your Organization'}
              </p>
            </div>

            <div className="space-y-2 border-t border-gray-50 pt-4">
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                <MapPin size={14} className="text-gray-400" />
                {formData.location || 'Bangalore, India'}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                <Briefcase size={14} className="text-gray-400" />
                {formData.salary || '12 - 15 LPA'}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                <Calendar size={14} className="text-gray-400" />
                Apply by {formData.deadline ? new Date(formData.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 24, 2023'}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.skills.map(skill => (
                <span key={skill} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[9px] font-black uppercase tracking-tighter border border-gray-100">
                  {skill}
                </span>
              ))}
            </div>

            <button className="w-full mt-4 flex items-center justify-end gap-1 text-[11px] font-black text-blue-600 uppercase tracking-widest hover:gap-2 transition-all">
              View Details
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Info Note Card */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex gap-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm border border-gray-100 flex-shrink-0">
          <Info size={20} />
        </div>
        <div>
          <p className="text-[12px] font-medium text-gray-500 leading-relaxed">
            This is a simulation of how students will see your post in their portal. Please <span className="text-gray-900 font-black">double-check</span> the salary and deadline.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobPreviewSidebar;
