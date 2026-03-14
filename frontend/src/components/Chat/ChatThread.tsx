import React, { useState, useEffect, useRef } from 'react';
import { Send, X, User, MessageCircle, Check, CheckCheck, Paperclip, FileText as FileIcon } from 'lucide-react';
import { useSocket as useSocketCtx } from '../../context/SocketContext';
import chatService, { Message, Conversation } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import Button from '../Button/Button';
import { motion, AnimatePresence } from 'framer-motion';

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
                    
                    // Fetch initial online status
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
                setIsTyping(false); // Stop typing on message receive
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

        try {
            const res = await chatService.sendMessage(conversation._id, payload);
            if (res.success) {
                setMessages(prev => [...prev, res.data]);
                // Stop typing locally
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
                alert('No active resume found. Please upload one in your profile.');
                return;
            }
            handleSendMessage(undefined, { 
                text: 'Shared a resume version', 
                message_type: 'FILE', 
                file_url: resumeUrl 
            });
        } catch (err) {
            console.error('Failed to share resume:', err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md mx-auto sm:mr-0 sm:ml-auto">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30">
                            <User size={20} />
                        </div>
                        {isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full shadow-sm animate-pulse" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 m-0">
                            {user?.role === 'STUDENT' ? 'Recruiter Chat' : 'Student Inquiry'}
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 m-0 uppercase tracking-tighter font-semibold">
                            {isOnline ? 'Online Now' : 'Usually responds in a few hours'}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/10">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-50">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-medium">Loading conversation...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 m-4">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg mb-4 text-indigo-500">
                            <MessageCircle size={32} />
                        </div>
                        <h4 className="text-sm font-bold m-0 text-slate-800 dark:text-slate-100">Start the conversation</h4>
                        <p className="text-xs text-slate-500 mt-2">Introduce yourself to the recruiter or ask about the next steps.</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === user?._id;
                        return (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                key={msg._id} 
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm ${
                                    isMe 
                                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                                }`}>
                                    {msg.message_type === 'FILE' ? (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 mb-1 p-2 bg-black/10 dark:bg-white/5 rounded-lg border border-white/10">
                                                <div className="p-1.5 bg-white/20 rounded">
                                                    <FileIcon size={16} />
                                                </div>
                                                <span className="text-xs font-bold truncate">Resume_Version.pdf</span>
                                            </div>
                                            <button 
                                                onClick={() => window.open(msg.file_url, '_blank')}
                                                className={`text-[10px] font-black uppercase tracking-widest text-center py-1.5 rounded-md transition-all ${
                                                    isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                }`}
                                            >
                                                View Document
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-sm m-0 leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>
                                    )}
                                    <div className={`flex items-center gap-1 mt-1 justify-end ${isMe ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}`}>
                                        <span className="text-[9px] font-bold">
                                            {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {isMe && (
                                            msg.is_read ? <CheckCheck size={12} /> : <Check size={12} />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
                {isTyping && (
                    <motion.div 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex justify-start"
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-3">
                <AnimatePresence>
                    {user?.role === 'STUDENT' && !newMessage && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="flex gap-2 overflow-hidden"
                        >
                            <button 
                                onClick={handleSendResume}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-all uppercase tracking-widest border border-transparent hover:border-indigo-500/30"
                            >
                                <Paperclip size={12} /> Share Resume
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={(e) => handleSendMessage(e)} className="flex items-end gap-2">
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-1.5 focus-within:ring-2 ring-indigo-500/20 transition-all border border-transparent focus-within:border-indigo-500/30">
                        <textarea
                            rows={1}
                            placeholder="Type a message..."
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
                            className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 resize-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                    </div>
                    <Button 
                        type="submit" 
                        disabled={!newMessage.trim() || isLoading}
                        size="sm"
                        className="h-10 w-10 !p-0 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20"
                    >
                        <Send size={18} />
                    </Button>
                </form>
                <p className="text-[9px] text-center text-slate-400 font-semibold uppercase tracking-widest">Shift + Enter for new line</p>
            </div>
        </div>
    );
};

export default ChatThread;
