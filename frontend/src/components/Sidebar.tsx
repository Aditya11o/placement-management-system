import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileText, Settings, Users, Bell, Calendar, LogOut, BookOpen, Shield, MessageSquare, HelpCircle } from 'lucide-react';

interface SidebarProps {
  role: 'student' | 'recruiter' | 'admin' | 'alumni' | 'mentor';
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, onClose }) => {

  const getLinks = () => {
    switch (role as any) { // Type casting to handle expanded roles temporarily
      case 'student':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
          { name: 'My Profile', icon: Users, path: '/student/profile' },
          { name: 'Jobs', icon: Briefcase, path: '/student/jobs' },
          { name: 'My Applications', icon: FileText, path: '/student/applications' },
          { name: 'Interview Schedule', icon: Calendar, path: '/student/interviews' },
          { name: 'Resume Builder', icon: FileText, path: '/student/resume-builder' },
          { name: 'Career Prep', icon: BookOpen, path: '/student/resources' },
          { name: 'Mock Interviews', icon: MessageSquare, path: '/student/mock-interviews' },
          { name: 'Notifications', icon: Bell, path: '/student/notifications' },
          { name: 'Help & Support', icon: HelpCircle, path: '/student/support' },
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
      case 'alumni':
      case 'mentor':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: `/${role}/dashboard` },
          { name: 'Post Referral', icon: Briefcase, path: `/${role}/post-job` },
          { name: 'My Profile', icon: Users, path: `/${role}/profile` },
          { name: 'Help & Support', icon: HelpCircle, path: `/${role}/support` },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 h-screen bg-surface-container-low flex flex-col fixed left-0 top-0 border-r border-outline-variant z-30 transition-colors duration-300">
      <div className="h-20 flex items-center justify-between px-8 border-b border-outline-variant/30">
        <h1 className="text-xl font-bold font-display text-primary tracking-tight uppercase">
          Placement <span className="opacity-40 font-normal">Portal</span>
        </h1>
      </div>
      <nav className="flex-1 px-4 py-8 space-y-1 overflow-hidden">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-[13px] transition-all duration-300 ${
                  isActive
                    ? 'bg-[#000613] text-white shadow-xl shadow-black/10 scale-[1.02]'
                    : 'text-[var(--on-surface-variant)] hover:bg-[#e7e8e9] hover:text-[var(--on-surface)]'
                }`
              }
            >
              <Icon size={18} />
              {link.name}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 space-y-2 border-t border-[#e1e3e4]">
        <NavLink
          to={`/${role}/chat`}
          className={({ isActive }) =>
            `flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-[13px] transition-all duration-300 ${
              isActive
                ? 'bg-[#000613] text-white shadow-xl shadow-black/10 scale-[1.02]'
                : 'text-[var(--on-surface-variant)] hover:bg-[#e7e8e9] hover:text-[var(--on-surface)]'
            }`
          }
        >
          <MessageSquare size={18} />
          Messages
        </NavLink>
        <NavLink
          to={`/${role}/settings`}
          className={({ isActive }) =>
            `flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-[13px] transition-all duration-300 ${
              isActive
                ? 'bg-[#000613] text-white'
                : 'text-[var(--on-surface-variant)] hover:bg-[#e7e8e9]'
            }`
          }
        >
          <Settings size={18} />
          Settings
        </NavLink>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-[13px] text-rose-600 hover:bg-rose-50 transition-all duration-300"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
