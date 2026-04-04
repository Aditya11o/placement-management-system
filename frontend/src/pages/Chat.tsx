import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { io } from 'socket.io-client';
import { Send, Search, MessageSquare, Loader2, ArrowLeft } from 'lucide-react';
import Avatar from '../components/Avatar';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const socketRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Initialize socket — auth handled via httpOnly cookies
    socketRef.current = io(import.meta.env.VITE_BASE_URL || 'http://localhost:5000', {
      withCredentials: true,
    });
    // Server auto-joins user to their private room via verified token

    socketRef.current.on('new_message', (msg: any) => {
      if (selectedChat && msg.sender === selectedChat.user._id) {
        setMessages(prev => [...prev, msg]);
      } else {
        fetchConversations();
      }
    });

    fetchConversations();

    return () => {
      socketRef.current.disconnect();
    };
  }, [user, selectedChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId: string) => {
    setMsgLoading(true);
    try {
      const res = await api.get(`/messages/${otherUserId}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setMsgLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const res = await api.post('/messages', {
        recipient: selectedChat.user._id,
        content: newMessage
      });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="chat-page-wrapper">
      <div className="flex h-full bg-surface-container-lowest border border-outline-variant rounded-3xl overflow-hidden shadow-sm">
        {/* Left Panel - Chat List */}
        <div className={`w-full md:w-80 border-r border-outline-variant/50 flex flex-col min-h-0 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
          {/* List Header - Fixed */}
          <div className="p-6 border-b border-outline-variant/30 shrink-0">
            <h2 className="text-xl font-black text-on-surface tracking-tight flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-600" />
              Messages
            </h2>
            <div className="mt-4 relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={14} />
               <input 
                 type="text" 
                 placeholder="Search chats..."
                 className="w-full pl-9 pr-4 py-2 bg-surface-container border-none rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-surface-tint/20 transition-all text-on-surface"
               />
            </div>
          </div>
          
          {/* Chat List - Scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
            {conversations.map((conv) => (
              <button
                key={conv.user._id}
                onClick={() => {
                  setSelectedChat(conv);
                  fetchMessages(conv.user._id);
                }}
                className={`w-full p-4 flex items-center gap-4 hover:bg-surface-container transition-all border-b border-outline-variant/20 ${selectedChat?.user._id === conv.user._id ? 'bg-surface-tint/5' : ''}`}
              >
                <Avatar 
                  name={conv.user.name} 
                  profilePhoto={conv.user.profilePhoto || conv.user.profile_photo} 
                  size="md" 
                  className="rounded-2xl" 
                />
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-black text-on-surface truncate uppercase tracking-tight">{conv.user.name}</h4>
                    <span className="text-[9px] font-bold text-on-surface-variant">{new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-medium truncate mt-0.5">{conv.lastMessage}</p>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-surface-container-high text-on-surface-variant rounded-md">{conv.user.role}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel - Chat Area */}
        <div className={`flex-1 flex flex-col min-h-0 bg-surface/30 ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
          {selectedChat ? (
            <>
              {/* Chat Header - Fixed */}
              <div className="p-4 md:p-6 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 text-on-surface-variant"><ArrowLeft size={18} /></button>
                  <Avatar 
                    name={selectedChat.user.name} 
                    profilePhoto={selectedChat.user.profilePhoto || selectedChat.user.profile_photo} 
                    size="sm" 
                    className="rounded-xl" 
                  />
                  <div>
                    <h3 className="text-sm font-black text-on-surface uppercase tracking-tight">{selectedChat.user.name}</h3>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{selectedChat.user.role} • Active Now</p>
                  </div>
                </div>
              </div>

              {/* Messages - Scrollable */}
              <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4 custom-scrollbar">
                {msgLoading ? (
                  <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === user?._id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-4 rounded-3xl text-sm font-medium shadow-sm transition-all hover:shadow-md ${
                        msg.sender === user?._id 
                          ? 'bg-primary text-on-primary rounded-tr-none' 
                          : 'bg-surface-container-lowest text-on-surface border border-outline-variant/30 rounded-tl-none'
                      }`}>
                        {msg.content}
                        <p className={`text-[8px] mt-2 font-black uppercase tracking-widest opacity-40 text-right`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={scrollRef} />
              </div>

              {/* Input - Fixed at bottom */}
              <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/30 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-6 py-3.5 bg-surface-container border-none rounded-2xl text-sm font-medium text-on-surface outline-none focus:bg-surface-container-lowest focus:ring-4 focus:ring-surface-tint/5 transition-all shadow-inner"
                  />
                  <button 
                    type="submit"
                    className="p-4 bg-primary text-on-primary rounded-2xl hover:opacity-90 hover:scale-105 transition-all shadow-lg active:scale-95"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-24 h-24 bg-surface-container rounded-[40px] flex items-center justify-center mb-6 border border-outline-variant animate-pulse">
                 <MessageSquare size={40} className="text-on-surface-variant/30" />
              </div>
              <h3 className="text-xl font-black text-on-surface tracking-tight uppercase">Your Conversations</h3>
              <p className="text-sm text-on-surface-variant font-bold mt-2 max-w-xs leading-relaxed italic">
                Select a recruiter or student from the sidebar to start a real-time professional chat.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
