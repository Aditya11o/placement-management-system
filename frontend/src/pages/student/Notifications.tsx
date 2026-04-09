import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, Mail, Briefcase, FileText, Calendar, 
  Check, Trash2, MoreVertical, User, Clock,
  ChevronRight, CheckCircle2
} from 'lucide-react';
import api from '../../api';
import ListSkeleton from '../../components/skeletons/ListSkeleton';
import { groupNotificationsByDate, TimeGroup, Notification } from '../../utils/notificationUtils';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [_pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
      setPagination(data.pagination);
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
    try {
      if (notifications.length === 0) return;
      await api.put(`/notifications/read-all/${notifications[0]?.userId || 'all'}`);
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkGroupRead = async (groupNotifications: Notification[]) => {
    try {
      const unread = groupNotifications.filter(n => !n.is_read);
      if (unread.length === 0) return;
      
      await Promise.all(unread.map(n => api.put(`/notifications/read/${n._id}`)));
      const ids = unread.map(n => n._id);
      setNotifications(notifications.map(n => ids.includes(n._id) ? { ...n, is_read: true } : n));
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

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => {
      if (activeTab === 'All') return true;
      if (activeTab === 'Jobs') return notif.type === 'job';
      if (activeTab === 'Applications') return notif.type === 'application';
      if (activeTab === 'Interviews') return notif.type === 'interview';
      if (activeTab === 'System') return notif.type === 'system';
      return true;
    });
  }, [notifications, activeTab]);

  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDate(filteredNotifications);
  }, [filteredNotifications]);

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
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Notification Center</h1>
          <p className="text-gray-500 font-bold mt-1 tracking-tight">Stay updated with real-time academic and career alerts.</p>
        </div>
        <button 
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 px-6 py-3 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95 group"
        >
          <CheckCircle2 size={16} className="group-hover:text-emerald-400 transition-colors" />
          <span>Clear all unread</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6 hover:shadow-md transition-all group">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm`}>
              <stat.icon size={22} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
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
            className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all
              ${activeTab === tab 
                ? 'bg-[#000613] text-white shadow-xl shadow-black/20 scale-105' 
                : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grouped Notifications List */}
      <div className="space-y-12 mt-12">
        {(Object.entries(groupedNotifications) as [TimeGroup, Notification[]][]).map(([groupName, groupItems]) => {
          if (groupItems.length === 0) return null;
          
          const unreadInGroup = groupItems.filter(n => !n.is_read).length;

          return (
            <div key={groupName} className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">{groupName}</h2>
                  {unreadInGroup > 0 && (
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                      {unreadInGroup} New
                    </span>
                  )}
                </div>
                {unreadInGroup > 0 && (
                  <button 
                    onClick={() => handleMarkGroupRead(groupItems)}
                    className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                  >
                    Mark {groupName} as read
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {groupItems.map(notif => {
                    const { icon: Icon, color, bg } = getIcon(notif.type);
                    return (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={notif._id} 
                        className={`bg-white border rounded-[2rem] p-6 flex flex-col md:flex-row justify-between items-start gap-6 hover:shadow-xl hover:shadow-gray-100 transition-all group relative overflow-hidden ${
                          !notif.is_read ? 'border-blue-100 ring-4 ring-blue-50/50' : 'border-gray-100'
                        }`}
                      >
                        {!notif.is_read && (
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600" />
                        )}
                        
                        <div className="flex gap-6 flex-1">
                          <div className={`w-14 h-14 ${bg} ${color} rounded-[1.25rem] flex items-center justify-center shrink-0 border border-black/5 shadow-sm group-hover:scale-110 transition-transform`}>
                            <Icon size={24} />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h4 className="text-lg font-black text-gray-900 tracking-tight">{notif.title}</h4>
                              {!notif.is_read && (
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-600 text-white shadow-lg shadow-blue-200">
                                  <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                                  Unread
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 text-sm font-bold leading-relaxed pr-8">{notif.message}</p>
                            
                            {/* Actions */}
                            <div className="flex flex-wrap gap-4 mt-6">
                              {!notif.is_read && (
                                <button 
                                  onClick={() => handleMarkRead(notif._id)}
                                  className="px-6 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100"
                                >
                                  Mark as Read
                                </button>
                              )}
                              {notif.link && (
                                <a 
                                  href={notif.link}
                                  className="px-6 py-2.5 bg-[#000613] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2 group/btn"
                                >
                                  <span>View Details</span>
                                  <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
                              <Clock size={12} />
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button 
                              onClick={() => handleDelete(notif._id)}
                              className="text-gray-200 hover:text-rose-500 transition-all p-2 hover:bg-rose-50 rounded-xl"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <button className="text-gray-300 hover:text-gray-900 transition-colors opacity-0 group-hover:opacity-100 p-2">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          );
        })}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-32 flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-300 mb-6">
              <Bell size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Everything is up to date</h3>
            <p className="text-gray-400 font-bold mt-2">No notifications found in this category.</p>
          </div>
        )}
      </div>

      {/* Pagination / Load More */}
      {filteredNotifications.length >= 10 && (
        <div className="flex justify-center mt-16 pt-8 border-t border-gray-100">
          <button className="px-10 py-4 bg-white border border-gray-200 text-gray-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-gray-900 hover:text-gray-900 transition-all shadow-sm active:scale-95">
            Load More Notifications
          </button>
        </div>
      )}

    </div>
  );
};

export default Notifications;
