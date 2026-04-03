import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileText, Settings, Users, Bell, Calendar, LogOut, BookOpen, Shield, MessageSquare, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  role: 'student' | 'recruiter' | 'admin' | 'alumni' | 'mentor';
  isOpen?: boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, isCollapsed, onClose }) => {
  const { logout } = useAuth();

  const getLinks = () => {
    // ... existing links logic
    switch (role as any) {
      case 'student':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
          { name: 'My Profile', icon: Users, path: '/student/profile' },
          { name: 'Jobs', icon: Briefcase, path: '/student/jobs' },
          { name: 'My Applications', icon: FileText, path: '/student/applications' },
          { name: 'Interview Schedule', icon: Calendar, path: '/student/interviews' },

          { name: 'Career Prep', icon: BookOpen, path: '/student/resources' },
          { name: 'Mock Interviews', icon: MessageSquare, path: '/student/mock-interviews' },
          { name: 'Notifications', icon: Bell, path: '/student/notifications' },
        ];
      case 'recruiter':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/recruiter/dashboard' },
          { name: 'Company Profile', icon: Users, path: '/recruiter/profile' },
          { name: 'Post Job', icon: Briefcase, path: '/recruiter/post-job' },
          { name: 'Manage Jobs', icon: Briefcase, path: '/recruiter/jobs' },
          { name: 'Applicants', icon: FileText, path: '/recruiter/applicants' },
          { name: 'Shortlisted Candidates', icon: Users, path: '/recruiter/shortlisted' },
          { name: 'Interview Schedule', icon: Calendar, path: '/recruiter/interviews' },
          { name: 'Notifications', icon: Bell, path: '/recruiter/notifications' },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
          { name: 'Manage Students', icon: Users, path: '/admin/students' },
          { name: 'Skill Verification', icon: Shield, path: '/admin/verifications' },
          { name: 'Manage Recruiters', icon: Briefcase, path: '/admin/recruiters' },
          { name: 'Manage Jobs', icon: FileText, path: '/admin/jobs' },
          { name: 'Applications', icon: FileText, path: '/admin/applications' },
          { name: 'Interviews', icon: Calendar, path: '/admin/interviews' },
          { name: 'Reports', icon: FileText, path: '/admin/reports' },
          { name: 'Notifications', icon: Bell, path: '/admin/notifications' },
        ];
      default:
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: `/${role}/dashboard` },
          { name: 'Post Referral', icon: Briefcase, path: `/${role}/post-job` },
          { name: 'My Profile', icon: Users, path: `/${role}/profile` },
        ];
    }
  };

  const links = getLinks();

  return (
    <aside className={`h-screen bg-surface-container-low flex flex-col fixed left-0 top-0 border-r border-outline-variant z-40 transition-all duration-300 transform ${
      isCollapsed ? 'w-20' : 'lg:w-64 md:w-20 w-64'
    } ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className={`h-20 flex items-center justify-between px-6 border-b border-outline-variant/30 ${isCollapsed ? 'justify-center px-0' : ''}`}>
        {!isCollapsed && (
          <div className="lg:block md:hidden block">
            <h1 className="text-xl font-black font-display text-gray-900 tracking-tight uppercase leading-none">
              Placement <span className="text-blue-600">Portal</span>
            </h1>
            {role === 'recruiter' && (
              <p className="text-[10px] font-black text-gray-400 tracking-[0.2em] mt-1">RECRUITER CONSOLE</p>
            )}
          </div>
        )}
        {isCollapsed && (
           <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary font-black">P</div>
        )}
        <button 
          onClick={onClose}
          className="md:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <nav className={`flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar ${isCollapsed ? 'px-2' : ''}`}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              title={isCollapsed ? link.name : ""}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl font-bold text-[13px] transition-all duration-300 ${
                  isCollapsed ? 'justify-center p-3.5' : 'px-5 py-3.5'
                } ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-xl shadow-black/10 scale-[1.02]'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface ' + (!isCollapsed ? 'hover:translate-x-1' : '')
                }`
              }
            >
              <Icon size={18} />
              <span className={`${isCollapsed ? 'hidden' : 'lg:block md:hidden block'}`}>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className={`p-4 space-y-2 border-t border-outline-variant ${isCollapsed ? 'p-2' : ''}`}>
        <NavLink
          to={`/${role}/chat`}
          title={isCollapsed ? "Messages" : ""}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl font-bold text-[13px] transition-all duration-300 ${
              isCollapsed ? 'justify-center p-3.5' : 'px-5 py-3.5'
            } ${
              isActive
                ? 'bg-primary text-on-primary shadow-xl shadow-black/10'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`
          }
        >
          <MessageSquare size={18} />
          <span className={`${isCollapsed ? 'hidden' : 'lg:block md:hidden block'}`}>Messages</span>
        </NavLink>
        <NavLink
          to={`/${role}/settings`}
          title={isCollapsed ? "Settings" : ""}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl font-bold text-[13px] transition-all duration-300 ${
              isCollapsed ? 'justify-center p-3.5' : 'px-5 py-3.5'
            } ${
              isActive
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`
          }
        >
          <Settings size={18} />
          <span className={`${isCollapsed ? 'hidden' : 'lg:block md:hidden block'}`}>Settings</span>
        </NavLink>
        <button
          onClick={async () => {
            await logout();
            window.location.href = '/login';
          }}
          title={isCollapsed ? "Logout" : ""}
          className={`w-full flex items-center gap-3 rounded-xl font-bold text-[13px] text-rose-600 hover:bg-rose-50 transition-all duration-300 ${
            isCollapsed ? 'justify-center p-3.5' : 'px-5 py-3.5'
          }`}
        >
          <LogOut size={18} />
          <span className={`${isCollapsed ? 'hidden' : 'lg:block md:hidden block'}`}>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
