import React, { useState, useEffect } from 'react';
import { 
  Send, Trash2, 
  Layers, 
  Loader2
} from 'lucide-react';
import api from '../../api';
import { useAutosave } from '../../hooks/useAutosave';
import { useNotification } from '../../context/NotificationContext';

const ManageNotifications: React.FC = () => {
  const { showSuccess, showError, showWarning } = useNotification();
  const [activeTab, setActiveTab] = useState('Send Notification');
  const [loading, setLoading] = useState(false);
  const [sentNotifications, setSentNotifications] = useState<any[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    sendTo: 'All Students',
    type: 'General',
    message: ''
  });

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
        sentTo: n.recipientRole?.toUpperCase() || 'EXTERNAL',
        type: n.type?.toUpperCase() || 'GENERAL',
        dateTime: new Date(n.createdAt).toLocaleString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })
      }));
      setSentNotifications(mapped);
    } catch (err: any) {
      console.error(err);
      showError('Failed to fetch sent notifications history', 'Fetch Error');
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

    try {
      setLoading(true);
      await api.post('/notifications/broadcast', formData);
      showSuccess('Broadcast notification sent successfully to all recipients!', 'Broadcast Success');
      clearAutosave();
      setFormData({
        title: '',
        sendTo: 'All Students',
        type: 'General',
        message: ''
      });
      fetchSentNotifications();
      setActiveTab('Sent Notifications');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Error broadcasting notification', 'Broadcast Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="pt-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Notifications Management</h1>
        <p className="text-base text-gray-500 font-bold mt-2 leading-relaxed max-w-3xl">
          Broadcast critical updates, placement alerts, and interview schedules.
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
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Compose New Broadcast</h2>
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
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Send To</label>
                    <select 
                      value={formData.sendTo}
                      onChange={(e) => setFormData({...formData, sendTo: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-black text-sm text-gray-700 cursor-pointer appearance-none"
                    >
                      <option>All Students</option>
                      <option>All Recruiters</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notification Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-black text-sm text-gray-700 cursor-pointer appearance-none"
                    >
                      <option>General</option>
                      <option>Placement</option>
                      <option>Interview</option>
                      <option>Alert</option>
                    </select>
                  </div>
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

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={handleSend}
                    disabled={loading}
                    className="flex items-center gap-3 px-8 py-4 bg-[#000613] text-white rounded-2xl font-black text-sm shadow-xl shadow-black/20 hover:scale-105 transition-all active:scale-95 group disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                    Send Notification
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
                      <p className="text-[9px] font-black text-gray-400">Just now</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                </div>
                <h5 className="text-[13px] font-black text-gray-900 leading-tight mb-2 truncate">{formData.title || 'Notification Title'}</h5>
                <p className="text-[11px] font-bold text-gray-500 leading-relaxed line-clamp-2">
                  {formData.message || 'Detailed message content will appear here...'}
                </p>
              </div>
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
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sent To</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Type</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</th>
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
                    <td className="px-6 py-6">
                      <span className="px-3 py-1.5 bg-gray-50 rounded-lg text-[9px] font-black text-gray-600 border border-gray-100 uppercase tracking-widest shadow-sm">
                        {notif.sentTo}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em]">{notif.type}</p>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{notif.dateTime}</p>
                    </td>
                    <td className="pr-8 pl-6 py-6 text-right">
                      <button className="p-2 text-gray-300 hover:text-rose-600 hover:scale-125 transition-all"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
                {sentNotifications.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center font-bold text-gray-400 italic">No notifications sent yet</td>
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
