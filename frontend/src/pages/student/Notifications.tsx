import React, { useState } from 'react';
import { 
  Bell, Mail, Briefcase, FileText, Calendar, 
  Check, Trash2, MoreVertical, User
} from 'lucide-react';

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');

  const stats = [
    { label: 'Total', value: '24', icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Unread', value: '05', icon: Mail, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Jobs', value: '12', icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Apps', value: '08', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Interviews', value: '04', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const tabs = ['All', 'Jobs', 'Applications', 'Interviews', 'System'];

  const notifications = [
    {
      id: 1,
      type: 'Job',
      title: 'New Job Posted: Google',
      description: 'A Software Engineering (Intern) position matches your profile skills in React and Node.js. Apply before the deadline.',
      time: '2 hours ago',
      status: 'Unread',
      icon: Briefcase,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      actions: ['View Details', 'Mark as Read']
    },
    {
      id: 2,
      type: 'Application',
      title: 'Application Update: Microsoft',
      description: 'Your application status for \'Junior Analyst\' has been moved to "Under Review".',
      time: '5 hours ago',
      status: 'Info',
      icon: FileText,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
      actions: ['View Status']
    },
    {
      id: 3,
      type: 'Interview',
      title: 'Interview Reminder: Amazon SDE-1',
      description: 'Your technical round is scheduled for tomorrow at 10:00 AM. Please ensure a stable connection.',
      time: '1 day ago',
      status: 'Critical',
      icon: Calendar,
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50',
      actions: ['Join Meeting', 'Mark as Read']
    },
    {
      id: 4,
      type: 'System',
      title: 'Profile Completion Bonus',
      description: 'Complete your profile to increase your visibility to recruiters by 45%.',
      time: '2 days ago',
      status: 'Success',
      icon: User,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      actions: ['Update Profile']
    }
  ];

  const getTagStyles = (status: string) => {
    switch (status) {
      case 'Unread': return 'bg-blue-100 text-blue-700';
      case 'Critical': return 'bg-red-100 text-red-700';
      case 'Success': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-gray-500 font-bold mt-1 tracking-tight">Stay updated with your academic and career progress.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95">
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
        {notifications.map(notif => (
          <div key={notif.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start gap-6 hover:shadow-md transition-all group relative overflow-hidden">
            {/* Left accent border for unread/critical */}
            {(notif.status === 'Unread' || notif.status === 'Critical') && (
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${notif.status === 'Unread' ? 'bg-blue-600' : 'bg-rose-600'}`} />
            )}
            
            <div className="flex gap-4 flex-1">
              <div className={`w-12 h-12 ${notif.iconBg} ${notif.iconColor} rounded-xl flex items-center justify-center shrink-0 border border-black/5 shadow-sm`}>
                <notif.icon size={22} />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h4 className="text-base font-black text-gray-900 tracking-tight">{notif.title}</h4>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${getTagStyles(notif.status)}`}>
                    {notif.status}
                  </span>
                </div>
                <p className="text-gray-500 text-[13px] font-bold leading-relaxed pr-8">{notif.description}</p>
                
                {/* Actions */}
                <div className="flex flex-wrap gap-3 mt-5">
                  {notif.actions.map(action => (
                    <button 
                      key={action}
                      className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                        ${action.includes('View') || action === 'Join Meeting' || action === 'Update Profile'
                          ? 'bg-[#000613] text-white hover:bg-gray-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between self-stretch shrink-0">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{notif.time}</span>
                <button className="text-gray-300 hover:text-rose-500 transition-colors p-1">
                  <Trash2 size={16} />
                </button>
              </div>
              <button className="text-gray-300 hover:text-gray-900 transition-colors opacity-0 group-hover:opacity-100">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="flex justify-center mt-12 pb-12">
        <button className="px-8 py-3 bg-white border border-gray-200 text-gray-500 rounded-xl text-[11px] font-black uppercase tracking-widest hover:border-gray-400 hover:text-gray-900 transition-all shadow-sm">
          Load More Notifications
        </button>
      </div>

    </div>
  );
};

export default Notifications;
