import React from 'react';
import { Bell, Search } from 'lucide-react';

interface NavbarProps {
  role: 'student' | 'recruiter' | 'admin' | 'alumni' | 'mentor';
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
      
      <div className="flex items-center gap-6 flex-1 justify-end">
        {role === 'recruiter' && (
          <button className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95">
            Post New Job
          </button>
        )}
        
        <div className="flex items-center gap-4">
          <button className="relative p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
          </button>
          <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
            <Search size={20} />
          </button>
        </div>
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-gray-900 leading-none">
              {role === 'recruiter' ? 'Global Tech Solutions' : 'Alex Rivera'}
            </p>
            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">
              {role === 'recruiter' ? 'Premium Partner' : role === 'student' ? 'Computer Science Senior' : role}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 font-bold border border-gray-200 shadow-sm overflow-hidden">
            <img 
              src={role === 'recruiter' 
                ? "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=100&auto=format&fit=crop"
                : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"
              } 
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
