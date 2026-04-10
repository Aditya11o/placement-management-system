import React, { useState, useEffect } from 'react';
import { 
    Users, Search, Filter, BookOpen, Calendar, 
    MessageSquare, CheckCircle2, Video, Star, 
    Clock, ChevronRight, Loader2, ShieldCheck, X
} from 'lucide-react';
import api from '../../api';
import { toast } from 'react-hot-toast';
import MentorshipFeedbackModal from '../../components/student/MentorshipFeedbackModal';

const Mentorship: React.FC = () => {
    const [mentors, setMentors] = useState<any[]>([]);
    const [myBookings, setMyBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMentor, setSelectedMentor] = useState<any>(null);
    const [availability, setAvailability] = useState<any[]>([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [bookingNote, setBookingNote] = useState('');
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [isBooking, setIsBooking] = useState(false);
    
    const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean, bookingId: string }>({
        isOpen: false,
        bookingId: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [mentorsRes, bookingsRes] = await Promise.all([
                api.get('/alumni/directory'),
                api.get('/alumni/mentorship/requests')
            ]);
            setMentors(mentorsRes.data);
            setMyBookings(bookingsRes.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load mentorship data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchAvailability = async (mentorId: string) => {
        try {
            setLoadingAvailability(true);
            const { data } = await api.get(`/alumni/mentorship/availability/${mentorId}`);
            setAvailability(data);
        } catch (err) {
            toast.error('Failed to load mentor availability');
        } finally {
            setLoadingAvailability(false);
        }
    };

    const handleOpenBooking = (mentor: any) => {
        setSelectedMentor(mentor);
        setSelectedSlotId(null);
        setBookingNote('');
        fetchAvailability(mentor.id);
    };

    const handleConfirmBooking = async () => {
        if (!selectedMentor || !selectedSlotId) return;
        
        try {
            setIsBooking(true);
            await api.post('/alumni/mentorship/request', {
                alumniId: selectedMentor.id,
                availabilityId: selectedSlotId,
                query: bookingNote
            });
            toast.success('Booking request sent!');
            setSelectedMentor(null);
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to book session');
        } finally {
            setIsBooking(false);
        }
    };

    const filteredMentors = mentors.filter(m => 
        m.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.expertise?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.currentCompany?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && mentors.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-12 animate-in fade-in duration-700">
            {/* Header section */}
            <div className="bg-[#000613] text-white rounded-[40px] p-12 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full -mr-40 -mt-40" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                     <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-[10px] font-black uppercase tracking-widest">
                            <Users size={14} /> Career Mentorship Program
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter leading-[1.1]">Bridge the <br/><span className="text-blue-400">Experience Gap.</span></h1>
                        <p className="text-gray-400 text-lg font-medium max-w-xl leading-relaxed">
                            Connect with alumni from top companies. Get personalized guidance, resume reviews, and industry insights to accelerate your career.
                        </p>
                     </div>
                     <div className="hidden lg:block">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                                <h4 className="text-2xl font-black text-white">{mentors.length}</h4>
                                <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Active Mentors</p>
                            </div>
                             <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                                <h4 className="text-2xl font-black text-white">{myBookings.length}</h4>
                                <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">My Sessions</p>
                            </div>
                        </div>
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Mentor Directory */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase italic">
                            Available <span className="text-blue-600">Mentors</span>
                        </h2>
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                            <input 
                                type="text"
                                placeholder="Search by name, company, or expertise..."
                                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:border-blue-600 shadow-sm transition-all"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredMentors.map((mentor) => (
                            <div key={mentor.id} className="group bg-white border border-gray-100 rounded-[2.5rem] p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-[20px] overflow-hidden border-2 border-white shadow-md relative">
                                        <img src={mentor.user?.profilePhoto || "https://images.unsplash.com/photo-1540569014015-19a7ee504e3a?q=80&w=400"} className="w-full h-full object-cover" alt="Mentor" />
                                        <div className="absolute top-1 right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900">{mentor.user?.name}</h3>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{mentor.currentPosition || 'Industry Professional'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4 mb-6">
                                    <div className="flex flex-wrap gap-2">
                                        {(mentor.expertise?.split(',') || ['Career Guidance', 'Mock Interviews']).map((tag: string) => (
                                            <span key={tag} className="px-3 py-1 bg-gray-50 text-[9px] font-black text-gray-500 rounded-lg uppercase tracking-wider">{tag.trim()}</span>
                                        ))}
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 line-clamp-2 italic leading-relaxed">
                                        "{mentor.bio || 'Passionate about helping students navigate their career paths and master technical interviews.'}"
                                    </p>
                                </div>
                                <button 
                                    onClick={() => handleOpenBooking(mentor)}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <BookOpen size={14} /> Book a Session
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* My Bookings Sidebar */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase italic">
                        My <span className="text-blue-600">Sessions</span>
                    </h2>
                    
                    <div className="space-y-4">
                        {myBookings.map((booking) => (
                            <div key={booking.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100">
                                        <img src={booking.alumni?.user?.profilePhoto || "https://images.unsplash.com/photo-1540569014015-19a7ee504e3a?q=80&w=400"} alt="Alumni" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-gray-900">{booking.alumni?.user?.name}</h4>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(booking.requestedDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center mt-2 pt-4 border-t border-gray-50">
                                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${
                                        booking.status === 'accepted' ? 'bg-blue-50 text-blue-600' :
                                        booking.status === 'completed' ? 'bg-green-50 text-green-600' :
                                        'bg-orange-50 text-orange-600'
                                    }`}>
                                        {booking.status}
                                    </span>
                                    
                                    {booking.status === 'accepted' && (
                                        <a href={booking.meetingLink} target="_blank" rel="noreferrer" className="text-blue-600 flex items-center gap-1 text-[9px] font-black uppercase hover:underline">
                                            <Video size={12} /> Join Session
                                        </a>
                                    )}

                                    {booking.status === 'completed' && !booking.rating && (
                                        <button 
                                            onClick={() => setFeedbackModal({ isOpen: true, bookingId: booking.id })}
                                            className="text-blue-600 flex items-center gap-1 text-[9px] font-black uppercase hover:underline"
                                        >
                                            <Star size={12} /> Leave Feedback
                                        </button>
                                    )}
                                    
                                    {booking.rating && (
                                        <div className="flex items-center gap-1 text-amber-500 font-black text-[10px]">
                                            <Star size={12} fill="currentColor" /> {booking.rating}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {myBookings.length === 0 && (
                            <div className="py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center px-6">
                                <ShieldCheck className="text-gray-200 mb-4" size={32} />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No mentorship history yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Booking Modal (Slot Picker) */}
            {selectedMentor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#000613]/50 backdrop-blur-sm" onClick={() => setSelectedMentor(null)} />
                    <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase italic">
                                Book <span className="text-blue-600">Session</span>
                            </h3>
                            <button onClick={() => setSelectedMentor(null)} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-8">
                            {/* Profile Peek */}
                            <div className="flex items-center gap-4 bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                                    <img src={selectedMentor.user?.profilePhoto || "https://images.unsplash.com/photo-1540569014015-19a7ee504e3a?q=80&w=400"} alt="Mentor" />
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-900">{selectedMentor.user?.name}</h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alumni of {selectedMentor.expertise || 'Software Engineering'}</p>
                                </div>
                            </div>

                            {/* Slot Picker */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Available Slot</label>
                                    <div className="flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase">
                                        <Clock size={12} /> Live Availability
                                    </div>
                                </div>

                                {loadingAvailability ? (
                                    <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {availability.map((slot) => (
                                            <button
                                                key={slot.id}
                                                onClick={() => setSelectedSlotId(slot.id)}
                                                className={`p-4 rounded-[20px] border-2 transition-all text-left ${
                                                    selectedSlotId === slot.id 
                                                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg' 
                                                        : 'border-gray-100 bg-gray-50 hover:border-blue-200 text-gray-900'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar size={12} className={selectedSlotId === slot.id ? 'text-blue-200' : 'text-blue-600'} />
                                                    <span className="text-[10px] font-black uppercase">{new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                </div>
                                                <div className="text-xs font-black">{slot.timeSlot}</div>
                                            </button>
                                        ))}

                                        {availability.length === 0 && (
                                            <div className="col-span-full py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No upcoming slots available</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">What do you want to discuss?</label>
                                <textarea 
                                    rows={3}
                                    placeholder="Briefly describe your queries or areas where you need guidance..."
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-900 outline-none focus:border-blue-600 transition-all custom-scrollbar"
                                    value={bookingNote}
                                    onChange={e => setBookingNote(e.target.value)}
                                />
                            </div>

                            <button
                                disabled={isBooking || !selectedSlotId}
                                onClick={handleConfirmBooking}
                                className="w-full py-5 bg-[#000613] text-white rounded-[20px] text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-xl disabled:opacity-50"
                            >
                                {isBooking ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                Confirm Booking Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback Modal */}
            <MentorshipFeedbackModal 
                isOpen={feedbackModal.isOpen} 
                bookingId={feedbackModal.bookingId} 
                onClose={() => setFeedbackModal({ isOpen: false, bookingId: '' })}
                onSuccess={() => {
                    setFeedbackModal({ isOpen: false, bookingId: '' });
                    fetchData();
                }}
            />
        </div>
    );
};

export default Mentorship;
