import React, { useState } from 'react';
import Card from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import { Palette, Check, ExternalLink, Layout, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

const themes = [
    {
        id: 'MINIMALIST',
        name: 'Minimalist',
        description: 'Clean, spacious, and professional. Focuses on clarity.',
        preview: 'bg-white border-slate-200',
        accent: 'bg-indigo-600'
    },
    {
        id: 'CREATIVE',
        name: 'Creative',
        description: 'Vibrant colors and playful typography for a bold look.',
        preview: 'bg-gradient-to-br from-pink-50 to-orange-50 border-pink-100',
        accent: 'bg-pink-600'
    },
    {
        id: 'TECHNICAL',
        name: 'Technical',
        description: 'Developer-focused with monospace fonts and terminal vibes.',
        preview: 'bg-slate-900 border-slate-800',
        accent: 'bg-emerald-500'
    },
    {
        id: 'EXECUTIVE',
        name: 'Executive',
        description: 'Sophisticated dark mode with high contrast and sharp edges.',
        preview: 'bg-black border-slate-800',
        accent: 'bg-amber-400'
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
            addToast(`Portfolio theme updated to ${themeId}`, 'success');
        } catch (err) {
            addToast('Failed to update theme', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <Palette className="text-indigo-600" size={24} />
                    <div>
                        <h2 className="text-lg m-0 font-bold">Portfolio Themes</h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Customize your public presence</p>
                    </div>
                </div>
                {slug && (
                    <a 
                        href={`/portfolio/${slug}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <Eye size={14} /> Preview Profile
                    </a>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {themes.map((theme) => (
                    <motion.div
                        key={theme.id}
                        whileHover={{ y: -4 }}
                        className={`relative cursor-pointer group rounded-2xl border-2 transition-all p-4 ${
                            selectedTheme === theme.id 
                            ? 'border-indigo-600 bg-indigo-50/30' 
                            : 'border-slate-100 hover:border-slate-200 bg-white dark:bg-slate-900/50'
                        }`}
                        onClick={() => handleSave(theme.id)}
                    >
                        {/* Theme Mockup Preview */}
                        <div className={`aspect-[4/3] rounded-xl mb-4 overflow-hidden border border-slate-100 shadow-sm relative ${theme.preview}`}>
                            <div className="absolute top-2 left-2 w-1/3 h-2 bg-slate-200/50 rounded-full" />
                            <div className="absolute top-6 left-2 w-1/2 h-1 bg-slate-200/50 rounded-full" />
                            <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-lg ${theme.accent} shadow-lg`} />
                        </div>
                        
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-tighter">{theme.name}</h3>
                            {selectedTheme === theme.id && <Check size={16} className="text-indigo-600" />}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight font-medium">{theme.description}</p>

                        {selectedTheme === theme.id && (
                            <div className="absolute -top-2 -right-2 bg-indigo-600 text-white p-1 rounded-full shadow-lg">
                                <Check size={12} strokeWidth={4} />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-indigo-600">
                    <Layout size={20} />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Public Profile Link</p>
                    <p className="text-[10px] text-slate-500 font-medium">Share this link on your resume or LinkedIn</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                        /portfolio/{slug || 'username'}
                    </span>
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        className="px-3"
                        onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/portfolio/${slug}`);
                            addToast('Link copied to clipboard', 'info');
                        }}
                    >
                        Copy
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default PortfolioThemes;
