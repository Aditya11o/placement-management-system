import React from 'react';
import { Bell, Search } from 'lucide-react';

interface NavbarProps {
  role: 'student' | 'recruiter' | 'admin';
}

const Navbar: React.FC<NavbarProps> = ({ role }) => {


  return (
    <header className="h-16 bg-white/80 border-b border-gray-100 sticky top-0 w-full z-20 flex items-center justify-between px-6 backdrop-blur-xl">
      <div className="flex-1 max-w-xl">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] group-focus-within:text-[var(--primary)] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search opportunities, companies..." 
            className="w-full pl-12 pr-4 py-2.5 bg-[var(--surface-container-low)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 border border-transparent focus:border-[var(--outline-variant)] transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6 w-64 justify-end">
        <button className="relative p-2.5 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] rounded-xl transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-[var(--outline-variant)]/20">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[var(--on-surface)] leading-none">Alex Rivera</p>
            <p className="text-[10px] text-[var(--on-surface-variant)] font-medium mt-1">
              {role === 'student' ? 'Computer Science Senior' : role.charAt(0).toUpperCase() + role.slice(1)}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700 font-bold border-2 border-white shadow-sm overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop" 
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
