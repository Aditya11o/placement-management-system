import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, Loader2, MinusCircle, Maximize2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface Message {
    role: 'user' | 'model';
    parts: { text: string }[];
}

const AIChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMessage = message.trim();
        setMessage('');
        setIsLoading(true);

        // Add user message to history
        const newHistory: Message[] = [
            ...chatHistory,
            { role: 'user', parts: [{ text: userMessage }] }
        ];
        setChatHistory(newHistory);

        try {
            const response = await api.post('/ai/chat', {
                message: userMessage,
                history: chatHistory
            });

            if (response.data.success) {
                setChatHistory(prev => [
                    ...prev,
                    { role: 'model', parts: [{ text: response.data.data }] }
                ]);
            } else {
                // Handle cases where success is false but didn't throw (e.g. business logic errors)
                throw new Error(response.data.message || 'Operation failed');
            }
        } catch (error: any) {
            console.error('AI Chat Error:', error);
            
            // Extract detailed error message from response if available
            const serverError = error.response?.data?.error || error.response?.data?.message || error.message;
            const displayError = `Sorry, I'm having trouble connecting to my brain right now. ${serverError ? `(Error: ${serverError})` : 'Please try again later.'}`;

            setChatHistory(prev => [
                ...prev,
                { role: 'model', parts: [{ text: displayError }] }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && !isMinimized && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden mb-4"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-brand-600 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                    <Sparkles size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm tracking-tight m-0">Alex AI Assistant</h3>
                                    <div className="flex items-center gap-1.5 leading-none">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[10px] opacity-80 uppercase font-black tracking-widest">Active</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsMinimized(true)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <MinusCircle size={18} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50 dark:bg-slate-900/50">
                            {chatHistory.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                        <Bot size={32} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-slate-100">Hi, I'm Alex!</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            I'm your dedicated career assistant. Ask me anything about placements, resumes, or interview prep!
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 w-full">
                                        {["How can I improve my resume?", "Top skills for Google?", "Tell me about my placement stats"].map((hint, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setMessage(hint);
                                                }}
                                                className="text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-all text-left"
                                            >
                                                {hint}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {chatHistory.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                        </div>
                                        <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700 rounded-tl-none'}`}>
                                            {msg.parts[0].text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3 max-w-[85%]">
                                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center animate-pulse">
                                            <Bot size={16} className="text-slate-400" />
                                        </div>
                                        <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                                            <Loader2 size={16} className="animate-spin text-indigo-600" />
                                            <span className="text-xs text-slate-500">Thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim() || isLoading}
                                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trigger Button */}
            <motion.button
                onClick={() => {
                    setIsOpen(true);
                    setIsMinimized(false);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 relative group ${isOpen && !isMinimized ? 'bg-red-500 text-white rotate-90 scale-0' : 'bg-[#6C63FF] text-white'}`}
            >
                <div className="absolute inset-0 bg-indigo-600 rounded-2xl animate-ping opacity-20 group-hover:opacity-40" />
                <MessageSquare size={24} className="relative z-10" />
                {chatHistory.length === 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-bounce" />
                )}
            </motion.button>

            {/* Minimized Bubble */}
            <AnimatePresence>
                {isOpen && isMinimized && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: 20 }}
                        onClick={() => setIsMinimized(false)}
                        className="fixed bottom-24 right-6 p-3 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center gap-3 group hover:border-indigo-500 transition-all"
                    >
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                            <Bot size={18} />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Alex is waiting...</span>
                        <div className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                            <Maximize2 size={12} />
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIChatbot;
