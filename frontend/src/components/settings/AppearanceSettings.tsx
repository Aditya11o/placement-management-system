import React from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const AppearanceSettings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const options = [
    {
      id: 'light',
      label: 'Light Mode',
      icon: Sun,
      description: 'Classic crisp academic look.',
      color: 'bg-white',
      textColor: 'text-gray-900'
    },
    {
      id: 'dark',
      label: 'Dark Mode',
      icon: Moon,
      description: 'Focus-friendly Midnight theme.',
      color: 'bg-[#0a0c10]',
      textColor: 'text-white'
    }
  ];

  return (
    <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant p-6 lg:p-8 shadow-ambient">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
          <Monitor size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-on-surface tracking-tight">Appearance</h2>
          <p className="text-sm text-on-surface-variant font-medium">Personalize your visual experience across the platform.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = theme === option.id;

          return (
            <button
              key={option.id}
              onClick={() => {
                if (theme !== option.id) toggleTheme();
              }}
              className={`relative flex flex-col text-left p-6 rounded-[1.5rem] border-2 transition-all duration-300 group overflow-hidden ${
                isActive 
                  ? 'border-surface-tint bg-surface shadow-xl ring-4 ring-surface-tint/5' 
                  : 'border-outline-variant bg-surface-container-low hover:border-surface-tint/30 hover:bg-surface-container'
              }`}
            >
              {/* Visual Preview Box */}
              <div className={`w-full h-24 ${option.color} rounded-xl mb-4 border border-outline-variant/30 relative overflow-hidden flex flex-col p-3 shadow-inner`}>
                <div className={`w-1/2 h-2 rounded-full mb-1 opacity-20 ${isActive ? 'bg-surface-tint' : option.textColor.replace('text-', 'bg-')}`} />
                <div className={`w-3/4 h-2 rounded-full mb-3 opacity-10 ${isActive ? 'bg-surface-tint' : option.textColor.replace('text-', 'bg-')}`} />
                <div className="grid grid-cols-3 gap-2 flex-grow">
                   <div className={`rounded-md opacity-20 ${isActive ? 'bg-surface-tint' : option.textColor.replace('text-', 'bg-')}`} />
                   <div className={`rounded-md opacity-10 ${isActive ? 'bg-surface-tint' : option.textColor.replace('text-', 'bg-')}`} />
                   <div className={`rounded-md opacity-20 ${isActive ? 'bg-surface-tint' : option.textColor.replace('text-', 'bg-')}`} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <Icon size={16} className={isActive ? 'text-surface-tint' : 'text-on-surface-variant'} />
                      <span className={`text-sm font-black uppercase tracking-widest ${isActive ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {option.label}
                      </span>
                   </div>
                   <p className="text-xs text-on-surface-variant font-medium leading-relaxed">{option.description}</p>
                </div>
                {isActive && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-surface-tint text-on-primary rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Check size={14} strokeWidth={4} />
                  </motion.div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-outline-variant">
        <p className="text-[10px] items-center flex gap-2 font-black text-on-surface-variant uppercase tracking-[0.2em]">
          <span className="w-1.5 h-1.5 rounded-full bg-surface-tint animate-pulse" />
          Settings are saved automatically to your browser
        </p>
      </div>
    </div>
  );
};

export default AppearanceSettings;
