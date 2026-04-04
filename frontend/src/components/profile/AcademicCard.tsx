import React from 'react';
// Lucide icons removed if entirely unused

interface AcademicCardProps {
  student: any;
}

const AcademicCard: React.FC<AcademicCardProps> = ({ student }) => {
  return (
    <div className="col-span-12 lg:col-span-4">
      <div className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-xl shadow-md p-6 text-white h-full flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform duration-1000 group-hover:scale-150"></div>
        <div>
          <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-4">Academic Performance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black text-white tracking-tighter">{student.current_cgpa || '0.0'}</span>
            <span className="text-xl font-bold text-blue-300">CGPA</span>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="flex justify-between items-end mb-2">
            <p className="text-sm font-medium text-blue-100">Profile Completion</p>
            <p className="text-lg font-black text-white">{student.profile_completion || 0}%</p>
          </div>
          <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div 
              className="bg-blue-400 h-full rounded-full shadow-[0_0_12px_rgba(96,165,250,0.5)] transition-all duration-1000" 
              style={{ width: `${student.profile_completion || 0}%` }}
            />
          </div>
          <p className="text-[10px] text-blue-200/60 mt-3 font-medium">Complete your academic & contact details</p>
        </div>
      </div>
    </div>
  );
};

export default AcademicCard;
