import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Video, 
  ChevronRight, Star, 
  Layout, BookOpen, 
  Trophy, MessageSquare, 
  PlayCircle, MoreVertical,
  ArrowUpRight, X, AlertCircle,
  Loader2, CheckCircle2
} from 'lucide-react';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

const MockInterviews: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0, avgPerformance: 0 });
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({ communication: 0, technical: 0, confidence: 0 });
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    type: 'Technical',
    date: '',
    slot: '09:00 AM',
    mode: 'Online'
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, upcomingRes, historyRes, analyticsRes] = await Promise.all([
        api.get('/mock-interviews/stats'),
        api.get('/mock-interviews/upcoming'),
        api.get('/mock-interviews/history'),
        api.get('/mock-interviews/analytics')
      ]);
      setStats(statsRes.data);
      setUpcoming(upcomingRes.data);
      setHistory(historyRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err: any) {
      console.error(err);
      // showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.date) return showError('Please select a date');
    
    try {
      setBookingLoading(true);
      await api.post('/mock-interviews/book', bookingForm);
      showSuccess('Mock interview booked successfully!', 'Booking Confirmed');
      fetchDashboardData();
      setBookingForm({ ...bookingForm, date: '' });
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to book interview');
    } finally {
      setBookingLoading(false);
    }
  };

  const performanceMetrics = [
    { label: 'COMMUNICATION', value: analytics.communication, color: 'bg-blue-400' },
    { label: 'TECHNICAL KNOWLEDGE', value: analytics.technical, color: 'bg-indigo-400' },
    { label: 'CONFIDENCE', value: analytics.confidence, color: 'bg-emerald-400' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin h-10 w-10 text-blue-900" />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic">Mock Interviews</h1>
        <p className="text-sm font-bold text-gray-400 mt-1 leading-relaxed max-w-2xl italic">
          Refine your skills with professional mentors. Practice makes perfect in the journey to your dream career.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Interviews', value: stats.total.toString(), icon: Layout, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Upcoming', value: stats.upcoming.toString(), icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Completed', value: stats.completed.toString(), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg. Performance', value: `${stats.avgPerformance}%`, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50', sub: '+4% vs last week' }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-4">
               {/* <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={20} />
               </div> */}
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
            </div>
            <div className="flex items-end gap-3">
               <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</h3>
               {stat.sub && <span className="text-[10px] font-bold text-emerald-500 mb-1.5">{stat.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Booking Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="text-blue-600" size={24} />
              <h2 className="text-xl font-black text-gray-900 leading-none uppercase italic">Book Mock Interview</h2>
            </div>

            <form onSubmit={handleBooking} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block italic">Interview Type</label>
                <select 
                  value={bookingForm.type}
                  onChange={(e) => setBookingForm({ ...bookingForm, type: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none italic"
                >
                  <option>Technical Interview</option>
                  <option>HR Interview</option>
                  <option>Aptitude Prep</option>
                  <option>System Design</option>
                  <option>Group Discussion</option>
                  <option>Resume Clinic</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block italic">Date</label>
                  <input 
                    type="date"
                    value={bookingForm.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all italic"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block italic">Time Slot</label>
                  <select 
                    value={bookingForm.slot}
                    onChange={(e) => setBookingForm({ ...bookingForm, slot: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none italic"
                  >
                    <option>09:00 AM</option>
                    <option>11:30 AM</option>
                    <option>02:00 PM</option>
                    <option>04:30 PM</option>
                    <option>07:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block italic">Mode</label>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-3">
                  <Video size={18} className="text-gray-400" />
                  <span className="text-sm font-bold text-gray-700 italic">Online Only (Standard Protocol)</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={bookingLoading}
                className="w-full py-5 bg-[#000613] text-white rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-blue-900/10 flex items-center justify-center gap-2 group italic"
              >
                {bookingLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Book Mock Interview'}
                {!bookingLoading && <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
              </button>
            </form>
          </div>
          
          {/* Preparation Resources */}
          <div className="space-y-4">
             <h2 className="text-xl font-black text-gray-900 uppercase italic">Preparation Resources</h2>
             <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Technical Prep', desc: 'DSA, System Design, Projects', icon: Layout },
                  { label: 'HR & GD', desc: 'Soft skills & Case studies', icon: MessageSquare },
                  { label: 'Aptitude', desc: 'Quant, Logical, Verbal', icon: Trophy },
                  { label: 'Resume Clinic', desc: 'ATS optimization tips', icon: BookOpen }
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 hover:shadow-md transition-all group flex flex-col justify-between">
                     <div>
                        <item.icon size={20} className="text-blue-900 mb-4" />
                        <h4 className="text-sm font-black text-gray-900 uppercase italic leading-tight mb-1">{item.label}</h4>
                        <p className="text-[10px] font-bold text-gray-400 italic leading-snug">{item.desc}</p>
                     </div>
                     <button className="mt-4 flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-black transition-colors">
                        View Content <ChevronRight size={12} />
                     </button>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right: Upcoming & Analytics */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Upcoming Section */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
               <div className="flex items-center gap-3">
                  <Clock className="text-indigo-600" size={24} />
                  <h2 className="text-xl font-black text-gray-900 uppercase italic">Upcoming Interviews</h2>
               </div>
               <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded-lg tracking-wider border border-indigo-100">
                 {upcoming.length} Scheduled
               </span>
            </div>

            <div className="space-y-4">
              {upcoming.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-lg transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center group-hover:bg-blue-900 transition-colors">
                      <Video size={20} className="text-blue-900 group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-black text-gray-900 leading-tight uppercase italic">{item.type} Mock</h4>
                      <div className="flex flex-wrap gap-4 mt-2">
                         <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 italic"><Calendar size={14} /> {new Date(item.scheduledAt).toLocaleDateString()} • {item.slot}</span>
                         <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 italic"><Star size={14} /> Mentor: {item.mentor?.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-6 py-2.5 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md italic">Join Meeting</button>
                    <button className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-400"><MoreVertical size={18} /></button>
                  </div>
                </div>
              ))}
              {upcoming.length === 0 && (
                <div className="py-10 text-center text-gray-400 font-bold italic border-2 border-dashed border-gray-100 rounded-3xl">
                   No interviews scheduled. Start your prep now!
                </div>
              )}
            </div>
          </div>

          {/* Performance Analytics & Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-[#000613] rounded-3xl p-8 text-white relative h-full">
                <h2 className="text-xl font-black uppercase italic mb-8">Performance Analytics</h2>
                <div className="space-y-8">
                   {performanceMetrics.map((m, i) => (
                     <div key={i}>
                        <div className="flex justify-between items-end mb-2.5">
                           <span className="text-[10px] font-black uppercase tracking-[0.2em]">{m.label}</span>
                           <span className="text-sm font-black italic">{m.value}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                           <div 
                             className={`h-full ${m.color} rounded-full transition-all duration-1000`}
                             style={{ width: `${m.value}%` }}
                           ></div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             
             <div className="bg-white rounded-3xl p-8 border border-gray-100 h-full flex flex-col">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 block italic">Mentor Feedback Summary</h3>
                <div className="flex-1 space-y-4">
                   <p className="text-sm font-bold text-gray-600 leading-relaxed italic border-l-4 border-blue-900 pl-4 py-1">
                      {history[0]?.feedback || "Alex shows strong fundamentals in backend systems. Needs slight improvement in handling ambiguous design questions. Soft skills are excellent, especially professional articulation."}
                   </p>
                </div>
                <div className="mt-8 flex items-center gap-3">
                   <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-black text-xs">
                      {history[0]?.mentor?.name?.[0] || "S"}
                   </div>
                   <div>
                      <h4 className="text-sm font-black text-gray-900 leading-none uppercase italic">{history[0]?.mentor?.name || "Dr. Sarah Jenkins"}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 italic">Senior Technical Mentor</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Past Performance History */}
          <div className="space-y-6">
             <h2 className="text-xl font-black text-gray-900 uppercase italic">Past Performance History</h2>
             <div className="space-y-4">
                {history.map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:scale-[1.01] transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                           <CheckCircle2 size={20} />
                        </div>
                        <div>
                           <h4 className="text-sm font-black text-gray-900 leading-none uppercase italic">{item.type} Round</h4>
                           <p className="text-[10px] font-bold text-gray-400 mt-1 italic uppercase tracking-wider">Completed {new Date(item.scheduledAt).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-8">
                        <div className="text-right">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic leading-none mb-1">Score</p>
                           <span className="text-lg font-black text-gray-900 italic">{item.performance.overallScore || 85}%</span>
                        </div>
                        <button className="px-5 py-2 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all italic">View Feedback</button>
                     </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="py-8 text-center text-gray-400 font-bold italic">No past sessions found.</div>
                )}
                {history.length > 3 && (
                  <button className="w-full py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors italic">Load More History</button>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MockInterviews;
