import React from 'react';

const ProfileProgress: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-950 to-blue-800 text-white p-5 rounded-xl shadow-md flex flex-col justify-between h-full min-h-[220px] transition-all hover:shadow-lg border border-blue-900/50">
      <div>
        <p className="text-sm font-medium text-blue-100/80 mb-3 uppercase tracking-wider">PROFILE READINESS</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tight">85%</span>
          <span className="text-xs font-semibold text-blue-100/60 uppercase">COMPLETE</span>
        </div>
        <div className="mt-5">
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full w-[85%] shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
          </div>
        </div>
      </div>
      <button className="bg-white text-blue-950 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all shadow-sm active:scale-95 mt-6">
        Complete Profile
      </button>
    </div>
  );
};

export default ProfileProgress;
