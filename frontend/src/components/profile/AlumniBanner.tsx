import React from 'react';
import { GraduationCap } from 'lucide-react';

interface AlumniBannerProps {
  student: any;
  onJoinAlumni: () => void;
  onApplyMentor: () => void;
}

const AlumniBanner: React.FC<AlumniBannerProps> = ({ student, onJoinAlumni, onApplyMentor }) => {
  if (!student.passing_year || student.passing_year > new Date().getFullYear()) {
    return null;
  }

  return (
    <div className="col-span-12">
      <div className="bg-[#000613] text-white rounded-[40px] p-10 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-blue-500/30 transition-all duration-1000" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl text-blue-400 border border-white/10">
                <GraduationCap size={24} />
              </div>
              <div>
                  <h2 className="text-2xl font-black tracking-tight leading-none">Class of {student.passing_year} Graduation Perks</h2>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2">Alumni Engagement Program</p>
              </div>
            </div>
            <p className="text-gray-300 text-lg font-medium leading-relaxed">
              You've reached an incredible milestone! Join our <span className="text-blue-400 font-black">Alumni Mentor Network</span> to help the next generation of students. Post job referrals from your company or provide 1-on-1 career guidance.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button 
                  onClick={onJoinAlumni}
                  className="px-8 py-4 bg-white text-[#000613] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl active:scale-95"
              >
                  Join as Alumni
              </button>
              <button 
                   onClick={onApplyMentor}
                   className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95"
              >
                  Apply for Mentorship
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniBanner;
