import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import chatService, { Conversation } from '../../services/chatService';
import PageHeader from '../../components/PageHeader/PageHeader';
import { MessageCircle, Search, User, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatThread from '../../components/Chat/ChatThread';
import EmptyState from '../../components/EmptyState/EmptyState';

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
        <div className="flex flex-col gap-8">
            <PageHeader 
                title="Message Center"
                subtitle="Direct communication with recruiters for your active applications."
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
                {/* Conversations List */}
                <div className={`lg:col-span-5 flex flex-col gap-4 overflow-hidden h-full ${selectedConvId ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by recruiter or job..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />)}
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <EmptyState 
                                illustration="/src/assets/illustrations/empty_messages.png"
                                title="No messages found"
                                description={searchTerm ? "Try searching for something else." : "Start a conversation from your applications page."}
                            />
                        ) : (
                            filteredConversations.map((conv) => (
                                <motion.div
                                    key={conv._id}
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => handleOpenChat(conv)}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 group ${
                                        selectedConvId === conv._id 
                                            ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30' 
                                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-lg'
                                    }`}
                                >
                                    <div className="flex gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                                                <User size={24} />
                                            </div>
                                            {conv.unread_count_student > 0 && (
                                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center rounded-full ring-2 ring-white dark:ring-slate-800">
                                                    {conv.unread_count_student}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 transition-colors">
                                                    {conv.recruiter_id?.name || 'Recruiter'}
                                                </h4>
                                                {conv.last_message && (
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        {new Date(conv.last_message.sent_at).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 truncate">
                                                {conv.job_id?.title} • {conv.job_id?.company || 'Company'}
                                            </p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate italic">
                                                {conv.last_message?.text || 'No messages yet...'}
                                            </p>
                                        </div>
                                        <div className="flex items-center text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Thread */}
                <div className={`lg:col-span-7 h-full ${!selectedConvId ? 'hidden lg:flex' : 'flex'}`}>
                    <AnimatePresence mode="wait">
                        {selectedConvId && selectedAppId ? (
                            <motion.div 
                                key={selectedConvId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="w-full h-full border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xl relative"
                            >
                                <ChatThread 
                                    applicationId={selectedAppId} 
                                    onClose={() => setSelectedConvId(null)} 
                                />
                                {/* Back button for mobile */}
                                <button 
                                    onClick={() => setSelectedConvId(null)}
                                    className="lg:hidden absolute top-4 left-4 p-2 bg-white dark:bg-slate-800 rounded-full shadow-md z-[101]"
                                >
                                    <MessageCircle size={20} />
                                </button>
                            </motion.div>
                        ) : (
                            <div className="hidden lg:flex flex-col items-center justify-center w-full h-full bg-slate-50/50 dark:bg-slate-800/10 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <div className="p-8 bg-white dark:bg-slate-800 rounded-full shadow-2xl text-indigo-500 mb-6">
                                    <MessageCircle size={48} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Select a conversation</h3>
                                <p className="text-slate-500 mt-2 font-medium">Choose a recruiter thread to start messaging</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ChatInbox;
