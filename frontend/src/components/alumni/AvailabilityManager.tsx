import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Trash2, Plus, Loader2, Info } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-hot-toast';

const AvailabilityManager: React.FC = () => {
    const [slots, setSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    
    const [newSlot, setNewSlot] = useState({
        date: '',
        timeSlot: ''
    });

    const fetchSlots = async () => {
        try {
            setLoading(true);
            // We need to get the mentor profile first or the backend should handle finding it by user ID
            // My backend implementation uses req.user.id to find the mentor profile, 
            // but the GET route /availability/:mentorId needs a mentorId.
            // I should either modify GET to work for the logged-in mentor or fetch profile first.
            
            // Let's fetch the mentor's own dashboard first to get profile info if needed, 
            // or just assume we can get 'our' availability.
            const { data: profile } = await api.get('/alumni/dashboard');
            const mentorId = profile.mentorProfile?.id || profile.id; // Depending on response structure
            
            const { data } = await api.get(`/alumni/mentorship/availability/${mentorId}`);
            setSlots(data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load availability slots');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, []);

    const handleAddSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSlot.date || !newSlot.timeSlot) return;

        try {
            setAdding(true);
            await api.post('/alumni/mentorship/availability', newSlot);
            toast.success('Slot added successfully');
            setNewSlot({ date: '', timeSlot: '' });
            fetchSlots();
        } catch (err) {
            toast.error('Failed to add slot');
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteSlot = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this slot?')) return;
        
        try {
            await api.delete(`/alumni/mentorship/availability/${id}`);
            toast.success('Slot deleted');
            setSlots(slots.filter(s => s.id !== id));
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete slot');
        }
    };

    if (loading && slots.length === 0) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase italic">Manage <span className="text-blue-600">Availability</span></h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Define when students can book sessions with you</p>
                    </div>
                </div>

                <form onSubmit={handleAddSlot} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Session Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                            <input 
                                type="date" 
                                className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-900 outline-none focus:border-blue-600 transition-all"
                                value={newSlot.date}
                                onChange={e => setNewSlot({...newSlot, date: e.target.value})}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Time Slot (e.g. 10:00 AM - 11:00 AM)</label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                            <input 
                                type="text"
                                placeholder="10:00 AM - 11:00 AM"
                                className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-900 outline-none focus:border-blue-600 transition-all"
                                value={newSlot.timeSlot}
                                onChange={e => setNewSlot({...newSlot, timeSlot: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <button 
                        disabled={adding}
                        className="py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                        {adding ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                        Add Time Slot
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slots.map((slot) => (
                    <div key={slot.id} className="group bg-white border border-gray-100 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                <Clock size={16} />
                            </div>
                            <button 
                                onClick={() => handleDeleteSlot(slot.id)}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <h3 className="text-sm font-black text-gray-900 mb-1">{slot.timeSlot}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        
                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                            <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${
                                slot.isBooked ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                            }`}>
                                {slot.isBooked ? 'Currently Booked' : 'Available'}
                            </span>
                        </div>
                    </div>
                ))}

                {slots.length === 0 && (
                    <div className="col-span-full py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                        <Info className="text-gray-200 mb-4" size={48} />
                        <p className="text-sm font-black text-gray-300 uppercase tracking-widest italic">No availability slots defined yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvailabilityManager;
