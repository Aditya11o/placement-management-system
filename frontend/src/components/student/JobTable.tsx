import React from 'react';

const JobTable: React.FC = () => {
  const jobs = [
    { company: 'Google', logo: 'G', role: 'SDE Intern', package: '$8,500/mo', location: 'Remote', deadline: 'Oct 30', status: 'Open', action: 'Apply', color: 'bg-emerald-100 text-emerald-700' },
    { company: 'Amazon', logo: 'A', role: 'PM Intern', package: '$7,000/mo', location: 'Seattle', deadline: 'Nov 5', status: 'Applied', action: 'Applied', color: 'bg-orange-100 text-orange-700', disabled: true },
    { company: 'Microsoft', logo: 'M', role: 'Data Analyst', package: '$6,500/mo', location: 'Bangalore', deadline: 'Nov 12', status: 'Open', action: 'Apply', color: 'bg-emerald-100 text-emerald-700' },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-xl font-semibold text-gray-900">Recent Job Openings</h3>
        <button className="text-blue-600 font-semibold text-sm hover:underline">
          View All Openings
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden w-full transition-all hover:shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-xs font-medium border-b border-gray-50">
                <th className="px-4 py-3 uppercase">Company</th>
                <th className="px-4 py-3 uppercase">Role & Package</th>
                <th className="px-4 py-3 uppercase">Location</th>
                <th className="px-4 py-3 uppercase">Deadline</th>
                <th className="px-4 py-3 uppercase text-center">Status</th>
                <th className="px-4 py-3 uppercase text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {jobs.map((job, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-500 flex-shrink-0">
                        {job.logo}
                      </div>
                      <span className="font-semibold text-gray-900 truncate">{job.company}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-gray-900">{job.role}</span>
                      <span className="text-xs text-gray-500">{job.package}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{job.location}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{job.deadline}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-medium uppercase ${
                      job.status === 'Open' ? 'bg-green-100 text-green-700' :
                      job.status === 'Applied' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      disabled={job.disabled}
                      className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                        job.disabled 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-blue-950 text-white hover:bg-black shadow-sm'
                      }`}
                    >
                      {job.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobTable;
