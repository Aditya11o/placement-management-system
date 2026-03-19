import React, { useState } from 'react';
import Card from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import { Palette, Check, ExternalLink, Layout, Eye, Copy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

const themes = [
    {
        id: 'MINIMALIST',
        name: 'Essentialist',
        description: 'Clean, spacious, and focused on narrative clarity.',
        preview: 'bg-white border-slate-200',
        accent: 'bg-indigo-600',
        gradient: 'from-slate-50 to-white'
    },
    {
        id: 'CREATIVE',
        name: 'Visionary',
        description: 'Vibrant gradients and bold type for expressive souls.',
        preview: 'bg-gradient-to-br from-pink-50 to-orange-50 border-pink-100',
        accent: 'bg-pink-600',
        gradient: 'from-pink-500 to-orange-500'
    },
    {
        id: 'TECHNICAL',
        name: 'Logic Terminal',
        description: 'Code-first aesthetic with monospace precision.',
        preview: 'bg-slate-900 border-slate-800',
        accent: 'bg-emerald-500',
        gradient: 'from-slate-800 to-black'
    },
    {
        id: 'EXECUTIVE',
        name: 'Legacy Dark',
        description: 'High-contrast, sharp, and authoritative dark mode.',
        preview: 'bg-black border-slate-800',
        accent: 'bg-amber-400',
        gradient: 'from-indigo-900 to-black'
    }
];

interface PortfolioThemesProps {
    currentTheme: string;
    slug?: string;
}

const PortfolioThemes: React.FC<PortfolioThemesProps> = ({ currentTheme, slug }) => {
    const [selectedTheme, setSelectedTheme] = useState(currentTheme);
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();

    const handleSave = async (themeId: string) => {
        setIsSaving(true);
        try {
            await api.put('/students/portfolio-theme', { theme: themeId });
            setSelectedTheme(themeId);
            addToast(`Identity theme updated to ${themeId}`, 'success');
        } catch (err) {
            addToast('Theme sync failed', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="col-span-1 lg:col-span-2 p-10 rounded-[3.5rem] border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 group">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <Palette className="text-indigo-600" size={24} />
                    <h2 className="text-2xl m-0 font-black italic tracking-tight uppercase">Strategy <br />Themes.</h2>
                </div>
                {slug && (
                    <a 
                        href={`/portfolio/${slug}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 italic"
                    >
                        <Eye size={16} /> Live Profile
                    </a>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {themes.map((theme) => (
                    <motion.div
                        key={theme.id}
                        whileHover={{ y: -8 }}
                        className={`relative cursor-pointer group rounded-[2.5rem] border-2 transition-all p-6 ${
                            selectedTheme === theme.id 
                            ? 'border-indigo-600 bg-indigo-50/10' 
                            : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300'
                        }`}
                        onClick={() => handleSave(theme.id)}
                    >
                        {/* Theme Mockup Preview */}
                        <div className={`aspect-[4/5] rounded-[2rem] mb-6 overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl relative ${theme.preview}`}>
                            <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${theme.gradient}`} />
                            <div className="absolute top-4 left-4 w-1/2 h-3 bg-slate-200/50 dark:bg-slate-700 rounded-full" />
                            <div className="absolute top-10 left-4 w-3/4 h-2 bg-slate-100/50 dark:bg-slate-800 rounded-full" />
                            <div className="absolute bottom-4 right-4 w-10 h-10 rounded-2xl bg-indigo-600 shadow-2xl flex items-center justify-center text-white">
                                 <Zap size={16} />
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-tighter italic">{theme.name}</h3>
                            {selectedTheme === theme.id && <Check size={18} className="text-indigo-600" />}
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold italic leading-tight">{theme.description}</p>

                        {selectedTheme === theme.id && (
                            <motion.div 
                                layoutId="active-theme"
                                className="absolute -top-3 -right-3 bg-indigo-600 text-white w-8 h-8 rounded-2xl shadow-xl flex items-center justify-center border-4 border-white dark:border-slate-900"
                            >
                                <Check size={14} strokeWidth={4} />
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
                <div className="relative z-10 w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center shadow-2xl">
                    <Layout size={32} />
                </div>
                <div className="flex-1 relative z-10 text-center md:text-left">
                    <h4 className="text-xl font-black italic uppercase tracking-tight m-0">Public Identity Protocol</h4>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2 italic">Global URL: /portfolio/{slug || 'candidate'}</p>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <button 
                        className="h-14 px-8 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all border border-white/20 active:scale-95 flex items-center gap-3"
                        onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/portfolio/${slug}`);
                            addToast('Shareable link copied!', 'success');
                        }}
                    >
                        <Copy size={16} /> Copy URL
                    </button>
                    <Button 
                        variant="primary" 
                        className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest italic shadow-xl shadow-indigo-500/20"
                        onClick={() => window.open(`/portfolio/${slug}`, '_blank')}
                    >
                        Launch
                    </Button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32" />
            </div>
        </Card>
    );
};

export default PortfolioThemes;
