import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Command, MoveRight, HelpCircle, Layers, User, Settings, Briefcase, ClipboardList, Calendar, MessageSquare } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShortcutRow: React.FC<{ keys: string[]; label: string; icon: React.ReactNode }> = ({ keys, label, icon }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
        {icon}
      </div>
      <span className="text-sm font-bold text-gray-700">{label}</span>
    </div>
    <div className="flex items-center gap-1.5">
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <kbd className="px-2 py-1 min-w-[24px] text-center bg-white border border-gray-200 rounded-md text-[10px] font-black text-gray-900 shadow-sm uppercase tracking-tighter">
            {key}
          </kbd>
          {index < keys.length - 1 && <span className="text-[10px] text-gray-300 font-bold">then</span>}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#000613]/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6 bg-gray-50/50 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#000613] flex items-center justify-center text-white">
                  <Command size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Keyboard Shortcuts</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Speed up your workflow</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <section className="mb-8">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-500"></div> Global
                </h3>
                <div className="bg-white border border-gray-100 rounded-3xl px-6 py-2 shadow-sm">
                  <ShortcutRow icon={<HelpCircle size={16} />} label="Show / Hide Help" keys={['?']} />
                  <ShortcutRow icon={<Command size={16} />} label="Command Palette" keys={['ctrl', 'k']} />
                  <ShortcutRow icon={<X size={16} />} label="Close Overlay" keys={['esc']} />
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-green-500"></div> Navigation (Sequences)
                </h3>
                <div className="bg-white border border-gray-100 rounded-3xl px-6 py-2 shadow-sm">
                  <ShortcutRow icon={<Layers size={16} />} label="Go to Dashboard" keys={['g', 'd']} />
                  <ShortcutRow icon={<Briefcase size={16} />} label="Go to Jobs" keys={['g', 'j']} />
                  <ShortcutRow icon={<ClipboardList size={16} />} label="Go to Applications" keys={['g', 'a']} />
                  <ShortcutRow icon={<User size={16} />} label="Go to Profile" keys={['g', 'p']} />
                  <ShortcutRow icon={<Settings size={16} />} label="Go to Settings" keys={['g', 's']} />
                  <ShortcutRow icon={<Calendar size={16} />} label="Go to Calendar" keys={['g', 'c']} />
                  <ShortcutRow icon={<MessageSquare size={16} />} label="Go to Notifications" keys={['g', 'n']} />
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-[11px] font-bold text-gray-400">
                Sequences must be completed within <span className="text-gray-900">500ms</span>.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-black text-[#000613]">
                <span>Type anywhere</span>
                <MoveRight size={14} />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcutsModal;
