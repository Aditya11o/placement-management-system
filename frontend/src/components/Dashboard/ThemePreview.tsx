import { motion } from 'framer-motion';
import { Users, TrendingUp, Zap, Building } from 'lucide-react';

interface ThemePreviewProps {
    primaryColor: string;
    meshColors: string[];
}

const ThemePreview = ({ primaryColor, meshColors }: ThemePreviewProps) => {
    return (
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-950">
            {/* Mesh Gradient Background Mock */}
            <div 
                className="absolute inset-0 opacity-20 dark:opacity-40 blur-[80px]"
                style={{
                    background: `
                        radial-gradient(at 0% 0%, ${meshColors[0] || primaryColor} 0px, transparent 50%),
                        radial-gradient(at 100% 0%, ${meshColors[1] || primaryColor} 0px, transparent 50%),
                        radial-gradient(at 100% 100%, ${meshColors[2] || primaryColor} 0px, transparent 50%),
                        radial-gradient(at 0% 100%, ${meshColors[3] || primaryColor} 0px, transparent 50%)
                    `
                }}
            />

            <div className="relative z-10 p-6 h-full flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div 
                            className="w-8 h-8 rounded-lg shadow-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <Zap size={16} />
                        </div>
                        <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-6 w-12 rounded-full bg-slate-100 dark:bg-slate-800" />
                        <div className="h-6 w-12 rounded-full bg-slate-100 dark:bg-slate-800" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <Users size={16} style={{ color: primaryColor }} />
                            <TrendingUp size={14} className="text-emerald-500" />
                        </div>
                        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded mb-1" />
                        <div className="h-3 w-10 bg-slate-100 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <Building size={16} style={{ color: primaryColor }} />
                            <Zap size={14} className="text-amber-500" />
                        </div>
                        <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded mb-1" />
                        <div className="h-3 w-14 bg-slate-100 dark:bg-slate-800 rounded" />
                    </div>
                </div>

                <div className="mt-auto flex flex-col gap-2">
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full rounded-full"
                            style={{ backgroundColor: primaryColor }}
                            initial={{ width: 0 }}
                            animate={{ width: '70%' }}
                            transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                        />
                    </div>
                    <div className="flex justify-between">
                        <div className="h-2 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
                        <div className="h-2 w-8 bg-slate-100 dark:bg-slate-800 rounded" />
                    </div>
                </div>

                {/* Pulsing Primary Color Circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
                    <motion.div 
                        className="w-32 h-32 rounded-full filter blur-2xl"
                        style={{ backgroundColor: primaryColor }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                </div>
            </div>
            
            <div className="absolute bottom-4 right-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 pointer-events-none">
                Live Preview
            </div>
        </div>
    );
};

export default ThemePreview;
