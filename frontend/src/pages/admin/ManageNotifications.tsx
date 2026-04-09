import React, { useState, useEffect } from 'react';
import { 
  Send, Trash2, 
  Layers, 
  Loader2,
  Edit3,
  XCircle,
  Users,
  Clock,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import api from '../../api';
import Dropdown from '../../components/Dropdown';
import { useAutosave } from '../../hooks/useAutosave';
import { useNotification } from '../../context/NotificationContext';

const ManageNotifications: React.FC = () => {
  const { showSuccess, showError, showWarning } = useNotification();
  const [activeTab, setActiveTab] = useState('Send Notification');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [sentNotifications, setSentNotifications] = useState<any[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    sendTo: 'All Students',
    type: 'General',
    message: '',
    scheduledAt: '',
  });
  const [isScheduled, setIsScheduled] = useState(false);

  const { clearAutosave } = useAutosave('admin-notifications', formData, (saved) => {
    setFormData(saved);
  });

  const fetchSentNotifications = async () => {
    try {
      const { data } = await api.get('/notifications/admin');
      const mapped = data.map((n: any) => ({
        id: n._id,
        title: n.title,
        message: n.message,
        recipientCount: n.recipientCount || 0,
        type: n.type?.toUpperCase() || 'GENERAL',
        isSent: n.isSent,
        targetRole: n.targetRole,
        scheduledAt: n.scheduledAt,
        dateTime: new Date(n.createdAt).toLocaleString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }),
        scheduledTime: n.scheduledAt ? new Date(n.scheduledAt).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }) : null
      }));
      setSentNotifications(mapped);
    } catch (err: any) {
      console.error(err);
      showError('Failed to fetch broadcast history', 'Fetch Error');
    }
  };

  useEffect(() => {
    fetchSentNotifications();
  }, []);

  const handleSend = async () => {
    if (!formData.title || !formData.message) {
      showWarning('Please provide both a title and a message content.', 'Required Fields');
      return;
    }

    if (isScheduled && !formData.scheduledAt) {
      showWarning('Please specify a date and time for scheduling.', 'Missing Schedule');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        scheduledAt: isScheduled ? formData.scheduledAt : null
      };

      if (editId) {
        await api.put(`/notifications/broadcast/${editId}`, payload);
        showSuccess('Broadcast notification updated successfully!', 'Update Success');
        setEditId(null);
      } else {
        await api.post('/notifications/broadcast', payload);
        showSuccess(
            isScheduled 
                ? `Broadcast scheduled for ${new Date(formData.scheduledAt).toLocaleString()}`
                : 'Broadcast notification sent successfully!', 
            'Success'
        );
      }
      
      clearAutosave();
      setFormData({
        title: '',
        sendTo: 'All Students',
        type: 'General',
        message: '',
        scheduledAt: '',
      });
      setIsScheduled(false);
      fetchSentNotifications();
      setActiveTab('Sent Notifications');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Error processing notification', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this broadcast? It will be removed from all recipients.')) return;

    try {
      await api.delete(`/notifications/broadcast/${id}`);
      showSuccess('Broadcast deleted successfully', 'Deleted');
      fetchSentNotifications();
    } catch (err: any) {
      showError('Failed to delete broadcast', 'Delete Error');
    }
  };

  const startEdit = (notif: any) => {
    setEditId(notif.id);
    setFormData({
      title: notif.title,
      message: notif.message,
      type: notif.type.charAt(0) + notif.type.slice(1).toLowerCase(),
      sendTo: notif.targetRole === 'student' ? 'All Students' : (notif.targetRole === 'recruiter' ? 'All Recruiters' : 'Everyone'),
      scheduledAt: notif.scheduledAt ? new Date(notif.scheduledAt).toISOString().slice(0, 16) : ''
    });
    setIsScheduled(!!notif.scheduledAt && !notif.isSent);
    setActiveTab('Send Notification');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="pt-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Notifications Management</h1>
        <p className="text-base text-gray-500 font-bold mt-2 leading-relaxed max-w-3xl">
          Broadcast critical updates, placement alerts, and interview schedules. Now with advanced scheduling support.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-100 pb-px">
        {['Send Notification', 'Sent Notifications'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-black transition-all relative ${
              activeTab === tab ? 'text-[#000613]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#000613] rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'Send Notification' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Compose Broadcast Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#000613] group-hover:scale-110 transition-transform">
                  <Layers size={22} />
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                  {editId ? 'Edit Broadcast' : 'Compose New Broadcast'}
                </h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notification Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Google Interview Shortlist Released" 
                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all placeholder:text-gray-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {!editId && (
                    <Dropdown 
                      label="Send To"
                      value={formData.sendTo}
                      onChange={(val) => setFormData({...formData, sendTo: val})}
                      options={['All Students', 'All Recruiters', 'Everyone']}
                    />
                  )}
                  <Dropdown 
                    label="Notification Type"
                    value={formData.type}
                    onChange={(val) => setFormData({...formData, type: val})}
                    options={['General', 'Placement', 'Interview', 'Alert']}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message Content</label>
                  <textarea 
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Detailed message for the recipients..." 
                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all placeholder:text-gray-300 resize-none"
                  ></textarea>
                </div>

                {/* Scheduling Logic */}
                <div className="pt-4 border-t border-gray-50">
                    <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 mb-4 cursor-pointer hover:bg-gray-50 transition-colors"
                         onClick={() => setIsScheduled(!isScheduled)}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isScheduled ? 'bg-[#000613] text-white' : 'bg-white text-gray-400'}`}>
                                <Clock size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-gray-900 leading-none">Schedule for later</h4>
                                <p className="text-[11px] font-bold text-gray-400 mt-1">Set a future date and time for delivery.</p>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isScheduled ? 'bg-green-500' : 'bg-gray-200'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isScheduled ? 'left-7' : 'left-1'}`}></div>
                        </div>
                    </div>

                    {isScheduled && (
                        <div className="animate-slide-down space-y-2 ml-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Date & Time</label>
                            <input 
                                type="datetime-local" 
                                value={formData.scheduledAt}
                                onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
                                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#000613] outline-none transition-all"
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  {editId && (
                    <button 
                      onClick={() => {
                        setEditId(null);
                        setFormData({ title: '', message: '', sendTo: 'All Students', type: 'General', scheduledAt: '' });
                        setIsScheduled(false);
                      }}
                      className="flex items-center gap-2 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all active:scale-95"
                    >
                      <XCircle size={18} />
                      Cancel Edit
                    </button>
                  )}
                  <button 
                    onClick={handleSend}
                    disabled={loading}
                    className="flex items-center gap-3 px-8 py-4 bg-[#000613] text-white rounded-2xl font-black text-sm shadow-xl shadow-black/20 hover:scale-105 transition-all active:scale-95 group disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    )}
                    {editId ? 'Update Broadcast' : (isScheduled ? 'Schedule Announcement' : 'Send Notification')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#000613] rounded-[2.5rem] p-8 shadow-xl shadow-black/20 relative overflow-hidden h-[300px] flex flex-col justify-center border border-white/5">
              <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] absolute top-8 left-8">Live Preview</h4>
              <div className="bg-white rounded-2xl p-5 shadow-2xl relative z-10 animate-fade-in mx-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#000613] border border-gray-100 font-bold shadow-sm">
                      <span className="text-sm">U</span>
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900">University Portal</p>
                      <p className="text-[9px] font-black text-gray-400">
                          {isScheduled && formData.scheduledAt 
                            ? `Scheduled for ${new Date(formData.scheduledAt).toLocaleDateString()}` 
                            : 'Just now'}
                      </p>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${isScheduled ? 'bg-amber-500' : 'bg-blue-500 animate-pulse'}`}></div>
                </div>
                <h5 className="text-[13px] font-black text-gray-900 leading-tight mb-2 truncate">{formData.title || 'Notification Title'}</h5>
                <p className="text-[11px] font-bold text-gray-500 leading-relaxed line-clamp-2">
                  {formData.message || 'Detailed message content will appear here...'}
                </p>
              </div>
              {isScheduled && formData.scheduledAt && (
                  <div className="mt-6 px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-center animate-fade-in">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest flex items-center justify-center gap-2">
                          <Clock size={12} className="text-amber-400" />
                          Delivery in {Math.max(0, Math.ceil((new Date(formData.scheduledAt).getTime() - new Date().getTime()) / (1000 * 60 * 60)))} hours
                      </p>
                  </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/30">
                  <th className="pl-8 pr-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Title & Message</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Type</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Recipients</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Timing</th>
                  <th className="pr-8 pl-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sentNotifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-gray-50/40 transition-all duration-300">
                    <td className="pl-8 pr-6 py-6">
                      <div className="max-w-md">
                        <p className="text-sm font-black text-gray-900">{notif.title}</p>
                        <p className="text-xs font-bold text-gray-400 mt-1 italic line-clamp-1">{notif.message}</p>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em]">{notif.type}</p>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-gray-500 font-black">
                        <Users size={12} />
                        <span className="text-[11px] uppercase tracking-widest">
                            {notif.targetRole === 'all' ? 'Everyone' : (notif.targetRole === 'student' ? 'Students' : (notif.targetRole === 'recruiter' ? 'Recruiters' : notif.recipientCount))}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                        <div className="flex items-center justify-center">
                            {notif.isSent ? (
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">
                                    <CheckCircle2 size={12} />
                                    <span className="text-[10px] font-black uppercase tracking-wider">Sent</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
                                    <Clock size={12} />
                                    <span className="text-[10px] font-black uppercase tracking-wider">Scheduled</span>
                                </div>
                            )}
                        </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                            {notif.isSent ? 'Sent on' : 'Scheduled for'}
                        </p>
                        <p className="text-[11px] font-black text-gray-900 mt-1">
                            {notif.isSent ? notif.dateTime : notif.scheduledTime}
                        </p>
                      </div>
                    </td>
                    <td className="pr-8 pl-6 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {(!notif.isSent) && (
                            <button 
                                onClick={() => startEdit(notif)}
                                className="p-2 text-gray-300 hover:text-blue-600 hover:scale-125 transition-all"
                            >
                                <Edit3 size={18} />
                            </button>
                        )}
                        <button 
                          onClick={() => handleDelete(notif.id)}
                          className="p-2 text-gray-300 hover:text-rose-600 hover:scale-125 transition-all relative group"
                        >
                          <Trash2 size={18} />
                          <span className="absolute -top-8 right-0 bg-rose-600 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {notif.isSent ? 'Delete Record' : 'Cancel Broadcast'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sentNotifications.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-20 text-center font-bold text-gray-400 italic">No broadcasts found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageNotifications;
