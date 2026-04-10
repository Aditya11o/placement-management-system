import React, { useState } from 'react';
import { X, Star, Send, Loader2, MessageSquare } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    bookingId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const MentorshipFeedbackModal: React.FC<Props> = ({ isOpen, bookingId, onClose, onSuccess }) => {
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await api.post(`/alumni/mentorship/feedback/${bookingId}`, {
                studentFeedback: feedback,
                rating
            });
            toast.success('Thank you for your feedback!');
            onSuccess();
        } catch (err) {
            toast.error('Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#000613]/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase italic">
                        Session <span className="text-blue-600">Feedback</span>
                    </h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-xl">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-center block">Rate your experience</label>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setRating(num)}
                                    className={`p-3 rounded-2xl transition-all ${
                                        rating >= num ? 'text-amber-400 bg-amber-50' : 'text-gray-200 bg-gray-50'
                                    }`}
                                >
                                    <Star size={24} fill={rating >= num ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Comments (Optional)</label>
                        <div className="relative">
                            <MessageSquare className="absolute left-4 top-4 text-gray-300" size={16} />
                            <textarea 
                                rows={4}
                                placeholder="How was the session? Was it helpful? Any specific takeaways?"
                                className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-3xl text-xs font-bold text-gray-900 outline-none focus:border-blue-600 transition-all custom-scrollbar"
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-5 bg-[#000613] text-white rounded-[20px] text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-xl disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                        Submit Feedback
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MentorshipFeedbackModal;
