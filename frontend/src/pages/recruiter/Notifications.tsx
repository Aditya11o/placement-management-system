import React, { useState } from 'react';
import { 
  UserPlus, CheckCircle2, 
  XCircle, Calendar, Briefcase, 
  Undo2, MoreVertical, Filter,
  Check, Clock
} from 'lucide-react';

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All Notifications');

  const sampleNotifications = [
    {
      id: 1,
      type: 'New Applicant',
      description: 'Alex Rivera has applied for the Senior Software Engineer role.',
      time: '2 hours ago',
      unread: true,
      tags: [
        { label: 'STUDENT', value: 'ALEX RIVERA' },
        { label: 'ROLE', value: 'SENIOR SOFTWARE ENGINEER' }
      ],
      icon: <UserPlus className="text-blue-600" size={20} />,
      iconBg: 'bg-blue-50'
    },
    {
      id: 2,
      type: 'Candidate Shortlisted',
      description: 'Jordan Smith has been moved to the shortlist for UX Researcher position.',
      time: '5 hours ago',
      unread: false,
      tags: [
        { label: 'STUDENT', value: 'JORDAN SMITH' },
        { label: 'STATUS', value: 'SHORTLISTED' }
      ],
      icon: <CheckCircle2 className="text-amber-600" size={20} />,
      iconBg: 'bg-amber-50'
    },
    {
      id: 3,
      type: 'Interview Scheduled',
      description: 'A final round interview is confirmed for Elena Gilbert on October 24th.',
      time: 'Yesterday',
      unread: true,
      tags: [
        { label: 'DATE', value: 'OCT 24, 2026' },
        { label: 'TIME', value: '10:00 AM' }
      ],
      icon: <Calendar className="text-indigo-600" size={20} />,
      iconBg: 'bg-indigo-50'
    },
    {
      id: 4,
      type: 'Candidate Selected',
      description: 'Michael Chen has accepted the offer for Data Analyst.',
      time: '2 days ago',
      unread: false,
      tags: [
        { label: 'HIRED', value: 'MICHAEL CHEN' },
        { label: 'ROLE', value: 'DATA ANALYST' }
      ],
      icon: <Check className="text-emerald-600" size={20} />,
      iconBg: 'bg-emerald-50'
    },
    {
      id: 5,
      type: 'Candidate Rejected',
      description: 'The application for Software Intern role by Sarah Jenkins has been declined.',
      time: '3 days ago',
      unread: false,
      tags: [
        { label: 'STUDENT', value: 'SARAH JENKINS' },
        { label: 'ROLE', value: 'SOFTWARE INTERN' }
      ],
      icon: <XCircle className="text-rose-600" size={20} />,
      iconBg: 'bg-rose-50'
    },
    {
      id: 6,
      type: 'New Job Posted',
      description: 'Frontend Developer (React) role is now live on the student portal.',
      time: '4 days ago',
      unread: false,
      tags: [
        { label: 'STATUS', value: 'LIVE' },
        { label: 'ROLE', value: 'FRONTEND DEVELOPER' }
      ],
      icon: <Briefcase className="text-[#000613]" size={20} />,
      iconBg: 'bg-gray-100'
    },
    {
      id: 7,
      type: 'Application Withdrawn',
      description: 'David Miller has withdrawn their application for the DevOps Engineer role.',
      time: '1 week ago',
      unread: false,
      tags: [
        { label: 'STUDENT', value: 'DAVID MILLER' },
        { label: 'ROLE', value: 'DEVOPS ENGINEER' }
      ],
      icon: <Undo2 className="text-gray-500" size={20} />,
      iconBg: 'bg-gray-100'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-gray-500 text-[15px] mt-1 font-medium">Manage your candidate updates and recruitment alerts.</p>
        </div>
        <button className="px-8 py-4 bg-[#000613] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center gap-3 active:scale-95 group">
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
        {sampleNotifications.map((notif) => (
          <div 
            key={notif.id}
            className={`group bg-white border rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col md:flex-row gap-6 ${
              notif.unread ? 'border-l-[6px] border-l-blue-600 border-gray-100' : 'border-gray-100'
            }`}
          >
            {/* Type Icon */}
            <div className={`w-14 h-14 rounded-2xl ${notif.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
              {notif.icon}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-[18px] font-black text-gray-900 tracking-tight leading-none">{notif.type}</h3>
                <div className="flex items-center gap-4">
                  <span className="text-[12px] font-bold text-gray-400 flex items-center gap-1.5">
                    <Clock size={14} className="opacity-50" />
                    {notif.time}
                  </span>
                  {notif.unread && (
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm shadow-blue-200" />
                  )}
                  <button className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 text-[14px] leading-relaxed max-w-2xl font-medium">
                {notif.description.split(/(Senior Software Engineer|UX Researcher|Elena Gilbert|Michael Chen|Data Analyst|Sarah Jenkins|Software Intern|Frontend Developer|David Miller|DevOps Engineer)/g).map((part, i) => (
                  <span key={i} className={part.match(/Senior Software Engineer|UX Researcher|Elena Gilbert|Michael Chen|Data Analyst|Sarah Jenkins|Software Intern|Frontend Developer|David Miller|DevOps Engineer/) ? "font-black text-gray-900" : ""}>
                    {part}
                  </span>
                ))}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {notif.tags.map((tag, idx) => (
                  <div key={idx} className="flex bg-gray-50 border border-gray-100 rounded-full px-3 py-1 items-center gap-2 group/tag hover:bg-gray-100 transition-colors">
                    <span className="text-[9px] font-black text-gray-400 tracking-widest">{tag.label}:</span>
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-wide">{tag.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination / Load More */}
      <div className="pt-4 flex justify-center">
        <button className="px-10 py-4 border-2 border-gray-100 rounded-[20px] text-[12px] font-black text-gray-400 uppercase tracking-widest hover:border-gray-900 hover:text-gray-900 transition-all active:scale-95">
          Load Older Notifications
        </button>
      </div>

    </div>
  );
};

export default Notifications;
