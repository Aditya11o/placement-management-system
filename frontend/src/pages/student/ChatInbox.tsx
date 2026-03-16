import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import chatService, { Conversation } from '../../services/chatService';
import PageHeader from '../../components/PageHeader/PageHeader';
import { 
    MessageCircle, Search, User, ChevronRight, 
    Building, Filter, MoreVertical, Star,
    CheckCircle2, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatThread from '../../components/Chat/ChatThread';
import EmptyState from '../../components/EmptyState/EmptyState';
import { formatDistanceToNow } from 'date-fns';

const ChatInbox: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

    const { data: conversations = [], isLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const res = await chatService.getConversations();
            return res.data as Conversation[];
        },
    });

    const filteredConversations = conversations.filter(conv => {
        const recruiterName = conv.recruiter_id?.name || '';
        const jobTitle = conv.job_id?.title || '';
        return recruiterName.toLowerCase().includes(searchTerm.toLowerCase()) || 
               jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleOpenChat = (conv: Conversation) => {
        setSelectedConvId(conv._id);
        setSelectedAppId(conv.application_id);
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700 min-h-screen pb-20">
            <PageHeader 
                title="Message Center"
                subtitle="Professional direct communication hub with recruiters."
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[800px] max-w-[1700px] mx-auto w-full">
                {/* Conversations Sidebar */}
                <div className={`lg:col-span-5 flex flex-col gap-6 overflow-hidden h-full ${selectedConvId ? 'hidden lg:flex' : 'flex'}`}>
                    
                    {/* Discovery & Search Hub */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 p-4 shadow-sm">
                        <div className="relative group mb-4">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 group-focus-within:scale-110 transition-transform" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search conversations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-4 ring-indigo-500/10 outline-none transition-all dark:text-white font-black text-sm uppercase tracking-tight"
                            />
                        </div>
                        
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                             {['All', 'Unread', 'Recruiters', 'Peer Mentors'].map((tab, i) => (
                                 <button key={tab} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${i === 0 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}>
                                     {tab}
                                 </button>
                             ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white dark:bg-slate-800 animate-pulse rounded-[2rem] border border-slate-100 dark:border-slate-700" />)}
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <EmptyState 
                                variant="messages"
                                title="No Network Conversations"
                                description={searchTerm ? "Try searching for another recruiter." : "Your interview threads will appear here once you apply for jobs."}
                            />
                        ) : (
                            filteredConversations.map((conv) => (
                                <motion.div
                                    key={conv._id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => handleOpenChat(conv)}
                                    className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 group relative ${
                                        selectedConvId === conv._id 
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-500/20 translate-x-2' 
                                            : 'bg-white dark:bg-slate-900 border-transparent dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-950 hover:shadow-xl'
                                    }`}
                                >
                                    <div className="flex gap-5">
                                        <div className="relative flex-shrink-0">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                                                selectedConvId === conv._id 
                                                    ? 'bg-white/20 border-white/20' 
                                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                                            }`}>
                                                <User size={24} className={selectedConvId === conv._id ? 'text-white' : 'text-slate-400'} />
                                            </div>
                                            {/* Application Status Badge (Mock - would come from job info) */}
                                            <div className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-tighter shadow-sm border ${
                                                 selectedConvId === conv._id 
                                                 ? 'bg-white text-indigo-600 border-white' 
                                                 : 'bg-emerald-500 text-white border-emerald-400'
                                            }`}>
                                                 Interview
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`text-sm font-black truncate uppercase tracking-tight italic transition-colors ${
                                                    selectedConvId === conv._id ? 'text-white' : 'text-slate-800 dark:text-white group-hover:text-indigo-600'
                                                }`}>
                                                    {conv.recruiter_id?.name || 'Technical Recruiter'}
                                                </h4>
                                                {conv.last_message && (
                                                    <span className={`text-[9px] font-bold uppercase tracking-widest opacity-60 ${
                                                        selectedConvId === conv._id ? 'text-white' : 'text-slate-400'
                                                    }`}>
                                                        {formatDistanceToNow(new Date(conv.last_message.sent_at), { addSuffix: false })}
                                                    </span>
                                                )}
                                            </div>

                                            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-2 opacity-70 ${
                                                 selectedConvId === conv._id ? 'text-indigo-100' : 'text-indigo-500'
                                            }`}>
                                                 <Building size={12} /> {conv.job_id?.company || 'Company'} • {conv.job_id?.title}
                                            </div>

                                            <p className={`text-xs truncate italic font-medium ${
                                                selectedConvId === conv._id ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                                            }`}>
                                                {conv.last_message?.text || 'Waiting for initial response...'}
                                            </p>
                                        </div>

                                        {conv.unread_count_student > 0 && selectedConvId !== conv._id && (
                                             <div className="absolute top-6 right-6 w-3 h-3 bg-indigo-600 rounded-full ring-4 ring-indigo-100 dark:ring-indigo-950 animate-pulse" />
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Window */}
                <div className={`lg:col-span-7 h-full relative ${!selectedConvId ? 'hidden lg:flex' : 'flex'}`}>
                    <AnimatePresence mode="wait">
                        {selectedConvId && selectedAppId ? (
                            <motion.div 
                                key={selectedConvId}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="w-full h-full bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden shadow-premium border border-slate-200/60 dark:border-slate-800"
                            >
                                <ChatThread 
                                    applicationId={selectedAppId} 
                                    onClose={() => setSelectedConvId(null)} 
                                />
                            </motion.div>
                        ) : (
                            <div className="hidden lg:flex flex-col items-center justify-center w-full h-full bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] group-hover:bg-indigo-500/10 transition-colors" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px]" />
                                
                                <motion.div 
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="p-10 bg-slate-50 dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 text-indigo-500 mb-8 shadow-xl"
                                >
                                    <MessageCircle size={80} strokeWidth={1.5} />
                                </motion.div>
                                <div className="text-center max-w-sm px-6">
                                     <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-4 italic uppercase tracking-tight">Select a <br />Connection.</h3>
                                     <p className="text-slate-500 dark:text-slate-400 font-bold italic leading-relaxed opacity-70">
                                         Connect with recruiters, share credentials, and track your interview journey in one professional hub.
                                     </p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ChatInbox;
