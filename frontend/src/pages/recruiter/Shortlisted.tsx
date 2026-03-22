import React, { useState } from 'react';
import { 
  CheckSquare, Square, 
  Download, Eye, 
  Calendar, X, UserMinus, 
  UserCheck,
  Video, MapPin, ArrowRight
} from 'lucide-react';

const Shortlisted: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [candidateToSchedule, setCandidateToSchedule] = useState<any>(null);

  const sampleCandidates = [
    {
      id: 1,
      name: 'Arjun Jain',
      email: 'arjun.j@university.edu',
      degree: 'B.Tech CS',
      skills: ['React', 'Node.js'],
      status: 'Not Scheduled',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunJ'
    },
    {
      id: 2,
      name: 'Sarah Ahmed',
      email: 's.ahmed@university.edu',
      degree: 'B.Tech IT',
      skills: ['Python', 'AWS'],
      status: 'Scheduled',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    {
      id: 3,
      name: 'Rohan Parekh',
      email: 'rohanp@university.edu',
      degree: 'M.Tech AI',
      skills: ['Java', 'Spring'],
      status: 'Selected',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RohanP'
    }
  ];

  const toggleSelect = (id: number) => {
    if (selectedCandidates.includes(id)) {
      setSelectedCandidates(selectedCandidates.filter(c => c !== id));
    } else {
      setSelectedCandidates([...selectedCandidates, id]);
    }
  };

  const openScheduleModal = (candidate: any) => {
    setCandidateToSchedule(candidate);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Not Scheduled':
        return <span className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 rounded text-[9px] font-black uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-gray-300" />Not Scheduled</span>;
      case 'Scheduled':
        return <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-black uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />Scheduled</span>;
      case 'Selected':
        return <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[9px] font-black uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Selected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shortlisted Candidates</h1>
          <p className="text-gray-500 text-[14px] mt-1">Filter, evaluate, and manage candidates in your selection pipeline.</p>
        </div>
        <button className="px-6 py-3 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-black/10 flex items-center gap-2 active:scale-95">
          <Download size={16} />
          Export PDF Report
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-6 items-center">
        <div className="w-full md:w-[300px] space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select Job Posting</label>
          <select className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-[13px] text-gray-900 focus:outline-none transition-all appearance-none cursor-pointer">
            <option>Senior Software Engineer</option>
            <option>Data Analyst Intern</option>
          </select>
        </div>
        <div className="flex p-1 bg-gray-100 rounded-xl w-full md:w-auto h-fit self-end mb-0.5">
          {['All', 'Not Scheduled', 'Scheduled', 'Selected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-[13px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 w-12">
                  <button className="text-gray-300 hover:text-gray-900">
                    <Square size={20} />
                  </button>
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Course / Degree</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Skills</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sampleCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <button 
                      onClick={() => toggleSelect(candidate.id)}
                      className={`${selectedCandidates.includes(candidate.id) ? 'text-blue-600' : 'text-gray-200 group-hover:text-gray-300'}`}
                    >
                      {selectedCandidates.includes(candidate.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center overflow-hidden border border-blue-100">
                        <img src={candidate.photo} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900 tracking-tight text-[14px]">{candidate.name}</span>
                        <span className="text-[11px] font-bold text-gray-400 mt-0.5">{candidate.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-gray-600 font-bold">
                    {candidate.degree}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.skills.map(skill => (
                        <span key={skill} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded text-[9px] font-black uppercase tracking-tighter border border-gray-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      {getStatusBadge(candidate.status)}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all" title="View Profile">
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => openScheduleModal(candidate)}
                        className={`p-2 rounded-lg transition-all ${
                          candidate.status === 'Scheduled' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                        }`} 
                        title="Schedule Interview"
                      >
                        <Calendar size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Reject">
                        <UserMinus size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Move to Final List">
                        <UserCheck size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white border border-gray-200 rounded-2xl p-6 shadow-sm gap-4">
        <div className="text-[12px] font-bold text-gray-400">
          <span className="text-gray-900 font-black">{selectedCandidates.length}</span> candidates selected
        </div>
        <button className="px-10 py-3.5 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center gap-2 active:scale-95 invisible group-hover:visible" style={{ visibility: selectedCandidates.length > 0 ? 'visible' : 'hidden' }}>
          Move Selected to Final List
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Schedule Interview Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#000613]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-[500px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            
            {/* Modal Header */}
            <div className="px-10 pt-10 pb-6 flex justify-between items-center">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Schedule Interview</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Candidate Summary */}
            <div className="px-10 mb-8">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black text-lg">
                  {candidateToSchedule?.name.split(' ').map((n:any) => n[0]).join('')}
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Candidate</label>
                  <p className="font-black text-gray-900 text-lg tracking-tight">
                    {candidateToSchedule?.name} <span className="text-gray-400 mx-2">—</span> <span className="text-gray-500 font-bold text-base">{candidateToSchedule?.degree}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="px-10 pb-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Interview Date</label>
                  <input type="date" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 text-[13px] outline-none transition-all cursor-pointer" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Time Slot</label>
                  <input type="time" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 text-[13px] outline-none transition-all cursor-pointer" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Interview Mode</label>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 py-4 bg-white border-2 border-gray-900 rounded-xl font-black text-[12px] uppercase tracking-widest text-gray-900 shadow-lg shadow-black/5">
                    <Video size={18} />
                    Online
                  </button>
                  <button className="flex items-center justify-center gap-2 py-4 bg-gray-50 border border-gray-100 rounded-xl font-black text-[12px] uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all">
                   <MapPin size={18} />
                    Offline
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Meeting Link / Room No.</label>
                <div className="relative">
                  <video className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 invisible" />
                  <input 
                    type="text" 
                    placeholder="e.g. meet.google.com/abc-defg-hij"
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 text-[13px] outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-10 bg-gray-50 border-t border-gray-100 flex gap-4">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all"
              >
                Cancel
              </button>
              <button className="flex-2 px-12 py-4 bg-[#000613] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-2 active:scale-95">
                Confirm Schedule
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Shortlisted;
