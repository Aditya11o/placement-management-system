import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, Sun, Moon, User, Settings, LogOut, ChevronDown, Menu, HelpCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../api';

interface NavbarProps {
  role: 'student' | 'recruiter' | 'admin' | 'alumni' | 'mentor';
  onToggleSidebar?: () => void;
  onHelpOpen?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ role, onToggleSidebar, onHelpOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (role === 'admin') {
      const fetchAdminData = async () => {
        try {
          const { data } = await api.get('/admin/me');
          setAdminData(data);
        } catch (error) {
          console.error('Error fetching admin data:', error);
        }
      };
      fetchAdminData();
    }
  }, [role]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white/80 border-b border-gray-100 sticky top-0 w-full z-20 flex items-center justify-between px-4 md:px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden md:block relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] group-focus-within:text-[var(--primary)] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search opportunities, companies..." 
            className="w-full pl-12 pr-4 py-2.5 bg-[var(--surface-container-low)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 border border-transparent focus:border-[var(--outline-variant)] transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6 flex-1 justify-end">
        {role === 'recruiter' && (
          <button className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95">
            Post New Job
          </button>
        )}
        
        <div className="flex items-center gap-4">
          <button 
            onClick={onHelpOpen}
            className="p-2.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all hover:scale-110 active:scale-90 shadow-sm sm:shadow-none"
            title="Help & Support"
          >
            <HelpCircle size={20} />
          </button>
          <button 
            onClick={toggleTheme}
            className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-all hover:scale-110"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className="relative p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
          </button>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 pl-4 border-l border-gray-100 hover:opacity-80 transition-opacity"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-gray-900 leading-none">
                {role === 'admin' && adminData ? adminData.name : role === 'recruiter' ? 'Global Tech Solutions' : 'Alex Rivera'}
              </p>
              <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">
                {role === 'admin' ? (adminData?.role ? adminData.role : 'Admin') : role === 'recruiter' ? 'Premium Partner' : role === 'student' ? 'Computer Science Senior' : role}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 font-bold border border-gray-200 shadow-sm overflow-hidden">
              <img 
                src={role === 'admin' && adminData?.profilePhoto 
                  ? adminData.profilePhoto 
                  : role === 'recruiter' 
                    ? "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=100&auto=format&fit=crop"
                    : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"
                } 
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <Link 
                to={`/${role}/profile`}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <User size={16} />
                My Profile
              </Link>
              <Link 
                to={`/${role}/settings`}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <Settings size={16} />
                Settings
              </Link>
              <div className="my-1 border-t border-gray-50"></div>
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
