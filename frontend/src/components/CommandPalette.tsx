import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  LayoutDashboard, 
  User, 
  Settings, 
  LogOut, 
  Briefcase, 
  FileText, 
  Calendar, 
  MessageSquare,
  Users,
  ShieldCheck,
  BarChart3,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './CommandPalette.css';

interface Command {
  id: string;
  label: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
  roles?: string[];
}

const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    // Global Commands
    { id: 'dashboard', label: 'Dashboard', category: 'Navigation', icon: <LayoutDashboard className="w-4 h-4" />, action: () => navigate(`/${user?.role}/dashboard`) },
    { id: 'profile', label: 'My Profile', category: 'Navigation', icon: <User className="w-4 h-4" />, action: () => navigate(`/${user?.role}/profile`) },
    { id: 'settings', label: 'Settings', category: 'Navigation', icon: <Settings className="w-4 h-4" />, action: () => navigate(`/${user?.role}/settings`) },
    { id: 'chat', label: 'Messages / Chat', category: 'Communication', icon: <MessageSquare className="w-4 h-4" />, action: () => navigate(`/${user?.role}/chat`) },
    { id: 'logout', label: 'Logout', category: 'Account', icon: <LogOut className="w-4 h-4 text-rose-500" />, action: logout },

    // Student Commands
    { id: 'jobs', label: 'Job Feed', category: 'Placement', roles: ['student'], icon: <Briefcase className="w-4 h-4" />, action: () => navigate('/student/jobs') },
    { id: 'applications', label: 'My Applications', category: 'Placement', roles: ['student'], icon: <ClipboardList className="w-4 h-4" />, action: () => navigate('/student/applications') },
    { id: 'interview-schedule', label: 'Interview Schedule', category: 'Placement', roles: ['student'], icon: <Calendar className="w-4 h-4" />, action: () => navigate('/student/interviews') },
    { id: 'resume-builder', label: 'Resume Builder', category: 'Tools', roles: ['student'], icon: <FileText className="w-4 h-4" />, action: () => navigate('/student/resume-builder') },

    // Recruiter Commands
    { id: 'post-job', label: 'Post New Job', category: 'Hiring', roles: ['recruiter'], icon: <Briefcase className="w-4 h-4" />, action: () => navigate('/recruiter/post-job') },
    { id: 'applicants', label: 'Manage Applicants', category: 'Hiring', roles: ['recruiter'], icon: <Users className="w-4 h-4" />, action: () => navigate('/recruiter/applicants') },
    { id: 'pipeline', label: 'Interview Pipeline', category: 'Hiring', roles: ['recruiter'], icon: <BarChart3 className="w-4 h-4" />, action: () => navigate('/recruiter/pipeline') },

    // Admin Commands
    { id: 'manage-students', label: 'Manage Students', category: 'Operations', roles: ['admin'], icon: <Users className="w-4 h-4" />, action: () => navigate('/admin/students') },
    { id: 'verifications', label: 'Verification Queue', category: 'Governance', roles: ['admin'], icon: <ShieldCheck className="w-4 h-4" />, action: () => navigate('/admin/verifications') },
    { id: 'audit-logs', label: 'System Audit Logs', category: 'Security', roles: ['admin'], icon: <ShieldCheck className="w-4 h-4" />, action: () => navigate('/admin/audit') },
    { id: 'reports', label: 'Analytics Reports', category: 'Data', roles: ['admin'], icon: <BarChart3 className="w-4 h-4" />, action: () => navigate('/admin/reports') },
  ];

  const filteredCommands = commands.filter(cmd => {
    const matchesRole = !cmd.roles || cmd.roles.includes(user?.role || '');
    const matchesQuery = cmd.label.toLowerCase().includes(query.toLowerCase()) || 
                       cmd.category.toLowerCase().includes(query.toLowerCase());
    return matchesRole && matchesQuery;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const executeCommand = (cmd: Command) => {
    cmd.action();
    setIsOpen(false);
  };

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex]);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="command-palette-backdrop"
            onClick={() => setIsOpen(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="command-palette-container"
          >
            <div className="command-palette-search">
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Search commands, pages, actions..." 
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleListKeyDown}
              />
              <div className="command-palette-hint">Esc</div>
            </div>

            <div className="command-palette-results custom-scrollbar">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd, idx) => (
                  <div 
                    key={cmd.id}
                    className={`command-item ${idx === selectedIndex ? 'active' : ''}`}
                    onClick={() => executeCommand(cmd)}
                  >
                    <div className="command-item-icon">{cmd.icon}</div>
                    <div className="command-item-details">
                      <span className="command-item-label">{cmd.label}</span>
                      <span className="command-item-category">{cmd.category}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="command-palette-empty">
                  No commands found matching "{query}"
                </div>
              )}
            </div>
            
            <div className="command-palette-footer">
              <div className="footer-tip">
                <span>↑↓</span> to navigate
              </div>
              <div className="footer-tip">
                <span>Enter</span> to select
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
