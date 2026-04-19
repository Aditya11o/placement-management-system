import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Briefcase, 
  ChevronRight, 
  Building, 
  Search, 
  ArrowRight,
  Loader2,
  Sparkles,
  MapPin,
  TrendingUp,
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../../api';
import CountdownTimer from '../../components/CountdownTimer';
import StatCard from '../../components/student/StatCard';
import { motion, AnimatePresence } from 'framer-motion';

interface Drive {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  jobs: any[];
  _count?: { jobs: number };
}

const PlacementDrives: React.FC = () => {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'UPCOMING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/drives');
        if (data.success) {
          setDrives(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch drives:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrives();
  }, []);

  const filteredDrives = useMemo(() => {
    return drives.filter(drive => {
      const matchesFilter = filter === 'ALL' || drive.status === filter;
      const matchesSearch = drive.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (drive.description && drive.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [drives, filter, searchQuery]);

  const activeDrivesCount = drives.filter(d => d.status === 'ACTIVE').length;
  const totalPositions = drives.reduce((acc, d) => acc + (d._count?.jobs || d.jobs.length), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-surface-tint" />
        <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest italic">
          Synchronizing Drive Arena...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Executive Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tighter flex items-center gap-3 uppercase italic">
            Placement <span className="text-surface-tint">Drives</span>
          </h1>
          <p className="text-xs text-on-surface-variant/70 font-medium mt-1 uppercase tracking-widest">
            Grouped high-impact hiring events with unified deadlines.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full border border-outline-variant/30">
          <Sparkles size={14} className="text-surface-tint" />
          <span className="text-[10px] font-black text-on-surface uppercase tracking-widest">Live Updates Enabled</span>
        </div>
      </div>

      {/* 2. Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Active Drives" 
          value={activeDrivesCount.toString()} 
          icon={Zap} 
          color="text-emerald-600 bg-emerald-500" 
          badge={activeDrivesCount > 0}
        />
        <StatCard 
          label="Total Positions" 
          value={totalPositions.toString()} 
          icon={Briefcase} 
          color="text-blue-600 bg-blue-500" 
        />
        <StatCard 
          label="Upcoming" 
          value={drives.filter(d => d.status === 'UPCOMING').length.toString()} 
          icon={Calendar} 
          color="text-indigo-600 bg-indigo-500" 
        />
        <StatCard 
          label="Success Rate" 
          value="84%" 
          icon={TrendingUp} 
          color="text-amber-600 bg-amber-500" 
        />
      </div>

      {/* 3. Main Dashboard Layout (8/4 Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Drive Feed (8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-container-lowest p-2 rounded-2xl border border-outline-variant/30 shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
              <input 
                type="text" 
                placeholder="Search drive name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-transparent border-none text-sm font-bold placeholder:text-on-surface-variant/30 focus:ring-0 outline-none uppercase tracking-tight"
              />
            </div>
            <div className="flex gap-1 p-1 bg-surface-container-low rounded-xl">
              {['ALL', 'ACTIVE', 'UPCOMING'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    filter === f 
                      ? 'bg-on-surface text-surface-container-lowest shadow-md' 
                      : 'text-on-surface-variant/60 hover:text-on-surface'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Drives List */}
          <div className="space-y-4">
            {filteredDrives.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {filteredDrives.map((drive, idx) => (
                  <motion.div
                    key={drive.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 hover:shadow-xl hover:shadow-surface-tint/5 transition-all duration-500 relative overflow-hidden"
                  >
                    {/* Status Ribbon */}
                    <div className={`absolute top-0 right-0 w-1.5 h-full ${
                      drive.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-surface-tint'
                    }`} />

                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Left Side: Metadata */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-[0.15em] ${
                            drive.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-tint/10 text-surface-tint'
                          }`}>
                            {drive.status === 'ACTIVE' ? 'Live Now' : 'Locked'}
                          </div>
                          <div className="flex items-center gap-1.5 text-on-surface-variant/40">
                            <Calendar size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest italic">
                              {new Date(drive.startDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-xl font-black text-on-surface tracking-tight uppercase leading-none group-hover:text-surface-tint transition-colors">
                            {drive.name}
                          </h2>
                          <p className="text-xs text-on-surface-variant/60 font-medium leading-relaxed line-clamp-2 mt-2">
                            {drive.description || "Flagship placement drive with industry leaders and innovative startups."}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-2">
                           <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg border border-outline-variant/10">
                              <Building size={14} className="text-surface-tint" />
                              <span className="text-[10px] font-black text-on-surface uppercase tracking-widest italic">
                                {drive._count?.jobs || drive.jobs.length} Entities
                              </span>
                           </div>
                           <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg border border-outline-variant/10">
                              <MapPin size={14} className="text-on-surface-variant/40" />
                              <span className="text-[10px] font-black text-on-surface uppercase tracking-widest italic">Mixed Mode</span>
                           </div>
                        </div>
                      </div>

                      {/* Right Side: Deadline & Action */}
                      <div className="w-full md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-outline-variant/30 pt-6 md:pt-0 md:pl-6">
                        <div className="space-y-2 mb-6">
                          <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest flex items-center gap-1">
                            <Clock size={10} /> Deadline
                          </p>
                          <div className="scale-75 origin-top-left -ml-4">
                             <CountdownTimer targetDate={drive.endDate} />
                          </div>
                        </div>

                        <Link 
                          to={`/student/drives/${drive.id}`}
                          className="w-full py-4 bg-on-surface hover:bg-surface-tint text-surface-container-lowest rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn"
                        >
                          Enter Drive <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-20 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/50 space-y-4">
                 <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto text-on-surface-variant/20">
                    <AlertCircle size={32} />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-lg font-black text-on-surface uppercase italic">No Active Fronts</h3>
                    <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">Try adjusting your filters or check back later.</p>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar (4) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          
          {/* Drive Readiness Widget */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-surface-tint/5 rounded-bl-[4rem] group" />
             <h3 className="text-[11px] font-black text-on-surface tracking-widest flex items-center gap-2 uppercase italic mb-6">
                <Zap size={16} className="text-surface-tint" />
                Participation Protocol
             </h3>
             <div className="space-y-4">
                <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                   </div>
                   <div>
                      <h4 className="text-[11px] font-black text-on-surface uppercase italic">Profile Verification</h4>
                      <p className="text-[10px] text-on-surface-variant/60 font-medium leading-tight mt-1">Ensure your academic data is verified by the TPO cell before applying.</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Zap size={16} className="text-blue-600" />
                   </div>
                   <div>
                      <h4 className="text-[11px] font-black text-on-surface uppercase italic">Single Deadline</h4>
                      <p className="text-[10px] text-on-surface-variant/60 font-medium leading-tight mt-1">Drives have a unified deadline. Missing it blocks all companies in the set.</p>
                   </div>
                </div>
            </div>
          </div>

          {/* FAQ Mini Widget */}
          <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30">
             <h3 className="text-[11px] font-black text-on-surface tracking-widest flex items-center gap-2 uppercase italic mb-4">
                FAQ Support
             </h3>
             <ul className="space-y-3">
                {['Can I apply to multiple jobs in one drive?', 'What happens after the deadline?', 'Drive status locked?'].map((q, i) => (
                  <li key={i} className="flex items-start gap-2 group cursor-pointer">
                    <ChevronRight size={12} className="mt-0.5 text-surface-tint group-hover:translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-tighter group-hover:text-on-surface transition-colors">{q}</span>
                  </li>
                ))}
             </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlacementDrives;
