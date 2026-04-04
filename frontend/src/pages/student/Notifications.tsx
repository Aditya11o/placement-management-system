import React, { useState, useEffect } from 'react';
import { 
  Bell, Mail, Briefcase, FileText, Calendar, 
  Check, Trash2, MoreVertical, User
} from 'lucide-react';
import api from '../../api';
import ListSkeleton from '../../components/skeletons/ListSkeleton';

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.put(`/notifications/read/${id}`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    // Note: Backend doesn't have markAllRead yet, but can implement if needed
    // For now, sequentially or just mock it UI-wise then fetch
    try {
      await api.put(`/notifications/read-all/${notifications[0]?.user_id || ''}`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Jobs') return notif.type === 'job';
    if (activeTab === 'Applications') return notif.type === 'application';
    if (activeTab === 'Interviews') return notif.type === 'interview';
    if (activeTab === 'System') return notif.type === 'system';
    return true;
  });

  const stats = [
    { label: 'Total', value: notifications.length.toString(), icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Unread', value: notifications.filter(n => !n.is_read).length.toString(), icon: Mail, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Jobs', value: notifications.filter(n => n.type === 'job').length.toString(), icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Apps', value: notifications.filter(n => n.type === 'application').length.toString(), icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Interviews', value: notifications.filter(n => n.type === 'interview').length.toString(), icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const tabs = ['All', 'Jobs', 'Applications', 'Interviews', 'System'];

  const getIcon = (type: string) => {
    switch (type) {
      case 'job': return { icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'application': return { icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' };
      case 'interview': return { icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-50' };
      default: return { icon: User, color: 'text-emerald-600', bg: 'bg-emerald-50' };
    }
  };

  if (loading) {
    return <ListSkeleton />;
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-gray-500 font-bold mt-1 tracking-tight">Stay updated with your academic and career progress.</p>
        </div>
        <button 
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 px-6 py-3 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95"
        >
          <Check size={16} />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:shadow-md transition-all group">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3 mt-8">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all
              ${activeTab === tab 
                ? 'bg-[#000613] text-white shadow-lg shadow-black/10' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4 mt-8">
        {filteredNotifications.map(notif => {
          const { icon: Icon, color, bg } = getIcon(notif.type);
          return (
            <div key={notif._id} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start gap-6 hover:shadow-md transition-all group relative overflow-hidden">
              {!notif.is_read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
              )}
              
              <div className="flex gap-4 flex-1">
                <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center shrink-0 border border-black/5 shadow-sm`}>
                  <Icon size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h4 className="text-base font-black text-gray-900 tracking-tight">{notif.title}</h4>
                    {!notif.is_read && (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700">
                        Unread
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-[13px] font-bold leading-relaxed pr-8">{notif.message}</p>
                  
                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 mt-5">
                    {!notif.is_read && (
                      <button 
                        onClick={() => handleMarkRead(notif._id)}
                        className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                      >
                        Mark as Read
                      </button>
                    )}
                    {notif.link && (
                      <a 
                        href={notif.link}
                        className="px-5 py-2 bg-[#000613] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
                      >
                        View Details
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => handleDelete(notif._id)}
                    className="text-gray-300 hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <button className="text-gray-300 hover:text-gray-900 transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          );
        })}
        {filteredNotifications.length === 0 && (
          <p className="text-center py-20 text-gray-400 font-bold italic">No notifications found in this category.</p>
        )}
      </div>

      {/* Pagination / Load More */}
      {filteredNotifications.length > 10 && (
        <div className="flex justify-center mt-12 pb-12">
          <button className="px-8 py-3 bg-white border border-gray-200 text-gray-500 rounded-xl text-[11px] font-black uppercase tracking-widest hover:border-gray-400 hover:text-gray-900 transition-all shadow-sm">
            Load More Notifications
          </button>
        </div>
      )}

    </div>
  );
};

export default Notifications;
