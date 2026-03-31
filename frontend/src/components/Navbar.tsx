import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, Sun, Moon, User, Settings, LogOut, ChevronDown, Menu, HelpCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import api from '../api';

interface NavbarProps {
  role: 'student' | 'recruiter' | 'admin' | 'alumni' | 'mentor';
  onToggleSidebar?: () => void;
  onHelpOpen?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ role, onToggleSidebar, onHelpOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifs = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.is_read).length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put(`/notifications/read-all/${user?._id}`);
      fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifClick = async (notif: any) => {
    if (!notif.is_read) {
      try {
        await api.put(`/notifications/read/${notif._id}`);
        fetchNotifs();
      } catch (err) {
        console.error(err);
      }
    }
    setNotifOpen(false);
    if (notif.type === 'job') navigate(`/${role}/jobs`);
    else if (notif.type === 'interview') navigate(`/${role}/interviews`);
    else if (notif.type === 'message') navigate(`/${role}/messages`);
    else navigate(`/${role}/notifications`);
  };

  return (
    <header className="h-16 bg-surface-container-lowest/80 border-b border-outline-variant sticky top-0 w-full z-20 flex items-center justify-between px-3 md:px-6 backdrop-blur-xl">
      <div className="flex items-center gap-2 md:gap-4 flex-1">
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden lg:block relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] group-focus-within:text-[var(--primary)] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search opportunities..." 
            className="w-full pl-12 pr-4 py-2.5 bg-[var(--surface-container-low)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 border border-transparent focus:border-[var(--outline-variant)] transition-all"
          />
        </div>
        <button className="lg:hidden p-2.5 text-on-surface-variant hover:bg-surface-container rounded-xl">
          <Search size={20} />
        </button>
      </div>
      
      <div className="flex items-center gap-2 md:gap-6 flex-1 justify-end">
        {role === 'recruiter' && (
          <button 
            onClick={() => navigate('/recruiter/post-job')}
            className="hidden sm:flex items-center gap-2 px-4 md:px-6 py-2.5 bg-primary text-on-primary rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg active:scale-95"
          >
            Post Job
          </button>
        )}
        
        <div className="flex items-center gap-1 md:gap-4">
          <Link 
            to={role === 'student' ? "/student/help-support" : role === 'recruiter' ? "/recruiter/help-support" : "#"}
            onClick={role !== 'student' && role !== 'recruiter' ? onHelpOpen : undefined}
            className="p-2 md:p-2.5 text-on-surface-variant hover:bg-surface-container hover:text-surface-tint rounded-xl transition-all"
            title="Help & Support"
          >
            <HelpCircle className="w-[18px] h-[18px] md:w-5 md:h-5" />
          </Link>
          <button 
            onClick={toggleTheme}
            className="p-2 md:p-2.5 text-on-surface-variant hover:bg-surface-container rounded-xl transition-all"
          >
            {theme === 'light' ? (
              <Moon className="w-[18px] h-[18px] md:w-5 md:h-5" />
            ) : (
              <Sun className="w-[18px] h-[18px] md:w-5 md:h-5" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative notification-dropdown">
            <button 
              onClick={() => {
                setNotifOpen(!notifOpen);
                setDropdownOpen(false);
              }}
              className="relative p-2.5 text-on-surface-variant hover:bg-surface-container rounded-xl transition-all hover:scale-110 active:scale-90"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 min-w-[18px] h-[18px] bg-rose-500 border-2 border-surface-container-lowest rounded-full text-[10px] font-black text-white flex items-center justify-center px-0.5 animate-in zoom-in duration-300">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-3 w-80 md:w-96 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant py-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-6 pb-4 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="text-sm font-black text-on-surface uppercase tracking-widest">Notifications</h3>
                  {unreadCount > 0 && (
                     <button 
                       onClick={handleMarkAllRead}
                       className="text-[10px] font-black text-blue-600 uppercase hover:underline"
                     >
                       Mark all read
                     </button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div 
                        key={notif._id} 
                        onClick={() => handleNotifClick(notif)}
                        className={`px-6 py-4 border-b border-outline-variant/30 last:border-0 hover:bg-surface-container transition-colors cursor-pointer group relative ${!notif.is_read ? 'bg-surface-tint/5' : ''}`}
                      >
                        {!notif.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />}
                        <div className="flex justify-between items-start gap-2">
                          <h4 className={`text-xs font-black tracking-tight ${!notif.is_read ? 'text-on-surface' : 'text-on-surface-variant'}`}>{notif.title}</h4>
                          <span className="text-[9px] font-bold text-on-surface-variant whitespace-nowrap">{new Date(notif.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-sm text-on-surface-variant font-bold italic">No new notifications</p>
                    </div>
                  )}
                </div>
                <div className="px-6 pt-4 border-t border-gray-50">
                   <Link 
                     to={`/${role}/notifications`} 
                     className="block w-full text-center py-2 bg-surface-container text-on-surface rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-surface-container-high transition-all"
                     onClick={() => setNotifOpen(false)}
                   >
                     View All Notifications
                   </Link>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 pl-4 border-l border-outline-variant hover:opacity-80 transition-all hover:scale-[1.02] active:scale-95"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-on-surface leading-none">
                {profile?.user?.name || user?.name || (role === 'admin' ? 'Admin User' : 'Loading...')}
              </p>
              <p className="text-[10px] text-on-surface-variant font-bold mt-1 uppercase tracking-wider">
                {role === 'admin' ? (profile?.role || 'System Admin') : 
                 role === 'recruiter' ? (profile?.recruiterDetails?.companyName || 'Recruiter') : 
                 role === 'student' ? (profile?.department || 'Student') : role}
              </p>
            </div>
            <Avatar 
              name={profile?.user?.name || user?.name || ''} 
              profilePhoto={role === 'recruiter' 
                ? (profile?.recruiterDetails?.companyLogo || profile?.profilePhoto || profile?.profile_photo || user?.profilePhoto) 
                : (profile?.profilePhoto || profile?.profile_photo || user?.profilePhoto)} 
              size="md" 
            />
            <ChevronDown size={14} className={`text-on-surface-variant transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <Link 
                to={`/${role}/profile`}
                className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <User size={16} />
                My Profile
              </Link>
              <Link 
                to={`/${role}/settings`}
                className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <Settings size={16} />
                Settings
              </Link>
              <div className="my-1 border-t border-outline-variant/30"></div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
