import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserPlus, XCircle, Calendar, Briefcase, 
  Filter, Check, Clock, Trash2, Mail,
  ChevronRight, CheckCircle2, Bell, MoreVertical
} from 'lucide-react';
import api from '../../api';
import ListSkeleton from '../../components/skeletons/ListSkeleton';
import { groupNotificationsByDate, TimeGroup, Notification } from '../../utils/notificationUtils';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All Notifications');
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
      if (activeTab === 'All Notifications') return true;
      if (activeTab === 'Unread') return !notif.is_read;
      if (activeTab === 'Read') return notif.is_read;
      return true;
    });
  }, [notifications, activeTab]);

  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDate(filteredNotifications);
  }, [filteredNotifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'job': return { icon: Briefcase, color: 'text-gray-900', bg: 'bg-gray-100' };
      case 'application': return { icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'interview': return { icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' };
      case 'selected': return { icon: Check, color: 'text-emerald-600', bg: 'bg-emerald-50' };
      case 'rejected': return { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' };
      default: return { icon: Mail, color: 'text-gray-500', bg: 'bg-gray-100' };
    }
  };

  if (loading) {
    return <ListSkeleton />;
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Recruitment Alerts</h1>
          <p className="text-gray-500 text-[15px] mt-1 font-medium italic">Monitor candidate progress and system notifications.</p>
        </div>
        <button 
          onClick={handleMarkAllRead}
          className="px-8 py-4 bg-[#000613] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center gap-3 active:scale-95 group"
        >
          <CheckCircle2 size={16} strokeWidth={3} className="text-emerald-400 group-hover:scale-125 transition-transform" />
          Mark All as Read
        </button>
      </div>

      {/* Tabs + Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-100 pb-2 gap-4">
        <div className="flex gap-8">
          {['All Notifications', 'Unread', 'Read'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative pb-4 text-[13px] font-black tracking-tight transition-all uppercase ${
                activeTab === tab 
                  ? 'text-gray-900' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900 rounded-full" />
              )}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sort:</span>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[12px] font-black text-gray-900 hover:bg-white transition-all shadow-sm">
            Latest First
            <Filter size={14} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Grouped Notifications List */}
      <div className="space-y-12">
        {(Object.entries(groupedNotifications) as [TimeGroup, Notification[]][]).map(([groupName, groupItems]) => {
          if (groupItems.length === 0) return null;

          const unreadInGroup = groupItems.filter(n => !n.is_read).length;

          return (
            <div key={groupName} className="space-y-6">
              <div className="flex items-center justify-between border-l-4 border-gray-900 pl-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">{groupName}</h2>
                  {unreadInGroup > 0 && (
                    <span className="px-3 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[10px] font-black">
                      {unreadInGroup} ACTION REQUIRED
                    </span>
                  )}
                </div>
                {unreadInGroup > 0 && (
                  <button 
                    onClick={() => handleMarkGroupRead(groupItems)}
                    className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors"
                  >
                    Clear Section
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {groupItems.map((notif) => {
                    const { icon: Icon, bg, color } = getIcon(notif.type);
                    return (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        key={notif._id}
                        className={`group bg-white border rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all relative overflow-hidden flex flex-col md:flex-row gap-6 ${
                          !notif.is_read ? 'border-l-[8px] border-l-blue-600 border-blue-50 bg-blue-50/10' : 'border-gray-100'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform shadow-sm border border-black/5`}>
                          <Icon size={24} />
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between items-start">
                            <h3 className="text-[18px] font-black text-gray-900 tracking-tight leading-none">{notif.title}</h3>
                            <div className="flex items-center gap-4">
                              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest bg-white border border-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                                <Clock size={12} className="opacity-50" />
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {!notif.is_read && (
                                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-lg shadow-blue-400 animate-pulse" />
                              )}
                              <button 
                                onClick={() => handleDelete(notif._id)}
                                className="p-2 text-gray-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-gray-500 text-[14px] leading-relaxed max-w-2xl font-bold">
                            {notif.message}
                          </p>

                          <div className="flex flex-wrap gap-4 pt-3">
                            {!notif.is_read && (
                              <button 
                                onClick={() => handleMarkRead(notif._id)}
                                className="px-6 py-2.5 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-blue-100 shadow-sm"
                              >
                                Mark as Read
                              </button>
                            )}
                            {notif.link && (
                              <a 
                                href={notif.link}
                                className="px-6 py-2.5 bg-[#000613] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-black/10 flex items-center gap-2 group/link"
                              >
                                <span>Process Application</span>
                                <ChevronRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                              </a>
                            )}
                          </div>
                        </div>
                        <button className="absolute bottom-6 right-6 text-gray-200 group-hover:text-gray-900 transition-colors">
                          <MoreVertical size={20} />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-32 flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-50 rounded-[3rem] flex items-center justify-center text-gray-200 mb-6 border border-gray-100">
            <Bell size={48} />
          </div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Zero unread alerts</h3>
          <p className="text-gray-400 font-bold mt-2">You're all caught up with candidate updates.</p>
        </div>
      )}

      {/* Pagination / Load More */}
      {filteredNotifications.length >= 10 && (
        <div className="pt-12 flex justify-center border-t border-gray-100">
          <button className="px-12 py-4 border-2 border-gray-100 rounded-[28px] text-[12px] font-black text-gray-400 uppercase tracking-widest hover:border-gray-900 hover:text-gray-900 transition-all active:scale-95 bg-white shadow-sm">
            Load Older Notifications
          </button>
        </div>
      )}

    </div>
  );
};

export default Notifications;

