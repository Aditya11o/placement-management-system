import React, { useState, useEffect } from 'react';
import { 
  Archive, AlertTriangle, Loader2,
  Calendar, BarChart3, ChevronRight 
} from 'lucide-react';
import api from '../../../api';

const ArchiveTab: React.FC = () => {
  const [archives, setArchives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);
  const [year, setYear] = useState('');

  const fetchArchives = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/archives');
      setArchives(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  const handleArchive = async () => {
    if (!year) return;
    try {
      setArchiving(true);
      await api.post('/admin/archive', { academicYear: year });
      setYear('');
      fetchArchives();
    } catch (err: any) {
      console.error(err);
    } finally {
      setArchiving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fade-in">
      {/* Tool */}
      <div className="lg:col-span-1">
        <div className="bg-[#000613] text-white rounded-[2.5rem] p-10 space-y-10 shadow-2xl">
          <div>
            <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
               <Calendar size={20} className="text-blue-500" /> Cycle Closure
            </h3>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2 italic">Institutional data freeze</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">Session Target</label>
              <input 
                type="text" 
                placeholder="e.g. 2024-25"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 focus:border-blue-500 rounded-2xl font-bold text-sm outline-none transition-all" 
              />
            </div>
            
            <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-4">
               <AlertTriangle size={20} className="text-amber-500 shrink-0" />
               <p className="text-[10px] text-amber-200/60 leading-relaxed font-bold italic">Warning: This action aggregates all active records and prepares the system for the next batch. Irreversible after sync.</p>
            </div>

            <button 
              disabled={archiving || !year}
              onClick={handleArchive}
              className="w-full py-5 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-xl"
            >
              {archiving ? <Loader2 size={16} className="animate-spin" /> : <><Archive size={14} /> Initialize Archive</>}
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="lg:col-span-2 space-y-8">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-lg font-black text-gray-900 tracking-tight">Archive Library</h3>
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full border border-gray-100">{archives.length} Batches</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {loading ? (
              <div className="col-span-2 flex py-20 items-center justify-center"><Loader2 className="w-8 h-8 text-[#000613] animate-spin" /></div>
           ) : archives.map((a) => (
             <div key={a._id} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:shadow-xl transition-all group overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-6">
                   <BarChart3 size={20} className="text-blue-600" />
                </div>
                <h4 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Cycle {a.academicYear}</h4>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-tighter italic mb-8 italic">Closed by System Admin</p>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Placed</p>
                      <p className="text-xl font-black text-gray-900">{a.placedStudents}</p>
                   </div>
                   <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Applications</p>
                      <p className="text-xl font-black text-gray-900">{a.totalApplications}</p>
                   </div>
                </div>

                <button className="w-full mt-8 py-3 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-xl hover:bg-[#000613] hover:text-white transition-all flex items-center justify-center gap-2 group/btn">
                   Explore Snapshot <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default ArchiveTab;
