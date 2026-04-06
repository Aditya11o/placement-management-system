import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Briefcase, Loader2, Linkedin, X
} from 'lucide-react';
import api from '../../api';
import { toast } from 'react-hot-toast';

const SettingsAlumniTab: React.FC = () => {
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
                toast.error('Failed to load alumni directory');
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
                requestedDate: new Date(Date.now() + 86400000 * 3), 
                query: bookingQuery
            });
            toast.success('Mentorship request sent successfully!');
            setSelectedAlumni(null);
            setBookingQuery('');
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to send request');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[40vh] space-y-4">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Scanning Alumni Network...</p>
            </div>
        );
    }

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
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Intro */}
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Alumni <span className="text-blue-600">Network</span></h2>
                <p className="text-gray-400 text-sm font-medium max-w-2xl">
                    Connect with seniors, request 1:1 sessions, and get referrals from our global alumni community.
                </p>
            </div>

            {/* Core Search */}
            <div className="relative w-full max-w-xl group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                <input 
                    type="text" 
                    placeholder="Search by name, company, or designation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 focus:border-blue-600 rounded-2xl font-bold text-[13px] text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                />
            </div>

            {/* Directory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDirectory.map((profile, i) => (
                    <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-50 flex-shrink-0">
                                <img 
                                    src={profile.user?.profilePhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400"} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-black text-gray-900 truncate">
                                    {profile.user?.name || 'Alumni Member'}
                                </h3>
                                <p className="text-[10px] font-bold text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                                    <Briefcase size={10} /> {profile.alumniDetails?.designation || 'Software Engineer'}
                                </p>
                            </div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-xl mb-4">
                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Company</p>
                            <p className="text-xs font-bold text-gray-900">{profile.alumniDetails?.company || 'Top Tech Corp'}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {(profile.alumniDetails?.expertise || ['Technical', 'HR']).slice(0, 2).map((exp: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 bg-white border border-gray-100 text-gray-500 rounded-lg text-[8px] font-black uppercase tracking-widest">
                                    {exp}
                                </span>
                            ))}
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                            <button 
                                onClick={() => setSelectedAlumni(profile)}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors"
                            >
                                Book Session
                            </button>
                            {profile.alumniDetails?.socialLinks?.linkedin && (
                                <a 
                                    href={profile.alumniDetails.socialLinks.linkedin} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                                >
                                    <Linkedin size={14} />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Mentorship Booking Modal */}
            {selectedAlumni && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSelectedAlumni(null)} />
                    <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase italic">Mentorship <span className="text-blue-600">Booking</span></h3>
                            <button onClick={() => setSelectedAlumni(null)} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-xl transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl mb-6 border border-gray-100">
                            <img src={selectedAlumni.user?.profilePhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400"} className="w-10 h-10 rounded-xl object-cover" alt="Alumni" />
                            <div>
                                <p className="text-sm font-black text-gray-900">{selectedAlumni.user?.name}</p>
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{selectedAlumni.alumniDetails?.designation} @ {selectedAlumni.alumniDetails?.company}</p>
                            </div>
                        </div>

                        <form onSubmit={handleBookMentorship} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Purpose of Session</label>
                                <textarea 
                                    required 
                                    value={bookingQuery} 
                                    onChange={e => setBookingQuery(e.target.value)} 
                                    rows={4} 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-xs focus:border-blue-500 outline-none transition-all custom-scrollbar" 
                                    placeholder="Explain your goals for this session..."
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full py-4 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50"
                            >
                                {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Request Session'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {filteredDirectory.length === 0 && (
                <div className="py-20 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                    <p className="text-sm font-black uppercase text-gray-300 italic tracking-widest">No Alumni Matching Search</p>
                </div>
            )}
        </div>
    );
};

export default SettingsAlumniTab;
