import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { 
    User, Briefcase, Code, Award, ExternalLink, 
    Mail, Star, ShieldCheck, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import SkeletonProfileForm from '../../components/Skeleton/SkeletonProfileForm';

const PublicPortfolio: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();

    const { data: student, isLoading, error } = useQuery({
        queryKey: ['publicPortfolio', slug],
        queryFn: async () => {
            const res = await api.get(`/public/portfolio/${slug}`);
            return res.data.data;
        },
    });

    if (isLoading) return <div className="min-h-screen bg-slate-50 p-8"><SkeletonProfileForm /></div>;
    if (error || !student) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <h1 className="text-4xl font-black text-slate-900 mb-2">404</h1>
                <p className="text-slate-500 mb-6 text-lg">Portfolio Not Found or Private</p>
                <Link to="/">
                    <Button variant="primary">Return Home</Button>
                </Link>
            </div>
        );
    }

    const theme = student.portfolio_theme || 'MINIMALIST';

    const themeStyles: Record<string, { bg: string, card: string, text: string, accent: string, heading: string }> = {
        MINIMALIST: {
            bg: 'bg-[#F8FAFC]',
            card: 'bg-white border-slate-100 shadow-sm',
            text: 'text-slate-600',
            accent: 'text-indigo-600',
            heading: 'font-black tracking-tight text-slate-900'
        },
        CREATIVE: {
            bg: 'bg-gradient-to-br from-pink-50 via-white to-indigo-50',
            card: 'bg-white/80 backdrop-blur-md border-pink-100 shadow-xl shadow-pink-100/20 rounded-[2rem]',
            text: 'text-slate-600',
            accent: 'text-pink-600',
            heading: 'font-black tracking-tighter text-slate-900 italic'
        },
        TECHNICAL: {
            bg: 'bg-slate-950',
            card: 'bg-slate-900 border-emerald-500/20 shadow-none rounded-none border-l-4',
            text: 'text-emerald-500/80 font-mono',
            accent: 'text-emerald-400',
            heading: 'font-mono uppercase tracking-widest text-emerald-500'
        },
        EXECUTIVE: {
            bg: 'bg-[#0F172A]',
            card: 'bg-slate-900/50 border-slate-800 shadow-2xl rounded-none',
            text: 'text-slate-400',
            accent: 'text-amber-400',
            heading: 'font-serif text-white'
        }
    };

    const s = themeStyles[theme];

    return (
        <div className={`min-h-screen ${s.bg} selection:bg-indigo-100 pb-20 ${theme === 'TECHNICAL' ? 'font-mono' : ''}`}>
            {/* Hero Section */}
            <div className={`relative h-[350px] w-full overflow-hidden ${
                theme === 'TECHNICAL' ? 'bg-slate-900 border-b-2 border-emerald-500/30' : 
                theme === 'CREATIVE' ? 'bg-gradient-to-r from-pink-500 to-indigo-600' :
                theme === 'EXECUTIVE' ? 'bg-black' :
                'bg-gradient-to-r from-slate-900 to-indigo-900'
            }`}>
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(99,102,241,0.2),_transparent_50%)]" />
                </div>
                
                <div className="max-w-6xl mx-auto px-6 h-full flex flex-col justify-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row items-center gap-8"
                    >
                        <div className={`w-44 h-44 rounded-3xl border-4 overflow-hidden shadow-2xl ${
                            theme === 'TECHNICAL' ? 'border-emerald-500 bg-black' : 'border-white bg-white'
                        }`}>
                            {student.profile_image_url ? (
                                <img src={student.profile_image_url} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                    <User size={64} className="text-slate-300" />
                                </div>
                            )}
                        </div>
                        <div className={`text-center md:text-left ${theme === 'CREATIVE' || theme === 'MINIMALIST' || theme === 'EXECUTIVE' || theme === 'TECHNICAL' ? 'text-white' : 'text-white'}`}>
                            <h1 className={`text-4xl md:text-6xl ${s.heading} mb-2`}>{student.name}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 opacity-90">
                                <span className={`flex items-center gap-1.5 font-bold uppercase tracking-widest text-xs ${theme === 'TECHNICAL' ? 'text-emerald-400' : 'text-indigo-100'}`}>
                                    <Briefcase size={14} /> {student.branch} student
                                </span>
                                <span className="w-1 h-1 rounded-full bg-white/30" />
                                <span className={`flex items-center gap-1.5 font-bold uppercase tracking-widest text-xs ${theme === 'TECHNICAL' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    <Star size={14} /> {student.cgpa} CGPA
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Status Card */}
                        <Card className={`${s.card}`}>
                            <h3 className={`text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${s.heading}`}>
                                <Zap size={16} className={s.accent} /> Professional Status
                            </h3>
                            <div className="space-y-4">
                                <div className={`flex items-center justify-between p-3 rounded-xl border ${
                                    theme === 'TECHNICAL' ? 'bg-black border-emerald-500/20' : 'bg-slate-50 border-slate-100'
                                }`}>
                                    <span className="text-xs font-bold text-slate-500 uppercase">Eligibility</span>
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                                        theme === 'TECHNICAL' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                                    }`}>Placement Ready</span>
                                </div>
                                <Button 
                                    isFullWidth 
                                    className={`${theme === 'TECHNICAL' ? 'bg-emerald-600 hover:bg-emerald-700 rounded-none' : ''}`}
                                >
                                    Contact Me
                                </Button>
                            </div>
                        </Card>

                        {/* Top Skills */}
                        <Card className={s.card}>
                            <h3 className={`text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${s.heading}`}>
                                <Code size={16} className={s.accent} /> Core Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {student.skills.map((skill: string, idx: number) => (
                                    <span key={idx} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                        theme === 'TECHNICAL' ? 'bg-black border-emerald-500/20 text-emerald-400' : 
                                        theme === 'CREATIVE' ? 'bg-pink-50 border-pink-100 text-pink-600' :
                                        'bg-slate-50 border-slate-100 text-slate-700'
                                    }`}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </Card>

                        {/* Achievements */}
                        {student.gamification?.badges?.length > 0 && (
                            <Card className={s.card}>
                                <h3 className={`text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${s.heading}`}>
                                    <Award size={16} className={s.accent} /> Achievements
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {student.gamification.badges.map((badge: any, idx: number) => (
                                        <div key={idx} className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            theme === 'TECHNICAL' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-50 text-indigo-600'
                                        }`} title={badge.type}>
                                            <ShieldCheck size={20} />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Projects */}
                        <section>
                            <h2 className={`text-xl font-black mb-6 flex items-center gap-3 ${s.heading}`}>
                                <div className={`p-2 rounded-lg ${theme === 'TECHNICAL' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-100 text-indigo-600'}`}>
                                    <Code size={20} />
                                </div>
                                Featured Projects
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {student.projects?.map((item: any, idx: number) => (
                                    <motion.div 
                                        key={idx}
                                        whileHover={{ y: -5 }}
                                        className={`p-6 border transition-all ${s.card}`}
                                    >
                                        <h3 className={`text-lg font-black mb-2 ${s.heading}`}>{item.title}</h3>
                                        <p className={`text-sm leading-relaxed mb-4 ${s.text}`}>{item.description}</p>
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {item.technologies?.map((tech: string, tIdx: number) => (
                                                <span key={tIdx} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                                    theme === 'TECHNICAL' ? 'bg-black border-emerald-500/20 text-emerald-500' : 'bg-slate-50 border-slate-100 text-slate-500'
                                                }`}>{tech}</span>
                                            ))}
                                        </div>
                                        {item.link && (
                                            <a href={item.link} target="_blank" rel="noreferrer" className={`text-xs font-black flex items-center gap-1 uppercase tracking-widest transition-colors ${s.accent}`}>
                                                View Live <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        {/* Experience */}
                        <section>
                            <h2 className={`text-xl font-black mb-6 flex items-center gap-3 ${s.heading}`}>
                                <div className={`p-2 rounded-lg ${theme === 'TECHNICAL' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-100 text-emerald-600'}`}>
                                    <Briefcase size={20} />
                                </div>
                                Industry Experience
                            </h2>
                            <div className="space-y-6">
                                {student.internships?.map((item: any, idx: number) => (
                                    <div key={idx} className={`relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 ${
                                        theme === 'TECHNICAL' ? 'before:bg-emerald-500/30' : 'before:bg-emerald-100'
                                    }`}>
                                        <div className={`absolute left-[-4px] top-2 w-2.5 h-2.5 rounded-full border-4 shadow-lg ${
                                            theme === 'TECHNICAL' ? 'bg-emerald-500 border-black' : 'bg-emerald-500 border-white'
                                        }`} />
                                        <div className={`p-6 border ${s.card}`}>
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                                                <div>
                                                    <h3 className={`text-lg font-black m-0 ${s.heading}`}>{item.role}</h3>
                                                    <p className={`text-sm font-bold m-0 tracking-tight ${s.accent}`}>@ {item.company}</p>
                                                </div>
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest shrink-0">{item.duration || 'Summer Intern'}</span>
                                            </div>
                                            <p className={`text-sm leading-relaxed m-0 ${s.text}`}>{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicPortfolio;
