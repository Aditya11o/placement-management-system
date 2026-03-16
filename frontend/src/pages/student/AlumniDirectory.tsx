import React, { useState, useEffect } from 'react';
import { 
    Search, Globe, Zap, Users, Star, TrendingUp, 
    Award, ShieldCheck, ChevronRight, Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import AlumniSpotlightCard from './components/AlumniSpotlightCard';

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

const AlumniDirectory: React.FC = () => {
    const [alumni, setAlumni] = useState<Alumnus[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAlumni = async () => {
            try {
                const res = await api.get('/students/alumni');
                setAlumni(res.data.data);
            } catch (err) {
                console.error('Error fetching alumni:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAlumni();
    }, []);

    const branches = ['All', ...new Set(alumni.map(a => a.branch))];

    const filteredAlumni = alumni.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             a.placement_details?.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             a.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesBranch = selectedBranch === 'All' || a.branch === selectedBranch;
        return matchesSearch && matchesBranch;
    });

    const handleInitiateChat = async (alumnusId: string) => {
        try {
            const res = await api.post('/students/peer-chat/initiate', { recipientId: alumnusId });
            navigate(`/student/messages?conversation=${res.data.data._id}`);
        } catch (err) {
            console.error('Error initiating chat:', err);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20 p-4 lg:p-10 bg-slate-50 dark:bg-slate-900/10 min-h-screen">
            
            {/* Immersive Networking Hero */}
            <div className="relative rounded-[3.5rem] overflow-hidden shadow-2xl bg-slate-900 min-h-[450px] flex items-center p-8 lg:p-20">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-slate-900 to-emerald-600/20" />
                <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[140px]" />
                    <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="max-w-3xl text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em] mb-10 backdrop-blur-xl"
                        >
                            <Zap size={14} className="text-emerald-400 animate-pulse" />
                            Global Alumni Network
                        </motion.div>
                        
                        <h1 className="text-6xl lg:text-8xl font-black text-white m-0 tracking-tighter leading-[0.85] italic">
                            Mentor <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-emerald-400">Bridge.</span>
                        </h1>
                        
                        <p className="text-slate-400 text-lg lg:text-2xl mt-10 font-bold leading-relaxed max-w-xl italic">
                            Success leaves clues. Connect with placed seniors and alumni to unlock referrals, mentorship, and carrier-defining advice.
                        </p>

                        <div className="flex flex-wrap gap-8 mt-12 justify-center lg:justify-start">
                             <div className="flex flex-col">
                                  <span className="text-4xl font-black text-white">{alumni.length}</span>
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Active Mentors</span>
                             </div>
                             <div className="w-[1px] h-12 bg-slate-800 hidden lg:block" />
                             <div className="flex flex-col">
                                  <span className="text-4xl font-black text-white">{[...new Set(alumni.map(a => a.placement_details?.company_name))].length}</span>
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Top Companies</span>
                             </div>
                             <div className="w-[1px] h-12 bg-slate-800 hidden lg:block" />
                             <div className="flex flex-col">
                                  <span className="text-4xl font-black text-emerald-400">1.2k+</span>
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Connections Made</span>
                             </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex w-96 h-96 relative items-center justify-center">
                         <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full animate-[spin_60s_linear_infinite]" />
                         <div className="absolute inset-10 border-2 border-emerald-500/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                         <div className="w-64 h-64 bg-slate-800 rounded-[3rem] shadow-2xl flex items-center justify-center border border-slate-700 relative z-20 overflow-hidden group">
                              <Building size={120} className="text-indigo-500/20 group-hover:scale-110 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent flex flex-col justify-end p-8">
                                   <div className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Success Spotlight</div>
                                   <div className="text-lg font-black text-white leading-tight italic">Top FAANG Placements <br />This Season</div>
                              </div>
                         </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-12">
                     {/* Search & Branch Hub */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-slate-800 p-6 flex flex-col items-center gap-8 shadow-sm">
                        <div className="flex-1 relative w-full">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500" size={24} />
                            <input 
                                type="text" 
                                placeholder="Search by name, company (e.g. 'Senior SDE @ Google')..." 
                                className="w-full pl-16 pr-6 py-6 bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white font-black text-lg italic"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap gap-3 w-full justify-center">
                            {branches.map(branch => (
                                <button
                                    key={branch}
                                    onClick={() => setSelectedBranch(branch)}
                                    className={`px-8 py-4 rounded-[1.5rem] whitespace-nowrap font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                                        selectedBranch === branch 
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-indigo-300'
                                    }`}
                                >
                                    {branch}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Alumni Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-96 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-[3rem]" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <AnimatePresence mode="popLayout">
                                {filteredAlumni.map((alumnus) => (
                                    <AlumniSpotlightCard 
                                        key={alumnus._id}
                                        alumnus={alumnus}
                                        onMessage={handleInitiateChat}
                                        onViewProfile={(slug) => navigate(`/portfolio/${slug}`)}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {!loading && filteredAlumni.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-32 text-center bg-white dark:bg-slate-900 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800"
                        >
                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-300">
                                <Users size={48} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-3 tracking-tight italic uppercase">No Network Match</h3>
                            <p className="text-slate-500 font-bold max-w-sm mx-auto leading-relaxed italic opacity-70">
                                We couldn't find alumni matching your criteria. Try expanding your search to other branches or companies.
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* Sidebar Intelligence */}
                <div className="lg:col-span-4 sticky top-10 flex flex-col gap-10">
                    
                    {/* Professional Mentorship Card */}
                    <Card className="bg-indigo-600 text-white border-0 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={180} className="rotate-12" />
                        </div>
                        <div className="relative z-10 text-center">
                             <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-10 mx-auto">
                                <Award size={28} className="text-emerald-400" />
                            </div>
                            <h3 className="text-3xl font-black mb-4 italic uppercase tracking-tight leading-tight">Elite <br />Mentorship.</h3>
                            <p className="text-indigo-100/70 text-sm leading-relaxed mb-10 font-bold italic">
                                Placed seniors are your fastest route to referral. Connect with verified alumni to get an inside edge.
                            </p>
                            <Button 
                                variant="primary" 
                                className="bg-white text-indigo-900 hover:bg-slate-900 hover:text-white border-0 font-black w-full h-16 rounded-[1.5rem] uppercase tracking-widest italic transition-all shadow-xl"
                            >
                                Apply for Referral
                            </Button>
                        </div>
                    </Card>

                    {/* Networking Protocol */}
                    <Card className="p-10 border-slate-200/60 dark:border-slate-800 rounded-[3.5rem] bg-white dark:bg-slate-900">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-4 italic font-black">
                            <ShieldCheck size={20} className="text-indigo-500" /> Interaction Protocol
                        </h4>
                        <div className="space-y-10">
                            {[
                                { title: 'Be Precise', desc: 'State your purpose clearly in the first message.', icon: Zap },
                                { title: 'Respect Time', desc: 'Alumni are busy professionals. Acknowledge delays.', icon: Globe },
                                { title: 'No Spamming', desc: 'Do not mass-message for referrals.', icon: ShieldCheck }
                            ].map((rule, i) => (
                                <div key={i} className="flex gap-6 group">
                                    <div className="w-12 h-12 rounded-[1.2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-indigo-500 border border-slate-100 dark:border-slate-700 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <rule.icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-black text-slate-800 dark:text-white italic uppercase">{rule.title}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 opacity-80">{rule.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Success Marquee (Mock Highlight) */}
                    <div className="p-8 bg-emerald-50/30 dark:bg-emerald-500/5 rounded-[3.5rem] border border-emerald-100 dark:border-emerald-500/10">
                         <h4 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em] mb-8 italic flex items-center gap-3">
                              <Star size={14} className="fill-emerald-400" /> Recent Success
                         </h4>
                         <div className="space-y-6">
                              {[
                                   { name: 'Rohan Sharma', company: 'Google', role: 'SDE II' },
                                   { name: 'Sneha Kapur', company: 'Atlassian', role: 'Product Manager' },
                                   { name: 'Amit Jain', company: 'Microsoft', role: 'Data Scientist' }
                              ].map((item, i) => (
                                   <div key={i} className="flex items-center justify-between group cursor-default">
                                        <div className="flex flex-col">
                                             <span className="text-sm font-black text-slate-800 dark:text-white italic group-hover:text-indigo-600 transition-colors uppercase">{item.name}</span>
                                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.role} @ {item.company}</span>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-all" />
                                   </div>
                              ))}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlumniDirectory;
