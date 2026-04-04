import React, { useState, useEffect } from 'react';
import { 
  Users, Search, 
  Briefcase, Loader2, Linkedin, X
} from 'lucide-react';
import api from '../../api';
import DashboardSkeleton from '../../components/skeletons/DashboardSkeleton';
import { useNotification } from '../../context/NotificationContext';

const AlumniDirectory: React.FC = () => {
    const { showSuccess, showError } = useNotification();
    const [directory, setDirectory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedAlumni, setSelectedAlumni] = useState<any | null>(null);
    const [bookingQuery, setBookingQuery] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchDirectory = async () => {
            try {
                setLoading(true);
                const { data } = await api.get('/alumni/directory');
                setDirectory(data);
            } catch (err) {
                console.error(err);
                showError('Failed to load alumni directory');
            } finally {
                setLoading(false);
            }
        };
        fetchDirectory();
    }, []);

    const handleBookMentorship = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAlumni) return;

        try {
            setSubmitting(true);
            await api.post('/alumni/mentorship/request', {
                alumniId: selectedAlumni.user._id,
                requestedDate: new Date(Date.now() + 86400000 * 3), // +3 days as default for now
                query: bookingQuery
            });
            showSuccess('Mentorship request sent successfully!');
            setSelectedAlumni(null);
            setBookingQuery('');
        } catch (error: any) {
            console.error(error);
            showError(error.response?.data?.message || 'Failed to send request');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <DashboardSkeleton />;

    const filteredDirectory = directory.filter(profile => {
        const name = profile.user?.name || '';
        const company = profile.alumniDetails?.company || '';
        const role = profile.alumniDetails?.designation || '';
        const search = searchTerm.toLowerCase();
        return name.toLowerCase().includes(search) || 
               company.toLowerCase().includes(search) || 
               role.toLowerCase().includes(search);
    });

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-8">
                <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] italic">
                        <Users size={14} /> Network
                    </div>
                    <h1 className="text-4xl font-black text-[#000613] tracking-tight uppercase italic">
                        Alumni <span className="opacity-40">Directory</span>
                    </h1>
                    <p className="text-gray-400 text-sm font-medium">
                        Connect with graduated seniors. Request 1:1 mentorship sessions, ask for referrals, and expand your professional network.
                    </p>
                </div>
            </div>

            {/* Core Search */}
            <div className="relative w-full max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search by name, company, or designation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-white border border-gray-100 focus:border-blue-600 rounded-2xl font-bold text-[13px] text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                />
            </div>

            {/* Directory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDirectory.map((profile, i) => (
                    <div key={i} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group flex flex-col">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-gray-50 flex-shrink-0">
                                <img 
                                    src={profile.user?.profilePhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400"} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="pt-1">
                                <h3 className="text-lg font-black text-gray-900 leading-tight">
                                    {profile.user?.name || 'Alumni Member'}
                                </h3>
                                <p className="text-[11px] font-bold text-gray-400 mt-1 flex items-center gap-1.5">
                                    <Briefcase size={12} /> {profile.alumniDetails?.designation || 'Software Engineer'}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-2xl mb-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Company</p>
                            <p className="text-sm font-bold text-gray-900">{profile.alumniDetails?.company || 'Top Tech Corp'}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {(profile.alumniDetails?.expertise || ['Technical', 'HR']).map((exp: string, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-white border border-gray-200 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                    {exp}
                                </span>
                            ))}
                        </div>

                        <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                            <button 
                                onClick={() => setSelectedAlumni(profile)}
                                className="px-6 py-2.5 bg-[#000613] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors"
                            >
                                Book Session
                            </button>
                            {profile.alumniDetails?.socialLinks?.linkedin && (
                                <a 
                                    href={profile.alumniDetails.socialLinks.linkedin} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-colors text-lg"
                                >
                                    <Linkedin size={18} />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Mentorship Booking Modal */}
            {selectedAlumni && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#000613]/40 backdrop-blur-sm" onClick={() => setSelectedAlumni(null)} />
                    <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Request Mentorship</h3>
                            <button onClick={() => setSelectedAlumni(null)} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl mb-6">
                            <img src={selectedAlumni.user?.profilePhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400"} className="w-12 h-12 rounded-xl object-cover" alt="Alumni" />
                            <div>
                                <p className="text-sm font-black text-gray-900">{selectedAlumni.user?.name}</p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{selectedAlumni.alumniDetails?.designation} @ {selectedAlumni.alumniDetails?.company}</p>
                            </div>
                        </div>

                        <form onSubmit={handleBookMentorship} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">What would you like to discuss?</label>
                                <textarea 
                                    required 
                                    value={bookingQuery} 
                                    onChange={e => setBookingQuery(e.target.value)} 
                                    rows={4} 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:border-blue-500 outline-none transition-all custom-scrollbar" 
                                    placeholder="Explain your goals for this session..."
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full py-4 bg-[#000613] text-white rounded-xl font-black text-[11px] uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Send Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {filteredDirectory.length === 0 && (
                <div className="py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                    <p className="text-lg font-black uppercase text-gray-300 italic tracking-widest">No Alumni Found</p>
                </div>
            )}
        </div>
    );
};

export default AlumniDirectory;
