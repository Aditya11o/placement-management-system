import React, { useState, useEffect } from 'react';
import { Calendar, List, CheckCircle, XCircle, Video, Download, Plus, MapPin, Building2, Loader2 } from 'lucide-react';
import Dropdown from '../../components/Dropdown';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';
import ResponsiveTable from '../../components/ResponsiveTable';
import InterviewSidebar from '../../components/interviews/InterviewSidebar';
import ReminderModal from '../../components/interviews/ReminderModal';

const InterviewSchedule: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState('All Rounds');
  const [viewDate, setViewDate] = useState(new Date());
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderData, setReminderData] = useState({ title: '', date: '', time: '', reminderBefore: '30 min' });
  const [stats, setStats] = useState([
    { label: 'Total Interviews', value: '00', icon: List, color: 'text-gray-600', border: 'border-l-gray-400' },
    { label: 'Upcoming', value: '00', icon: Calendar, color: 'text-blue-600', border: 'border-l-blue-500' },
    { label: 'Completed', value: '00', icon: CheckCircle, color: 'text-emerald-600', border: 'border-l-emerald-500' },
    { label: 'Missed', value: '00', icon: XCircle, color: 'text-rose-600', border: 'border-l-rose-500' },
  ]);

  const fetchInterviews = async () => {
    try {
      const { data: response } = await api.get('/applications/interviews');
      // Handle both paginated { data, pagination } and flat array responses
      const data = Array.isArray(response) ? response : (response.data || []);
      setInterviews(data);
      const now = new Date();
      const upcoming = data.filter((i: any) => new Date(i.interviewDate) > now).length;
      const completed = data.filter((i: any) => new Date(i.interviewDate) <= now).length;
      setStats([
        { label: 'Total Interviews', value: data.length.toString().padStart(2, '0'), icon: List, color: 'text-gray-600', border: 'border-l-gray-400' },
        { label: 'Upcoming', value: upcoming.toString().padStart(2, '0'), icon: Calendar, color: 'text-blue-600', border: 'border-l-blue-500' },
        { label: 'Completed', value: completed.toString().padStart(2, '0'), icon: CheckCircle, color: 'text-emerald-600', border: 'border-l-emerald-500' },
        { label: 'Missed', value: '00', icon: XCircle, color: 'text-rose-600', border: 'border-l-rose-500' },
      ]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInterviews(); }, []);

  const handleExportCalendar = () => {
    if (interviews.length === 0) return;
    const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');
    let ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Placement Management System//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
    interviews.forEach((inv) => {
      const s = new Date(inv.interviewDate), e = new Date(s.getTime() + 3600000);
      ics.push('BEGIN:VEVENT', `UID:${inv._id}@pms.com`, `DTSTAMP:${fmt(new Date())}`, `DTSTART:${fmt(s)}`, `DTEND:${fmt(e)}`, `SUMMARY:Interview: ${inv.job?.title} @ ${inv.job?.companyName}`, `DESCRIPTION:Interview for ${inv.job?.title} role. Mode: ${inv.interviewLink ? 'Online' : 'Offline'}`, `LOCATION:${inv.interviewLink || inv.job?.location || 'On Campus'}`, 'END:VEVENT');
    });
    ics.push('END:VCALENDAR');
    const el = document.createElement('a');
    el.href = URL.createObjectURL(new Blob([ics.join('\r\n')], { type: 'text/calendar' }));
    el.download = 'Interview_Schedule.ics';
    document.body.appendChild(el); el.click(); document.body.removeChild(el);
    showSuccess('Calendar exported successfully!', 'Export Success');
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/reminders', reminderData); showSuccess('Reminder added!', 'Success'); setShowReminderModal(false); setReminderData({ title: '', date: '', time: '', reminderBefore: '30 min' }); }
    catch { showError('Failed to add reminder', 'Error'); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3"><div className="w-8 h-px bg-blue-600" /><span>Success Roadmap</span></div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none uppercase">Interview <span className="text-blue-600">Schedule</span></h1>
          <p className="text-gray-500 text-[14px] mt-3 font-medium">Keep track of your interview pipeline and upcoming screenings.</p>
        </div>
        <div className="flex gap-3">
          <button disabled={interviews.length === 0} onClick={handleExportCalendar} title={interviews.length === 0 ? "No interviews available to export" : "Download as .ics file"} className={`px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 ${interviews.length === 0 ? 'bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}><Download size={16} strokeWidth={3} />Export Calendar</button>
          <button onClick={() => setShowReminderModal(true)} className="px-6 py-3.5 bg-[#000613] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center gap-2 active:scale-95"><Plus size={16} strokeWidth={3} />Add Reminder</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-[28px] border-l-[6px] ${stat.border} shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-gray-50 ${stat.color} group-hover:scale-110 transition-transform`}><stat.icon size={20} strokeWidth={2.5} /></div>
              <span className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</span>
            </div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Interview Table */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-black text-gray-900 tracking-tight capitalize">Upcoming & Recent</h2>
            <div className="w-32"><Dropdown label="Filter by" value={selectedRound} onChange={(val) => setSelectedRound(val)} options={['All Rounds', 'Technical', 'HR']} /></div>
          </div>
          <ResponsiveTable>
            <table className="w-full">
              <thead><tr className="border-b border-gray-50">
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Company & Role</th>
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Date & Time</th>
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Round</th>
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Mode</th>
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {interviews.map((interview, i) => {
                  const date = new Date(interview.interviewDate);
                  const isUpcoming = date > new Date();
                  return (
                    <tr key={i} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="py-6 pr-4"><div className="flex items-center gap-3"><div className="w-10 h-10 border border-gray-100 rounded-lg p-1 bg-white shadow-sm flex items-center justify-center shrink-0"><Building2 className="text-gray-400" size={20} /></div><div><h4 className="text-[13px] font-black text-gray-900 leading-tight tracking-tight uppercase">{interview.job?.companyName}</h4><h4 className="text-[13px] font-bold text-gray-500 leading-tight tracking-tight uppercase">{interview.job?.title}</h4></div></div></td>
                      <td className="py-6 pr-4"><div className="flex flex-col"><span className="text-xs font-black text-gray-900 leading-tight uppercase tracking-widest">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span><span className="text-[10px] font-bold text-gray-400 mt-0.5">{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div></td>
                      <td className="py-6 pr-4"><span className="text-[10px] font-black text-gray-600 uppercase tracking-widest bg-gray-100/50 px-2 py-1 rounded">TECHNICAL</span></td>
                      <td className="py-6 pr-4"><div className="flex flex-col"><div className="flex items-center gap-1.5 text-gray-800 mb-0.5">{interview.interviewLink ? <Video size={12} className="text-gray-400" /> : <MapPin size={12} className="text-gray-400" />}<span className="text-[11px] font-black tracking-widest uppercase">{interview.interviewLink ? 'Online' : 'Offline'}</span></div>{interview.interviewLink ? <a href={interview.interviewLink} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline decoration-2 transition-all">Join Link</a> : <span className="text-[10px] font-bold text-gray-400">{interview.job?.location || 'On Campus'}</span>}</div></td>
                      <td className="py-6 text-center"><span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full italic border ${isUpcoming ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{isUpcoming ? 'UPCOMING' : 'COMPLETED'}</span></td>
                    </tr>
                  );
                })}
                {interviews.length === 0 && <tr><td colSpan={5} className="py-20 text-center text-gray-400 italic text-sm">No interviews scheduled yet. Once interviews are scheduled, you can export them to your calendar.</td></tr>}
              </tbody>
            </table>
          </ResponsiveTable>
          <button onClick={() => window.location.href = '/student/interview-history'} className="mt-auto pt-6 border-t border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-black transition-all flex items-center justify-center gap-2 italic"><span>View All Interview History</span></button>
        </div>

        {/* Sidebar */}
        <InterviewSidebar interviews={interviews} viewDate={viewDate} onPrevMonth={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} onNextMonth={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} />
      </div>

      {/* Reminder Modal */}
      <ReminderModal isOpen={showReminderModal} data={reminderData} onChange={(u) => setReminderData(p => ({...p, ...u}))} onSubmit={handleAddReminder} onClose={() => setShowReminderModal(false)} />
    </div>
  );
};

export default InterviewSchedule;
