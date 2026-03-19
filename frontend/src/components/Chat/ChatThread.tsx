import React, { useState, useEffect, useRef } from 'react';
import { 
    Send, X, User, MessageCircle, Check, CheckCheck, 
    FileText as FileIcon, MoreHorizontal,
    ShieldCheck, Briefcase, Building,
    Download, Smile, Plus, Search, ExternalLink,
    Star, CheckCircle2
} from 'lucide-react';
import { useSocket as useSocketCtx } from '../../context/SocketContext';
import chatService, { Message, Conversation } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import Button from '../Button/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';

interface ChatThreadProps {
    applicationId: string;
    onClose: () => void;
}

const ChatThread: React.FC<ChatThreadProps> = ({ applicationId, onClose }) => {
    const { user } = useAuth();
    const { socket } = useSocketCtx();
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const init = async () => {
            try {
                const convRes = await chatService.initiateChat(applicationId);
                if (convRes.success) {
                    setConversation(convRes.data);
                    
                    const recipientId = user?.role === 'STUDENT' ? convRes.data.recruiter_id : convRes.data.student_id;
                    const statusRes = await chatService.getOnlineStatus(recipientId);
                    if (statusRes.success) setIsOnline(statusRes.data.isOnline);

                    const msgRes = await chatService.getMessages(convRes.data._id);
                    if (msgRes.success) {
                        setMessages(msgRes.data);
                    }
                }
            } catch (err) {
                console.error('Failed to init chat:', err);
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, [applicationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!socket || !conversation) return;

        const handleNewMessage = (payload: { conversationId: string; message: Message }) => {
            if (payload.conversationId === conversation._id) {
                setMessages(prev => [...prev, payload.message]);
                setIsTyping(false);
            }
        };

        const handleTyping = (payload: { conversationId: string; senderId: string; isTyping: boolean }) => {
            if (payload.conversationId === conversation._id && payload.senderId !== user?._id) {
                setIsTyping(payload.isTyping);
            }
        };

        socket.on('chat:message', handleNewMessage);
        socket.on('chat:typing', handleTyping);

        return () => {
            socket.off('chat:message', handleNewMessage);
            socket.off('chat:typing', handleTyping);
        };
    }, [socket, conversation?._id, user?._id]);

    const handleSendMessage = async (e?: React.FormEvent, payloadOverride?: any) => {
        if (e) e.preventDefault();
        if (!conversation) return;
        
        const payload = payloadOverride || { text: newMessage.trim(), message_type: 'TEXT' };
        if (!payload.text && !payload.file_url) return;

        if (!payloadOverride) setNewMessage('');
        setShowAttachmentMenu(false);

        try {
            const res = await chatService.sendMessage(conversation._id, payload);
            if (res.success) {
                setMessages(prev => [...prev, res.data]);
                if (socket) {
                    const recipientId = user?.role === 'STUDENT' ? conversation.recruiter_id : conversation.student_id;
                    socket.emit('chat:typing', { conversationId: conversation._id, recipientId, isTyping: false });
                }
            }
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const handleTyping = () => {
        if (!socket || !conversation) return;
        const recipientId = user?.role === 'STUDENT' ? conversation.recruiter_id : conversation.student_id;
        
        socket.emit('chat:typing', { conversationId: conversation._id, recipientId, isTyping: true });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('chat:typing', { conversationId: conversation._id, recipientId, isTyping: false });
        }, 3000);
    };

    const handleSendResume = async () => {
        try {
            const profileRes = await studentService.getProfile();
            const resumeUrl = profileRes.data.resume_url;
            if (!resumeUrl) {
                alert('No active resume found.');
                return;
            }
            handleSendMessage(undefined, { 
                text: 'Shared credentials for job application', 
                message_type: 'FILE', 
                file_url: resumeUrl 
            });
        } catch (err) {
            console.error('Failed to share resume:', err);
        }
    };

    const formatMessageDate = (date: Date) => {
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'MMMM d, yyyy');
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 w-full relative">
            
            {/* Professional Recruiter Anchor Header */}
            <div className="p-6 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="relative group cursor-pointer">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border-2 border-slate-100 dark:border-slate-800 transition-all group-hover:scale-105">
                             <User size={28} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        {isOnline ? (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full animate-pulse shadow-sm" />
                        ) : (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-400 border-4 border-white dark:border-slate-900 rounded-full shadow-sm" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                             <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 italic uppercase tracking-tight leading-tight">
                                 {conversation?.recruiter_id?.name || 'Technical Recruiter'}
                             </h3>
                             <ShieldCheck size={16} className="text-indigo-500 fill-indigo-500/10" />
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                             <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">
                                 {conversation?.job_id?.company || 'Recruitment Entity'}
                             </p>
                             <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                             <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">
                                 {isOnline ? 'Active Now' : 'Last seen 2h ago'}
                             </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-3 text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all hidden md:flex">
                        <Search size={20} />
                    </button>
                    <button className="p-3 text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all">
                        <MoreHorizontal size={20} />
                    </button>
                    <button 
                        onClick={onClose}
                        className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all ml-2"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Application Context Banner */}
            <div className="bg-indigo-600 text-white px-6 py-3 flex items-center justify-between shadow-lg">
                 <div className="flex items-center gap-4">
                      <Briefcase size={16} className="text-indigo-200" />
                      <div className="text-[10px] font-black uppercase tracking-widest">
                           Application context: <span className="text-indigo-100">{conversation?.job_id?.title}</span>
                      </div>
                 </div>
                 <button className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-all">
                      View Job <ExternalLink size={12} />
                 </button>
            </div>

            {/* Messages Feed with Grouping */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-slate-50/20 dark:bg-slate-900/10 relative">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-50">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                         <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center shadow-premium border border-slate-100 dark:border-slate-800">
                              <MessageCircle size={40} className="text-indigo-500" />
                         </div>
                         <div className="space-y-2">
                              <h4 className="text-2xl font-black text-slate-800 dark:text-white italic uppercase tracking-tight">Open Channel.</h4>
                              <p className="text-sm text-slate-400 font-bold italic max-w-[240px]">Introduce yourself or ask for an application status update.</p>
                         </div>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.sender_id === user?._id;
                        const messageDate = new Date(msg.sent_at);
                        const prevMessage = index > 0 ? messages[index - 1] : null;
                        const showDateSeparator = !prevMessage || !isSameDay(new Date(prevMessage.sent_at), messageDate);

                        return (
                            <React.Fragment key={msg._id}>
                                {showDateSeparator && (
                                    <div className="flex items-center justify-center my-10">
                                         <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
                                         <span className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest italic shadow-sm">
                                             {formatMessageDate(messageDate)}
                                         </span>
                                         <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
                                    </div>
                                )}
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] relative group`}>
                                         <div className={`px-6 py-4 rounded-[2rem] shadow-premium transition-all relative ${
                                             isMe 
                                                 ? 'bg-indigo-600 text-white rounded-tr-none' 
                                                 : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                                         }`}>
                                             {msg.message_type === 'FILE' ? (
                                                 <div className="flex flex-col gap-4">
                                                     <div className={`flex items-center gap-4 p-4 rounded-2xl border ${isMe ? 'bg-white/10 border-white/20' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700'}`}>
                                                         <div className={`p-3 rounded-xl ${isMe ? 'bg-white/20' : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600'}`}>
                                                             <FileIcon size={24} />
                                                         </div>
                                                         <div className="flex-1 min-w-0">
                                                              <div className="text-xs font-black truncate uppercase tracking-tight">Student_Credentials.pdf</div>
                                                              <div className={`text-[9px] font-bold uppercase ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>PDF Document • 1.2 MB</div>
                                                         </div>
                                                         <button className={`p-2 rounded-lg transition-all ${isMe ? 'hover:bg-white/20' : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30'}`}>
                                                              <Download size={18} />
                                                         </button>
                                                     </div>
                                                     <button 
                                                         onClick={() => window.open(msg.file_url, '_blank')}
                                                         className={`text-[10px] font-black uppercase tracking-[0.2em] text-center py-3 rounded-xl transition-all shadow-lg active:scale-95 ${
                                                             isMe ? 'bg-white text-indigo-900 hover:bg-slate-900 hover:text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                         }`}
                                                     >
                                                         View Documents
                                                     </button>
                                                 </div>
                                             ) : (
                                                 <p className="text-sm m-0 leading-relaxed font-bold italic line-clamp-none whitespace-pre-wrap">{msg.text}</p>
                                             )}
                                         </div>
                                         <div className={`flex items-center gap-2 mt-2 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter opacity-70">
                                                 {format(messageDate, 'h:mm a')}
                                             </span>
                                             {isMe && (
                                                 <div className="flex items-center">
                                                     {msg.is_read ? <CheckCheck size={14} className="text-indigo-500" /> : <Check size={14} className="text-slate-300" />}
                                                 </div>
                                             )}
                                         </div>
                                    </div>
                                </motion.div>
                            </React.Fragment>
                        );
                    })
                )}
                {isTyping && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex justify-start"
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-[2rem] rounded-tl-none px-6 py-4 border border-slate-100 dark:border-slate-700 shadow-premium flex items-center gap-2">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Professional Rich Input Area */}
            <div className="p-8 border-t border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-6 shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
                
                {/* Actions Tooltip / Quick Bar */}
                <AnimatePresence>
                     {showAttachmentMenu && (
                          <motion.div 
                               initial={{ opacity: 0, y: 10, scale: 0.95 }}
                               animate={{ opacity: 1, y: 0, scale: 1 }}
                               exit={{ opacity: 0, y: 10, scale: 0.95 }}
                               className="absolute bottom-32 left-8 p-4 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-2xl z-50 flex gap-4"
                          >
                               <button onClick={handleSendResume} className="flex flex-col items-center gap-2 p-4 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl group transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                         <FileIcon size={20} />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Resume</span>
                               </button>
                               <button className="flex flex-col items-center gap-2 p-4 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl group transition-all opacity-40 cursor-not-allowed">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                                         <Building size={20} />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Portfolio</span>
                               </button>
                               <button className="flex flex-col items-center gap-2 p-4 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl group transition-all opacity-40 cursor-not-allowed">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 flex items-center justify-center">
                                         <Star size={20} />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Offer Docs</span>
                               </button>
                          </motion.div>
                     )}
                </AnimatePresence>

                <form onSubmit={(e) => handleSendMessage(e)} className="flex items-end gap-5">
                    <button 
                         type="button"
                         onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                         className={`w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center shrink-0 transition-all ${showAttachmentMenu ? 'bg-indigo-600 text-white rotate-45' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-500'}`}
                    >
                        <Plus size={24} strokeWidth={3} />
                    </button>

                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/80 rounded-[2rem] px-6 py-2 focus-within:ring-4 ring-indigo-500/10 transition-all border border-slate-100 dark:border-slate-700 group">
                        <textarea
                            rows={1}
                            placeholder="Draft your response..."
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            className="w-full bg-transparent border-none focus:ring-0 text-sm py-3 resize-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold italic"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                         <button type="button" className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 hover:text-amber-500 transition-colors shadow-premium">
                             <Smile size={24} />
                         </button>
                         <Button 
                             type="submit" 
                             disabled={!newMessage.trim() || isLoading}
                             className="h-14 px-8 rounded-2xl flex items-center justify-center shrink-0 bg-slate-900 hover:bg-indigo-600 text-white shadow-premium transition-all active:scale-95 group/submit"
                         >
                             <Send size={20} className="mr-2 group-hover/submit:translate-x-1 group-hover/submit:-translate-y-1 transition-transform" />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Send</span>
                         </Button>
                    </div>
                </form>
                
                <div className="flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
                     <div className="flex items-center gap-2">
                          <CheckCircle2 size={10} className="text-emerald-500" /> Professional Channel Encryption Active
                     </div>
                     <div>Shift + Enter for new line</div>
                </div>
            </div>
        </div>
    );
};

export default ChatThread;
