import React from 'react';
import { X, Building2, Globe, Cpu, Gift, Camera, CheckCircle } from 'lucide-react';
import Button from '../Button/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface CompanyProfilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        company_name: string;
        website?: string;
        description?: string;
        banner_image_url?: string;
        profile_image_url?: string;
        tech_stack?: string[];
        perks?: string[];
        culture_photos?: string[];
    };
}

const CompanyProfilePreviewModal: React.FC<CompanyProfilePreviewModalProps> = ({
    isOpen,
    onClose,
    data
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl border border-white/20 flex flex-col"
                    >
                        {/* Header with Close Button */}
                        <div className="absolute top-6 right-6 z-50">
                            <button
                                onClick={onClose}
                                className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-xl transition-colors border border-white/10"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Scrollable Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pb-12">

                            {/* Hero Section */}
                            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                                {data.banner_image_url ? (
                                    <img src={data.banner_image_url} alt="Banner" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 animate-gradient-x" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                                {/* Logo & Basic Info */}
                                <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col md:flex-row items-end gap-6">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white p-1 shadow-2xl overflow-hidden ring-4 ring-white/10 shrink-0">
                                        {data.profile_image_url ? (
                                            <img src={data.profile_image_url} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            <div className="w-full h-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-4xl font-black rounded-xl uppercase">
                                                {data.company_name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-white mb-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{data.company_name || 'Company Name'}</h1>
                                            <CheckCircle size={20} className="text-blue-400 fill-blue-400/20" />
                                        </div>
                                        {data.website && (
                                            <a
                                                href={data.website.startsWith('http') ? data.website : `https://${data.website}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-white/70 hover:text-white flex items-center gap-1.5 text-sm font-medium transition-colors"
                                            >
                                                <Globe size={14} /> {data.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Grid */}
                            <div className="px-8 pt-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">

                                {/* Left Column: Bio & Culture */}
                                <div className="space-y-12">
                                    <section>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                                <Building2 size={20} />
                                            </div>
                                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">About the Company</h2>
                                        </div>
                                        <div
                                            className="prose prose-slate prose-indigo dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed text-lg"
                                            dangerouslySetInnerHTML={{ __html: data.description || '<p>No description provided yet.</p>' }}
                                        />
                                    </section>

                                    {/* Culture Gallery */}
                                    {data.culture_photos && data.culture_photos.length > 0 && (
                                        <section>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                                    <Camera size={20} />
                                                </div>
                                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Life at {data.company_name}</h2>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                {data.culture_photos.map((photo, i) => (
                                                    <div key={i} className="aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm group">
                                                        <img
                                                            src={photo}
                                                            alt="Culture"
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>

                                {/* Right Column: Tags & Info */}
                                <div className="space-y-8">

                                    {/* Tech Stack */}
                                    <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-2xl">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Cpu size={18} className="text-indigo-500" />
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Tech Stack</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {data.tech_stack?.map((tech, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 text-[13px] font-bold text-indigo-600 dark:text-indigo-400 rounded-lg shadow-sm">
                                                    {tech}
                                                </span>
                                            )) || <span className="text-xs text-slate-400">No tech stack listed</span>}
                                        </div>
                                    </div>

                                    {/* Perks */}
                                    <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Gift size={18} className="text-purple-500" />
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Perks & Benefits</h3>
                                        </div>
                                        <ul className="space-y-3">
                                            {data.perks?.map((perk, i) => (
                                                <li key={i} className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                                                    {perk}
                                                </li>
                                            )) || <span className="text-xs text-slate-400">No perks listed</span>}
                                        </ul>
                                    </div>

                                    {/* CTA Helper */}
                                    <div className="text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                                        <p className="text-xs font-medium text-slate-500 mb-4 italic">
                                            Students will see your active job postings right below this section on the public board.
                                        </p>
                                        <Button variant="ghost" size="sm" isFullWidth disabled>
                                            Apply to Current Openings
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Notification */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                Profile Preview Mode
                            </span>
                            <Button size="sm" onClick={onClose}>Close Preview</Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CompanyProfilePreviewModal;
