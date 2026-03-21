import React from 'react';
import { ExternalLink, ChevronRight } from 'lucide-react';

const InterviewPanel: React.FC = () => {
  const interviews = [
    { company: 'Google SDE I', time: 'Oct 28, 2023 • 10:30 AM', mode: 'ONLINE', modeColor: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { company: 'Uber Final Round', time: 'Oct 30, 2023 • 02:00 PM', mode: 'OFFLINE', modeColor: 'text-slate-600 bg-slate-50 border-slate-200' },
    { company: 'Stripe Technical', time: 'Nov 02, 2023 • 08:00 AM', mode: 'ONLINE', modeColor: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  ];

  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 h-full hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Upcoming Interviews</h3>
        <ChevronRight size={20} className="text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>
      <div className="space-y-4">
        {interviews.map((interview, i) => (
          <div key={i} className="p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-900">{interview.company}</h4>
                <p className="text-xs text-gray-500 mt-1">{interview.time}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-tight ${
                interview.mode === 'ONLINE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {interview.mode}
              </span>
            </div>
            <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mt-4 hover:text-blue-600 transition-colors">
              <ExternalLink size={14} /> View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewPanel;
