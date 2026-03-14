import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, GraduationCap, Building, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Badge from '../../components/Badge/Badge';
import { useNavigate } from 'react-router-dom';

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
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50 dark:bg-slate-900/50">
            {/* Header section with Stats */}
            <header className="mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Alumni Connect</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium italic">Learn from those who paved the way. Direct access to placed seniors.</p>
                    </div>
                    <div className="flex gap-4">
                        <Card className="px-6 py-3 bg-indigo-600 text-white border-none shadow-xl shadow-indigo-200 dark:shadow-none">
                            <div className="text-2xl font-black">{alumni.length}</div>
                            <div className="text-[10px] uppercase font-black tracking-widest opacity-80">Mentor Alumni</div>
                        </Card>
                        <Card className="px-6 py-3 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700">
                            <div className="text-2xl font-black text-slate-900 dark:text-white">{[...new Set(alumni.map(a => a.placement_details?.company_name))].length}</div>
                            <div className="text-[10px] uppercase font-black tracking-widest text-slate-500">Companies Represented</div>
                        </Card>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by name, company, or skills (e.g. 'Amazon', 'React')..." 
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-indigo-500 dark:focus:border-indigo-500 outline-none font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {branches.map(branch => (
                            <button
                                key={branch}
                                onClick={() => setSelectedBranch(branch)}
                                className={`px-6 py-4 rounded-2xl whitespace-nowrap font-bold text-sm transition-all border-2 ${
                                    selectedBranch === branch 
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-indigo-300'
                                }`}
                            >
                                {branch}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-80 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-3xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredAlumni.map((alumnus) => (
                            <motion.div
                                key={alumnus._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group"
                            >
                                <Card className="p-0 overflow-hidden h-full flex flex-col hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all duration-500 rounded-3xl group-hover:-translate-y-2 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl">
                                    {/* Company Banner */}
                                    <div className="h-24 bg-gradient-to-br from-indigo-600 to-purple-700 relative flex items-end px-6 pb-4">
                                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-lg px-2 py-1 text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                                            Class of {alumnus.graduation_year}
                                        </div>
                                        <div className="flex items-center gap-2 text-white/90">
                                            <Building size={16} />
                                            <span className="text-sm font-black whitespace-nowrap overflow-hidden text-ellipsis">
                                                {alumnus.placement_details?.company_name || 'Placed'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="px-6 pb-6 pt-12 relative flex-1 flex flex-col">
                                        {/* Avatar */}
                                        <div className="absolute -top-10 left-6 w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-900 overflow-hidden shadow-xl bg-slate-100">
                                            {alumnus.profile_image_url ? (
                                                <img src={alumnus.profile_image_url} alt={alumnus.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl font-black text-slate-300">
                                                    {alumnus.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">{alumnus.name}</h3>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                <GraduationCap size={14} />
                                                <span>{alumnus.branch}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5 mb-6">
                                            {alumnus.skills.slice(0, 3).map(skill => (
                                                <Badge key={skill} variant="secondary" className="text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors">
                                                    {skill}
                                                </Badge>
                                            ))}
                                            {alumnus.skills.length > 3 && (
                                                <span className="text-[10px] font-black text-slate-400 py-1">+{alumnus.skills.length - 3}</span>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800/50 flex gap-2">
                                            <Button 
                                                className="flex-1 font-black shadow-lg shadow-indigo-100 dark:shadow-none"
                                                onClick={() => handleInitiateChat(alumnus._id)}
                                            >
                                                <MessageSquare size={16} className="mr-2" /> Message
                                            </Button>
                                            <Button 
                                                variant="secondary" 
                                                className="aspect-square p-0 w-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 border-none hover:bg-slate-200 dark:hover:bg-slate-700"
                                                onClick={() => alumnus.public_profile_slug && navigate(`/portfolio/${alumnus.public_profile_slug}`)}
                                            >
                                                <Globe size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {!loading && filteredAlumni.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                        <Search size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">No Alumni Found</h3>
                    <p className="text-slate-500">Try adjusting your filters or search terms.</p>
                </div>
            )}
        </div>
    );
};

export default AlumniDirectory;
