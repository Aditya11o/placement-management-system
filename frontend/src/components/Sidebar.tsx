import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileText, Settings, Users, Bell, Calendar, LogOut, BookOpen, Shield, MessageSquare, X, Sparkles, Bookmark, Building2, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';

interface SidebarProps {
  role: 'student' | 'recruiter' | 'admin' | 'alumni' | 'mentor';
  isOpen?: boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
}

 const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, isCollapsed, onClose }) => {
  const { logout, profile } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const getLinks = () => {
    switch (role as any) {
      case 'student':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
          { name: 'My Profile', icon: Users, path: '/student/profile' },
          { name: 'Jobs', icon: Briefcase, path: '/student/jobs' },
          { name: 'Placement Drives', icon: Activity, path: '/student/drives' },
          { name: 'Explore Companies', icon: Building2, path: '/student/companies' },
          { name: 'Watchlist', icon: Bookmark, path: '/student/watchlist' },
          { name: 'My Applications', icon: FileText, path: '/student/applications' },
          { name: 'Interview Schedule', icon: Calendar, path: '/student/interviews' },
          { name: 'Academic Calendar', icon: Calendar, path: '/student/calendar' },
          { name: 'Prep Toolkit', icon: Sparkles, path: '/student/prep-toolkit' },
          { name: 'Career Prep', icon: BookOpen, path: '/student/resources' },
          { name: 'Knowledge Hub', icon: Sparkles, path: '/student/experiences' },
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
          { name: 'Academic Calendar', icon: Calendar, path: '/recruiter/calendar' },
          { name: 'ROI Analytics', icon: TrendingUp, path: '/recruiter/roi' },
          { name: 'Notifications', icon: Bell, path: '/recruiter/notifications' },
        ];
      case 'admin':
        const adminLinks = [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
          { name: 'Manage Students', icon: Users, path: '/admin/students' },
          { name: 'Skill Verification', icon: Shield, path: '/admin/verifications' },
          { name: 'Manage Recruiters', icon: Briefcase, path: '/admin/recruiters' },
          { name: 'Placement Drives', icon: Calendar, path: '/admin/drives' },
          { name: 'Manage Jobs', icon: FileText, path: '/admin/jobs' },
          { name: 'Applications', icon: FileText, path: '/admin/applications' },
          { name: 'Interviews', icon: Calendar, path: '/admin/interviews' },
          { name: 'Academic Calendar', icon: Calendar, path: '/admin/calendar' },
          { name: 'Reports', icon: FileText, path: '/admin/reports' },
        ];

        // Super Admin Only Links
        const adminLevel = (profile as any)?.level || 'SUPER_ADMIN';
        if (adminLevel === 'SUPER_ADMIN') {
          adminLinks.push({ name: 'Admin Team', icon: Shield, path: '/admin/team' });
          adminLinks.push({ name: 'System Health', icon: Activity, path: '/admin/health' });
        }

        adminLinks.push(
          { name: 'Peer Experiences', icon: Sparkles, path: '/admin/experiences' },
          { name: 'Notifications', icon: Bell, path: '/admin/notifications' }
        );
        return adminLinks;
      default:
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: `/${role}/dashboard` },
          { name: 'Calendar', icon: Calendar, path: `/${role}/calendar` },
          { name: 'Post Referral', icon: Briefcase, path: `/${role}/post-job` },
          { name: 'My Profile', icon: Users, path: `/${role}/profile` },
        ];
    }
  };

  const links = getLinks();

  return (
    <aside 
      role="navigation"
      aria-label="Main Sidebar"
      className={`h-screen bg-surface-container-low flex flex-col fixed left-0 top-0 border-r border-outline-variant z-40 transition-all duration-300 transform ${
      isCollapsed ? 'w-20' : 'lg:w-64 md:w-20 w-64'
    } ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className={`h-20 flex items-center justify-between px-6 border-b border-outline-variant/30 ${isCollapsed ? 'justify-center px-0' : ''}`}>
        {!isCollapsed && (
          <div className="lg:block md:hidden block">
            <h1 className="text-xl font-black font-display text-on-surface tracking-tight uppercase leading-none">
              Placement <span className="text-surface-tint">Portal</span>
            </h1>
            {role === 'recruiter' && (
              <p className="text-[10px] font-black text-on-surface-variant/60 tracking-[0.2em] mt-1">RECRUITER CONSOLE</p>
            )}
          </div>
        )}
        {isCollapsed && (
           <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary font-black">P</div>
        )}
        <button 
          onClick={onClose}
          aria-label="Close sidebar"
          className="md:hidden p-2 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <X size={20} aria-hidden="true" />
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
              aria-label={`Navigate to ${link.name}`}
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
              <Icon size={18} aria-hidden="true" />
              <span className={`${isCollapsed ? 'hidden' : 'lg:block md:hidden block'}`}>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className={`p-4 space-y-2 border-t border-outline-variant ${isCollapsed ? 'p-2' : ''}`}>
        <NavLink
          to={`/${role}/chat`}
          title={isCollapsed ? "Messages" : ""}
          aria-label="Navigate to Messages"
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
          <MessageSquare size={18} aria-hidden="true" />
          <span className={`${isCollapsed ? 'hidden' : 'lg:block md:hidden block'}`}>Messages</span>
        </NavLink>
        <NavLink
          to={`/${role}/settings`}
          title={isCollapsed ? "Settings" : ""}
          aria-label="Navigate to Settings"
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
          <Settings size={18} aria-hidden="true" />
          <span className={`${isCollapsed ? 'hidden' : 'lg:block md:hidden block'}`}>Settings</span>
        </NavLink>
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          title={isCollapsed ? "Logout" : ""}
          aria-label="Logout of application"
          className={`w-full flex items-center gap-3 rounded-xl font-bold text-[13px] text-rose-600 hover:bg-rose-500/10 transition-all duration-300 ${
            isCollapsed ? 'justify-center p-3.5' : 'px-5 py-3.5'
          }`}
        >
          <LogOut size={18} aria-hidden="true" />
          <span className={`${isCollapsed ? 'hidden' : 'lg:block md:hidden block'}`}>Logout</span>
        </button>

        {!isCollapsed && (
          <div id="pms-tour-cmd" className="mt-4 px-5 py-3 bg-surface-container-high rounded-xl border border-outline-variant/50">
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Quick Search</p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-on-surface-variant/70">Press Ctrl + K</span>
              <Sparkles size={12} className="text-secondary" />
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={async () => {
          await logout();
          window.location.href = '/login';
        }}
        title="Confirm Logout"
        message="Are you sure you want to end your session? You will need to login again to access your dashboard."
        confirmText="Logout"
        type="warning"
        icon={LogOut}
      />
    </aside>
  );
};

export default Sidebar;
