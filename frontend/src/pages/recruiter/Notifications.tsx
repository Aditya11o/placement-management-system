import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  XCircle, Calendar, Briefcase, 
  Filter,
  Check, Clock, Trash2, Mail
} from 'lucide-react';
import api from '../../api';
import ListSkeleton from '../../components/skeletons/ListSkeleton';

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All Notifications');
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
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await Promise.all(notifications.filter(n => !n.isRead).map(n => api.patch(`/notifications/${n._id}/read`)));
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
    if (activeTab === 'All Notifications') return true;
    if (activeTab === 'Unread') return !notif.isRead;
    if (activeTab === 'Read') return notif.isRead;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'job': return { icon: <Briefcase className="text-gray-900" size={20} />, bg: 'bg-gray-100' };
      case 'application': return { icon: <UserPlus className="text-blue-600" size={20} />, bg: 'bg-blue-50' };
      case 'interview': return { icon: <Calendar className="text-indigo-600" size={20} />, bg: 'bg-indigo-50' };
      case 'selected': return { icon: <Check className="text-emerald-600" size={20} />, bg: 'bg-emerald-50' };
      case 'rejected': return { icon: <XCircle className="text-rose-600" size={20} />, bg: 'bg-rose-50' };
      default: return { icon: <Mail className="text-gray-500" size={20} />, bg: 'bg-gray-100' };
    }
  };

  if (loading) {
    return <ListSkeleton />;
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-gray-500 text-[15px] mt-1 font-medium">Manage your candidate updates and recruitment alerts.</p>
        </div>
        <button 
          onClick={handleMarkAllRead}
          className="px-8 py-4 bg-[#000613] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center gap-3 active:scale-95 group"
        >
          <Check size={16} strokeWidth={3} className="text-emerald-400" />
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
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter by:</span>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[12px] font-black text-gray-900 hover:bg-white transition-all">
            Newest First
            <Filter size={14} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notif) => {
          const { icon, bg } = getIcon(notif.type);
          return (
            <div 
              key={notif._id}
              className={`group bg-white border rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col md:flex-row gap-6 ${
                !notif.isRead ? 'border-l-[6px] border-l-blue-600 border-gray-100' : 'border-gray-100'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                {icon}
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-[18px] font-black text-gray-900 tracking-tight leading-none">{notif.title}</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-[12px] font-bold text-gray-400 flex items-center gap-1.5">
                      <Clock size={14} className="opacity-50" />
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                    {!notif.isRead && (
                      <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm shadow-blue-200" />
                    )}
                    <button 
                      onClick={() => handleDelete(notif._id)}
                      className="p-2 text-gray-300 hover:text-rose-500 hover:bg-gray-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-[14px] leading-relaxed max-w-2xl font-medium">
                  {notif.message}
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  {!notif.isRead && (
                    <button 
                      onClick={() => handleMarkRead(notif._id)}
                      className="px-5 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100"
                    >
                      Mark as Read
                    </button>
                  )}
                  {notif.link && (
                    <a 
                      href={notif.link}
                      className="px-5 py-2 bg-[#000613] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-black/5 flex items-center gap-2"
                    >
                      View Details
                      <Clock size={12} className="opacity-50" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filteredNotifications.length === 0 && (
          <p className="text-center py-20 text-gray-400 font-bold italic">No notifications found.</p>
        )}
      </div>

      {/* Pagination / Load More */}
      {filteredNotifications.length > 10 && (
        <div className="pt-4 flex justify-center">
          <button className="px-10 py-4 border-2 border-gray-100 rounded-[20px] text-[12px] font-black text-gray-400 uppercase tracking-widest hover:border-gray-900 hover:text-gray-900 transition-all active:scale-95">
            Load Older Notifications
          </button>
        </div>
      )}

    </div>
  );
};

export default Notifications;
