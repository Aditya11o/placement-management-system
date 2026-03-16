import React, { memo } from 'react';
import { 
    MessageSquare, 
    GraduationCap, 
    ArrowRight,
    Briefcase,
    Zap,
    ExternalLink
} from 'lucide-react';
import Card from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import Badge from '../../../components/Badge/Badge';
import { motion } from 'framer-motion';

interface Alumnus {
    _id: string;
    name: string;
    profile_image_url: string;
    branch: string;
    graduation_year: number;
    skills: string[];
    placement_details?: {
        company_name: string;
        package_lpa: number;
        placed_at: string;
    };
    public_profile_slug?: string;
}

interface AlumniSpotlightCardProps {
    alumnus: Alumnus;
    onMessage: (id: string) => void;
    onViewProfile: (slug: string) => void;
}

const AlumniSpotlightCard: React.FC<AlumniSpotlightCardProps> = memo(({ 
    alumnus, 
    onMessage, 
    onViewProfile 
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full"
        >
            <Card className="p-0 overflow-hidden h-full flex flex-col bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[3rem] group">
                {/* Visual Backdrop & Company Branding */}
                <div className="h-32 bg-indigo-950 relative flex items-center px-8 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/60 via-indigo-950 to-purple-600/40" />
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity" />
                    
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                            {alumnus.placement_details?.company_name || 'Alumnus'}
                        </div>
                    </div>

                    <div className="absolute top-6 right-8">
                         <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] italic group-hover:text-white/60 transition-colors">
                            Class of {alumnus.graduation_year}
                         </div>
                    </div>
                </div>

                <div className="px-8 pb-8 pt-16 relative flex-1 flex flex-col">
                    {/* Floating Avatar with Neon Ring */}
                    <div className="absolute -top-12 left-8 w-24 h-24 rounded-[2rem] border-4 border-white dark:border-slate-900 overflow-hidden shadow-2xl bg-white dark:bg-slate-800 group-hover:scale-105 transition-transform duration-500">
                        {alumnus.profile_image_url ? (
                            <img src={alumnus.profile_image_url} alt={alumnus.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-200 dark:text-slate-700 bg-slate-50 dark:bg-slate-800">
                                {alumnus.name.charAt(0)}
                            </div>
                        )}
                        {/* Live Status Indicator - Mocking "Available for Referral" */}
                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center">
                             <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        </div>
                    </div>

                    {/* Profile Identity */}
                    <div className="mb-6">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight tracking-tight italic group-hover:text-indigo-600 transition-colors">
                            {alumnus.name}
                        </h3>
                        <div className="flex flex-col gap-2">
                             <div className="flex items-center gap-2 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                 <Briefcase size={14} className="text-indigo-500" /> 
                                 {alumnus.placement_details?.company_name || 'Senior Associate'}
                             </div>
                             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">
                                 <GraduationCap size={14} className="opacity-50" /> {alumnus.branch}
                             </div>
                        </div>
                    </div>

                    {/* Expertise Pills */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {alumnus.skills.slice(0, 3).map(skill => (
                            <Badge 
                                key={skill} 
                                variant="secondary" 
                                className="text-[9px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-none px-3 py-1.5 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"
                            >
                                {skill}
                            </Badge>
                        ))}
                        {alumnus.skills.length > 3 && (
                            <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 self-center tracking-widest">+ {alumnus.skills.length - 3}</span>
                        )}
                    </div>

                    {/* Quick Referral Tag */}
                    <div className="mb-8 p-4 rounded-3xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-500/10 flex items-center justify-between group/referral">
                         <div className="flex items-center gap-3">
                              <Zap size={16} className="text-emerald-500" />
                              <span className="text-[10px] font-black text-emerald-600/80 uppercase tracking-widest italic">Open for Referrals</span>
                         </div>
                         <ArrowRight size={14} className="text-emerald-400 opacity-0 group-hover/referral:opacity-100 transform translate-x-1 group-hover/referral:translate-x-0 transition-all" />
                    </div>

                    {/* Action Hub */}
                    <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                        <Button 
                            className="flex-1 rounded-2xl h-14 font-black uppercase tracking-[0.15em] text-xs bg-slate-900 hover:bg-indigo-600 text-white border-none shadow-xl shadow-slate-200 dark:shadow-none group/msg transition-all active:scale-95"
                            onClick={() => onMessage(alumnus._id)}
                        >
                            <MessageSquare size={16} className="mr-3 group-hover/msg:rotate-12 transition-transform" strokeWidth={3} /> Connect
                        </Button>
                        <Button 
                            variant="secondary" 
                            className="w-14 h-14 rounded-2xl p-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800 border-none hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                            onClick={() => alumnus.public_profile_slug && onViewProfile(alumnus.public_profile_slug)}
                        >
                            <ExternalLink size={20} strokeWidth={2.5} />
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
});

AlumniSpotlightCard.displayName = 'AlumniSpotlightCard';

export default AlumniSpotlightCard;
