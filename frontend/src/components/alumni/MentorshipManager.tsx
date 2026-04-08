import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, XCircle, Clock, Link, MessageSquare, 
  Loader2, Video, Check
} from 'lucide-react';
import api from '../../api';
import { toast } from 'react-hot-toast';

const MentorshipManager: React.FC = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'completed'>('pending');
    const [updating, setUpdating] = useState<string | null>(null);

    const [modalData, setModalData] = useState<{
        isOpen: boolean;
        requestId: string;
        action: 'accept' | 'complete';
        link?: string;
        feedback?: string;
    }>({
        isOpen: false,
        requestId: '',
        action: 'accept'
    });

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/alumni/mentorship/requests');
            setRequests(data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load mentorship requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleUpdateStatus = async (id: string, status: string, extra = {}) => {
        try {
            setUpdating(id);
            await api.put(`/alumni/mentorship/${id}`, { status, ...extra });
            toast.success(`Session ${status}!`);
            fetchRequests();
            setModalData(p => ({ ...p, isOpen: false }));
        } catch (err) {
            toast.error('Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    const filteredRequests = requests.filter(r => {
        if (activeTab === 'pending') return r.status === 'pending';
        if (activeTab === 'accepted') return r.status === 'accepted';
        return ['completed', 'rejected'].includes(r.status);
    });

    if (loading && requests.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden animate-in fade-in duration-500">
            {/* Header / Tabs */}
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase italic flex items-center gap-2">
                        <Users className="text-blue-600" size={20} />
                        Mentorship <span className="text-blue-600">Arena</span>
                    </h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Guide students towards their career goals</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
                    {(['pending', 'accepted', 'completed'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeTab === tab 
                                    ? 'bg-white text-blue-600 shadow-sm' 
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content List */}
            <div className="p-4 space-y-4 min-h-[400px]">
                {filteredRequests.map(req => (
                    <div key={req.id} className="group bg-gray-50/50 hover:bg-white border border-gray-100 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1">
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Student Head */}
                            <div className="flex items-center gap-4 flex-shrink-0">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                                    <img 
                                        src={req.student?.profilePhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400"} 
                                        alt="Student" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 truncate max-w-[150px]">{req.student?.name}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Applied on {new Date(req.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Query Content */}
                            <div className="flex-1 bg-white/50 border border-gray-100 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare size={12} className="text-blue-600" />
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Purpose of Request</span>
                                </div>
                                <p className="text-xs font-bold text-gray-700 leading-relaxed italic line-clamp-3">
                                    "{req.query || 'Seeking general career guidance and industry insights.'}"
                                </p>
                            </div>

                            {/* Action Area */}
                            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 justify-center min-w-[180px]">
                                {req.status === 'pending' && (
                                    <>
                                        <button 
                                            onClick={() => setModalData({ isOpen: true, requestId: req.id, action: 'accept' })}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Check size={14} /> Accept Request
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus(req.id, 'rejected')}
                                            disabled={updating === req.id}
                                            className="px-6 py-3 bg-white border border-gray-100 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all"
                                        >
                                            Decline
                                        </button>
                                    </>
                                )}

                                {req.status === 'accepted' && (
                                    <>
                                        <a 
                                            href={req.meetingLink} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="px-6 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Video size={14} /> Join Meeting
                                        </a>
                                        <button 
                                            onClick={() => setModalData({ isOpen: true, requestId: req.id, action: 'complete', link: req.meetingLink })}
                                            className="px-6 py-3 bg-white border border-gray-100 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-50 hover:border-green-100 transition-all"
                                        >
                                            Mark Completed
                                        </button>
                                    </>
                                )}

                                {req.status === 'completed' && (
                                    <div className="flex items-center justify-center gap-2 px-6 py-3 bg-green-50 border border-green-100 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                        <CheckCircle2 size={14} /> Completed
                                    </div>
                                )}
                                
                                {req.status === 'rejected' && (
                                    <div className="flex items-center justify-center gap-2 px-6 py-3 bg-red-50 border border-red-100 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                        <XCircle size={14} /> Declined
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredRequests.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                        <Clock className="text-gray-200 mb-4" size={48} />
                        <p className="text-sm font-black text-gray-300 uppercase tracking-widest italic">No {activeTab} sessions found</p>
                    </div>
                )}
            </div>

            {/* Action Modals */}
            {modalData.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setModalData(p => ({ ...p, isOpen: false }))} />
                    <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase italic">{modalData.action === 'accept' ? 'Accept Request' : 'Complete Session'}</h3>
                            <button onClick={() => setModalData(p => ({ ...p, isOpen: false }))} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all">
                                <XCircle size={18} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {modalData.action === 'accept' ? (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Meeting Link (Google Meet/Zoom)</label>
                                        <div className="relative">
                                            <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                                            <input 
                                                type="url" 
                                                placeholder="https://meet.google.com/..."
                                                className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-900 outline-none focus:border-blue-600 transition-all"
                                                value={modalData.link}
                                                onChange={e => setModalData({...modalData, link: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleUpdateStatus(modalData.requestId, 'accepted', { meetingLink: modalData.link })}
                                        className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                                    >
                                        Confirm & Send Link
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Final Session Notes / Guidance</label>
                                        <textarea 
                                            rows={4} 
                                            placeholder="Summarize your advice or next steps for the student..."
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-900 outline-none focus:border-blue-600 transition-all custom-scrollbar"
                                            value={modalData.feedback}
                                            onChange={e => setModalData({...modalData, feedback: e.target.value})}
                                        />
                                    </div>
                                    <button 
                                        onClick={() => handleUpdateStatus(modalData.requestId, 'completed', { feedback: modalData.feedback })}
                                        className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all"
                                    >
                                        Mark as Completed
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorshipManager;
