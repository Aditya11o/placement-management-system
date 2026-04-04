import React from 'react';
import { GraduationCap } from 'lucide-react';

interface AcademicInfoSectionProps {
  student: any;
  onChange: (field: string, value: any) => void;
}

const AcademicInfoSection: React.FC<AcademicInfoSectionProps> = ({ student, onChange }) => {
  return (
    <div className="col-span-12 lg:col-span-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 h-full hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <GraduationCap size={20} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Academic Information</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Department</label>
            <input 
              type="text" 
              value={student.department || ''} 
              onChange={(e) => onChange('department', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" 
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Course</label>
            <input 
              type="text" 
              value={student.course || ''} 
              onChange={(e) => onChange('course', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" 
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Passing Year</label>
            <input 
              type="number" 
              value={student.passing_year || student.passing_year || ''} 
              onChange={(e) => onChange('passing_year', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" 
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Current CGPA</label>
            <input 
              type="number" 
              step="0.01"
              value={student.current_cgpa || ''} 
              onChange={(e) => onChange('current_cgpa', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-black text-blue-600 transition-all bg-gray-50/30 outline-none focus:ring-2 focus:ring-blue-500/20" 
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">10th %</label>
            <input 
              type="number" 
              value={student.tenth_percentage || ''} 
              onChange={(e) => onChange('tenth_percentage', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-all bg-gray-50/30 outline-none focus:ring-2 focus:ring-blue-500/20" 
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">12th %</label>
            <input 
              type="number" 
              value={student.twelfth_percentage || ''} 
              onChange={(e) => onChange('twelfth_percentage', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-all bg-gray-50/30 outline-none focus:ring-2 focus:ring-blue-500/20" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicInfoSection;
