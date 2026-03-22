import React, { useState, useEffect } from 'react';
import { 
  Archive, FileText, Download, 
  AlertTriangle, Loader2,
  Calendar, BarChart3, ChevronRight 
} from 'lucide-react';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

const YearlyArchive: React.FC = () => {
  const { showSuccess, showError, showWarning } = useNotification();
  const [archives, setArchives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);
  const [year, setYear] = useState('');

  const fetchArchives = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/archives');
      setArchives(res.data);
    } catch (err: any) {
      console.error(err);
      showError('Failed to fetch archiving history', 'Fetch Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  const handleArchive = async () => {
    if (!year) {
      showWarning('Please enter the academic year (e.g., 2024-25).', 'Year Required');
      return;
    }
    if (!confirm(`Are you sure you want to close the academic year ${year}? This will archive all current data.`)) return;
    
    try {
      setArchiving(true);
      await api.post('/admin/archive', { academicYear: year });
      showSuccess(`Academic year ${year} has been successfully archived!`, 'Archive Complete');
      setYear('');
      fetchArchives();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to archive year', 'Archive Error');
    } finally {
      setArchiving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Data Archiving</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Manage historical records and close academic cycles.</p>
        </div>
        <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
           <Archive size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Archiving Tool */}
        <div className="lg:col-span-1">
           <div className="bg-[#000613] text-white rounded-[40px] p-10 space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 blur-[80px] rounded-full" />
              <div className="relative z-10 space-y-6">
                <div>
                  <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                    <Calendar size={20} className="text-blue-400" /> Close Year
                  </h2>
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mt-2">Initialize batch closure</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">Academic Year</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 2024-25"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 focus:border-blue-500 rounded-2xl font-bold text-sm outline-none transition-all" 
                    />
                  </div>
                  
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3">
                     <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                     <p className="text-[10px] text-amber-200/80 leading-relaxed font-bold">This will aggregate all current jobs, applications, and placement results into a permanent record.</p>
                  </div>

                  <button 
                    disabled={archiving}
                    onClick={handleArchive}
                    className="w-full py-4 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 disabled:opacity-50"
                  >
                    {archiving ? <Loader2 size={16} className="animate-spin" /> : <><Archive size={14} /> Process Archiving</>}
                  </button>
                </div>
              </div>
           </div>
        </div>

        {/* Archives History */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                <FileText size={18} className="text-blue-600" /> Archived Cycles
              </h2>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">{archives.length} Records</span>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                <div className="col-span-2 flex py-20 items-center justify-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
              ) : archives.length === 0 ? (
                <div className="col-span-2 bg-white border border-gray-100 rounded-[32px] p-20 text-center text-gray-400 font-bold italic">No archives found.</div>
              ) : archives.map((archive) => (
                <div key={archive._id} className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                         <BarChart3 size={20} className="text-blue-600" />
                      </div>
                      <button className="p-2 text-gray-300 hover:text-blue-600 transition-all">
                         <Download size={18} />
                      </button>
                   </div>
                   <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-4">Class of {archive.academicYear}</h3>
                   
                   <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Placed</p>
                         <p className="text-lg font-black text-gray-900">{archive.placedStudents}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Applications</p>
                         <p className="text-lg font-black text-gray-900">{archive.totalApplications}</p>
                      </div>
                   </div>

                   <button className="w-full py-3 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 rounded-xl transition-all flex items-center justify-center gap-1">
                      View Final Report <ChevronRight size={14} />
                   </button>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default YearlyArchive;
