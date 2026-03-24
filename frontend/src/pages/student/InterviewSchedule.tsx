import React, { useState, useEffect } from 'react';
import { 
  Calendar, List, CheckCircle, XCircle, 
  Clock, Video, ChevronLeft, 
  ChevronRight, Download, Plus, Trophy, 
  HelpCircle, MapPin, 
  Building2, Loader2, X
} from 'lucide-react';
import Dropdown from '../../components/Dropdown';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

const InterviewSchedule: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState('All Rounds');
  const [viewDate, setViewDate] = useState(new Date());
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderData, setReminderData] = useState({
    title: '',
    date: '',
    time: '',
    reminderBefore: '30 min'
  });

  const [stats, setStats] = useState([
    { label: 'Total Interviews', value: '00', icon: List, color: 'text-gray-600', border: 'border-l-gray-400' },
    { label: 'Upcoming', value: '00', icon: Calendar, color: 'text-blue-600', border: 'border-l-blue-500' },
    { label: 'Completed', value: '00', icon: CheckCircle, color: 'text-emerald-600', border: 'border-l-emerald-500' },
    { label: 'Missed', value: '00', icon: XCircle, color: 'text-rose-600', border: 'border-l-rose-500' },
  ]);

  const fetchInterviews = async () => {
    try {
      const { data } = await api.get('/applications/interviews');
      setInterviews(data);
      
      const now = new Date();
      const upcoming = data.filter((i: any) => new Date(i.interviewDate) > now).length;
      const completed = data.filter((i: any) => new Date(i.interviewDate) <= now).length;
      const total = data.length;

      setStats([
        { label: 'Total Interviews', value: total.toString().padStart(2, '0'), icon: List, color: 'text-gray-600', border: 'border-l-gray-400' },
        { label: 'Upcoming', value: upcoming.toString().padStart(2, '0'), icon: Calendar, color: 'text-blue-600', border: 'border-l-blue-500' },
        { label: 'Completed', value: completed.toString().padStart(2, '0'), icon: CheckCircle, color: 'text-emerald-600', border: 'border-l-emerald-500' },
        { label: 'Missed', value: '00', icon: XCircle, color: 'text-rose-600', border: 'border-l-rose-500' },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleExportCalendar = () => {
    if (interviews.length === 0) return;

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Placement Management System//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    interviews.forEach((interview) => {
      const start = new Date(interview.interviewDate);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration
      
      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:${interview._id}@pms.com`);
      icsContent.push(`DTSTAMP:${formatDate(new Date())}`);
      icsContent.push(`DTSTART:${formatDate(start)}`);
      icsContent.push(`DTEND:${formatDate(end)}`);
      icsContent.push(`SUMMARY:Interview: ${interview.job?.title} @ ${interview.job?.companyName}`);
      icsContent.push(`DESCRIPTION:Interview for ${interview.job?.title} role. Mode: ${interview.interviewLink ? 'Online' : 'Offline'}`);
      icsContent.push(`LOCATION:${interview.interviewLink || interview.job?.location || 'On Campus'}`);
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const element = document.createElement('a');
    const file = new Blob([icsContent.join('\r\n')], { type: 'text/calendar' });
    element.href = URL.createObjectURL(file);
    element.download = 'Interview_Schedule.ics';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showSuccess('Calendar exported successfully!', 'Export Success');
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/reminders', reminderData);
      showSuccess('Reminder added successfully!', 'Success');
      setShowReminderModal(false);
      setReminderData({ title: '', date: '', time: '', reminderBefore: '30 min' });
    } catch (err) {
      showError('Failed to add reminder', 'Error');
    }
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">
            <div className="w-8 h-px bg-blue-600" />
            <span>Success Roadmap</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none uppercase">Interview <span className="text-blue-600">Schedule</span></h1>
          <p className="text-gray-500 text-[14px] mt-3 font-medium">Keep track of your interview pipeline and upcoming screenings.</p>
        </div>
        <div className="flex gap-3">
          <button 
            disabled={interviews.length === 0}
            onClick={handleExportCalendar}
            title={interviews.length === 0 ? "No interviews available to export" : "Download as .ics file"}
            className={`px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 ${
              interviews.length === 0 
              ? 'bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed' 
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            <Download size={16} strokeWidth={3} />
            Export Calendar
          </button>
          <button 
            onClick={() => setShowReminderModal(true)}
            className="px-6 py-3.5 bg-[#000613] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center gap-2 active:scale-95"
          >
            <Plus size={16} strokeWidth={3} />
            Add Reminder
          </button>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-[28px] border-l-[6px] ${stat.border} shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-gray-50 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} strokeWidth={2.5} />
              </div>
              <span className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</span>
            </div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Side - Interview Table */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-black text-gray-900 tracking-tight capitalize">Upcoming & Recent</h2>
            <div className="w-32">
              <Dropdown 
                label="Filter by"
                value={selectedRound}
                onChange={(val) => setSelectedRound(val)}
                options={['All Rounds', 'Technical', 'HR']}
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Company & Role</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Date & Time</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Round</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Mode</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {interviews.map((interview, i) => {
                  const date = new Date(interview.interviewDate);
                  const isUpcoming = date > new Date();
                  
                  return (
                    <tr key={i} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="py-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 border border-gray-100 rounded-lg p-1 bg-white shadow-sm flex items-center justify-center shrink-0">
                            <Building2 className="text-gray-400" size={20} />
                          </div>
                          <div>
                            <h4 className="text-[13px] font-black text-gray-900 leading-tight tracking-tight uppercase">{interview.job?.companyName}</h4>
                            <h4 className="text-[13px] font-bold text-gray-500 leading-tight tracking-tight uppercase">{interview.job?.title}</h4>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 pr-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-gray-900 leading-tight uppercase tracking-widest">
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 mt-0.5">
                            {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="py-6 pr-4">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest bg-gray-100/50 px-2 py-1 rounded">
                          TECHNICAL
                        </span>
                      </td>
                      <td className="py-6 pr-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 text-gray-800 mb-0.5">
                            {interview.interviewLink ? <Video size={12} className="text-gray-400" /> : <MapPin size={12} className="text-gray-400" />}
                            <span className="text-[11px] font-black tracking-widest uppercase">{interview.interviewLink ? 'Online' : 'Offline'}</span>
                          </div>
                          {interview.interviewLink ? (
                            <a href={interview.interviewLink} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline decoration-2 transition-all">Join Link</a>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400">{interview.job?.location || 'On Campus'}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-6 text-center">
                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full italic border
                          ${isUpcoming ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                          {isUpcoming ? 'UPCOMING' : 'COMPLETED'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {interviews.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-gray-400 italic text-sm">
                      No interviews scheduled yet. Once interviews are scheduled, you can export them to your calendar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <button 
            onClick={() => window.location.href = '/student/interview-history'}
            className="mt-auto pt-6 border-t border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-black transition-all flex items-center justify-center gap-2 italic"
          >
            <span>View All Interview History</span>
          </button>
        </div>

        {/* Right Side - Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Calendar Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-gray-900 tracking-tight">
                {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-y-4 text-center mb-2">
              {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(day => (
                <span key={day} className="text-[10px] font-black text-gray-400 tracking-widest">{day}</span>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-y-2 text-center">
              {(() => {
                const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
                const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
                // Shift firstDay for MO start (JS Sunday is 0)
                const startOffset = firstDay === 0 ? 6 : firstDay - 1;
                
                const calendarGrid = [];
                // empty slots
                for (let i = 0; i < startOffset; i++) {
                  calendarGrid.push(<div key={`empty-${i}`} className="py-1.5" />);
                }
                
                // day slots
                for (let day = 1; day <= daysInMonth; day++) {
                  const today = new Date();
                  const isToday = day === today.getDate() && viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();
                  
                  const dateStr = `${viewDate.getFullYear()}-${(viewDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                  const hasInterview = interviews.some(inv => inv.interviewDate && inv.interviewDate.includes(dateStr));
                  
                  calendarGrid.push(
                    <div key={day} className="relative py-1.5 flex flex-col items-center">
                      <span className={`text-xs font-bold leading-none ${isToday ? 'w-8 h-8 flex items-center justify-center bg-gray-900 text-white rounded-lg shadow-lg' : 'text-gray-600'}`}>
                        {day}
                      </span>
                      {hasInterview && !isToday && (
                        <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                      )}
                    </div>
                  );
                }
                return calendarGrid;
              })()}
            </div>
          </div>

          {/* Today's Focus Card */}
          {interviews.filter(inv => new Date(inv.interviewDate) > new Date()).length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5">Next Interview</h3>
              <div className="border-l-[3px] border-gray-900 pl-4 py-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 block italic">Upcoming</span>
                <h4 className="text-sm font-black text-gray-900 leading-tight tracking-tight uppercase">
                  {interviews.find(inv => new Date(inv.interviewDate) > new Date())?.job?.title} @ {interviews.find(inv => new Date(inv.interviewDate) > new Date())?.job?.companyName}
                </h4>
                <div className="flex items-center gap-2 mt-3 text-gray-400">
                  <Clock size={12} />
                  <span className="text-[10px] font-bold italic">
                    {new Date(interviews.find(inv => new Date(inv.interviewDate) > new Date())?.interviewDate).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Interview Prep Card */}
          <div className="bg-gradient-to-br from-blue-950 to-blue-800 rounded-3xl p-6 relative overflow-hidden group shadow-xl shadow-blue-950/20">
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 border border-white/5 transition-transform group-hover:scale-110 drop-shadow-2xl">
                <HelpCircle className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-black text-white tracking-tight uppercase leading-tight">Interview Prep?</h3>
              <p className="text-blue-100/50 text-[11px] font-bold mt-2 leading-relaxed italic pr-4">
                Access our curated library of technical interview questions and mock tests.
              </p>
              <button 
                onClick={() => window.location.href = '/student/mock-interviews'}
                className="w-full mt-6 py-2.5 bg-white text-blue-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 shadow-lg shadow-black/10"
              >
                Go to Resources
              </button>
            </div>
            <Trophy className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 rotate-12 transition-transform group-hover:rotate-0" />
          </div>

        </div>

      </div>

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-[#000613]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-[500px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-10 pt-10 pb-6 flex justify-between items-center text-gray-900 border-b border-gray-100 mb-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight uppercase">Add Reminder</h2>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Set a custom alert for your upcoming screening.</p>
              </div>
              <button 
                onClick={() => setShowReminderModal(false)}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddReminder} className="px-10 pb-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Interview Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Google Technical Round"
                  className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
                  value={reminderData.title}
                  onChange={(e) => setReminderData({...reminderData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
                    value={reminderData.date}
                    onChange={(e) => setReminderData({...reminderData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</label>
                  <input 
                    type="time" 
                    required
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
                    value={reminderData.time}
                    onChange={(e) => setReminderData({...reminderData, time: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reminder Before</label>
                <div className="grid grid-cols-4 gap-2">
                  {['15 min', '30 min', '1 hour', '1 day'].map((opt) => (
                    <button 
                      key={opt}
                      type="button"
                      onClick={() => setReminderData({...reminderData, reminderBefore: opt})}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        reminderData.reminderBefore === opt 
                          ? 'bg-[#000613] text-white shadow-lg' 
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-[#000613] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/20 active:scale-95 mt-4"
              >
                Save Reminder
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default InterviewSchedule;
