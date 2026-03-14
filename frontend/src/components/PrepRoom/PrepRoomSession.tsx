import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Video, VideoOff, Mic, MicOff, ScreenShare, MessageSquare, 
    Send, Users, PenTool, Eraser, Trash2, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

interface Participant {
    userId: string;
    userDetails: {
        name: string;
        profile_image_url?: string;
    };
    socketId: string;
}

interface Message {
    senderId: string;
    userDetails: { name: string };
    text: string;
    sent_at: Date;
}

const PrepRoomSession: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const { socket } = useSocket();
    const navigate = useNavigate();
    
    // UI State
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [activeTool, setActiveTool] = useState<'pen' | 'eraser'>('pen');
    const [color, setColor] = useState('#6366f1');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Media Refs
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideosRef = useRef<Record<string, HTMLVideoElement>>({});
    const localStreamRef = useRef<MediaStream | null>(null);
    const peerConnections = useRef<Record<string, RTCPeerConnection>>({});
    
    // Whiteboard Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const isDrawing = useRef(false);

    // ── Setup Media ───────────────────────────────────────────────────────────
    const setupMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (err) {
            console.error('Error accessing media devices:', err);
            return null;
        }
    }, []);

    // ── WebRTC Signaling ──────────────────────────────────────────────────────
    const createPeerConnection = useCallback((targetSocketId: string, stream: MediaStream) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('prep:signal', {
                    roomId: id,
                    targetId: targetSocketId,
                    signal: { type: 'candidate', candidate: event.candidate }
                });
            }
        };

        pc.ontrack = (event) => {
            const remoteStream = event.streams[0];
            const videoElement = remoteVideosRef.current[targetSocketId];
            if (videoElement) {
                videoElement.srcObject = remoteStream;
            }
        };

        return pc;
    }, [id, socket]);

    useEffect(() => {
        if (!id || !user || !socket) return;

        const init = async () => {
            const stream = await setupMedia();
            if (!stream) return;

            // Join the room
            socket.emit('prep:join_room', {
                roomId: id,
                userDetails: { name: user.name, profile_image_url: (user as any).profile_image_url }
            });

            // Handle New Peer
            socket.on('prep:peer_joined', async (peer: Participant) => {
                setParticipants(prev => {
                    if (prev.find(p => p.socketId === peer.socketId)) return prev;
                    return [...prev, peer];
                });

                // As the newcomer or existing peer, we need to establish connection
                const pc = createPeerConnection(peer.socketId, stream);
                peerConnections.current[peer.socketId] = pc;

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                socket.emit('prep:signal', {
                    roomId: id,
                    targetId: peer.socketId,
                    signal: { type: 'offer', offer }
                });
            });

            // Handle Incoming Signals
            socket.on('prep:signal', async (data: { senderSocketId: string, signal: any }) => {
                const { senderSocketId, signal } = data;

                let pc = peerConnections.current[senderSocketId];
                if (!pc) {
                    pc = createPeerConnection(senderSocketId, stream);
                    peerConnections.current[senderSocketId] = pc;
                }

                if (signal.type === 'offer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(signal.offer));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.emit('prep:signal', {
                        roomId: id,
                        targetId: senderSocketId,
                        signal: { type: 'answer', answer }
                    });
                } else if (signal.type === 'answer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(signal.answer));
                } else if (signal.type === 'candidate') {
                    await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
                }
            });

            // Handle Chat & Whiteboard
            socket.on('prep:message', (msg: Message) => setMessages(prev => [...prev, msg]));
            
            socket.on('prep:draw_update', (data: { drawingData: any }) => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                const { x, y, lastX, lastY, color, width, tool } = data.drawingData;
                // Convert relative points (0-1) back to absolute pixels
                drawOnCanvas(
                    x * canvas.width, 
                    y * canvas.height, 
                    lastX * canvas.width, 
                    lastY * canvas.height, 
                    color, 
                    width, 
                    tool, 
                    false
                );
            });
        };

        init();

        return () => {
            socket.off('prep:peer_joined');
            socket.off('prep:signal');
            socket.off('prep:message');
            socket.off('prep:draw_update');
            localStreamRef.current?.getTracks().forEach(track => track.stop());
            Object.values(peerConnections.current).forEach(pc => {
                if (pc instanceof RTCPeerConnection) pc.close();
            });
        };
    }, [id, user, socket, createPeerConnection, setupMedia]);

    // ── Whiteboard Logic ──────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Responsive canvas size
        const parent = canvas.parentElement;
        if (parent) {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            contextRef.current = ctx;
        }
    }, [color]);

    const drawOnCanvas = (x: number, y: number, lastX: number, lastY: number, drawColor: string, width: number, tool: string, emit = true) => {
        if (!contextRef.current) return;
        
        contextRef.current.beginPath();
        contextRef.current.strokeStyle = tool === 'eraser' ? '#ffffff' : drawColor;
        contextRef.current.lineWidth = width;
        contextRef.current.moveTo(lastX, lastY);
        contextRef.current.lineTo(x, y);
        contextRef.current.stroke();
        contextRef.current.closePath();

        if (emit && socket && canvasRef.current) {
            const canvas = canvasRef.current;
            socket.emit('prep:draw', {
                roomId: id,
                drawingData: { 
                    x: x / canvas.width, 
                    y: y / canvas.height, 
                    lastX: lastX / canvas.width, 
                    lastY: lastY / canvas.height, 
                    color: drawColor, 
                    width, 
                    tool 
                }
            });
        }
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        isDrawing.current = true;
        const pos = getPos(e);
        lastPos.current = pos;
    };

    const lastPos = useRef({ x: 0, y: 0 });

    const getPos = (e: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing.current) return;
        const currentPos = getPos(e);
        drawOnCanvas(currentPos.x, currentPos.y, lastPos.current.x, lastPos.current.y, color, activeTool === 'eraser' ? 20 : 3, activeTool);
        lastPos.current = currentPos;
    };

    const stopDrawing = () => {
        isDrawing.current = false;
    };

    // ── Chat Logic ────────────────────────────────────────────────────────────
    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !socket) return;
        socket.emit('prep:message', {
            roomId: id,
            text: inputText,
            userDetails: { name: user?.name }
        });
        setInputText('');
    };

    // ── Controls ──────────────────────────────────────────────────────────────
    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            setIsVideoOn(!isVideoOn);
        }
    };

    const toggleAudio = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsAudioOn(!isAudioOn);
        }
    };

    const clearCanvas = () => {
        if (!canvasRef.current || !contextRef.current) return;
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    const leaveRoom = () => {
        navigate('/student/prep-rooms');
    };

    return (
        <div className="flex h-screen bg-slate-900 overflow-hidden font-sans">
            {/* Main Stage */}
            <div className="flex-1 flex flex-col relative">
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 bg-slate-900 border-b border-slate-800 z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Users className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Collab Session</h2>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-slate-400">LIVE SYNC ACTIVE</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-800 rounded-2xl p-1 border border-slate-700">
                            <button 
                                onClick={() => setActiveTool('pen')}
                                className={`p-2 rounded-xl transition-all ${activeTool === 'pen' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                <PenTool size={18} />
                            </button>
                            <button 
                                onClick={() => setActiveTool('eraser')}
                                className={`p-2 rounded-xl transition-all ${activeTool === 'eraser' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Eraser size={18} />
                            </button>
                            <div className="w-px h-6 bg-slate-700 mx-1 my-auto" />
                            <button 
                                onClick={clearCanvas}
                                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all font-black text-[10px] flex items-center gap-2"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <button 
                            onClick={leaveRoom}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl font-black text-xs hover:bg-red-600 hover:text-white transition-all"
                        >
                            <LogOut size={16} /> END SESSION
                        </button>
                    </div>
                </div>

                {/* Content Area: Whiteboard & Grid */}
                <div className="flex-1 relative flex">
                    {/* Collaborative Whiteboard */}
                    <div className="flex-1 bg-white relative cursor-crosshair">
                        <canvas 
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseOut={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="absolute inset-0 w-full h-full"
                        />
                        <div className="absolute bottom-6 left-6 flex flex-col gap-3">
                            <div className="p-2 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-2">
                                {['#6366f1', '#e11d48', '#059669', '#000000'].map(c => (
                                    <button 
                                        key={c}
                                        onClick={() => { setColor(c); setActiveTool('pen'); }}
                                        className={`w-6 h-6 rounded-full transition-transform ${color === c && activeTool === 'pen' ? 'scale-125 ring-2 ring-white/50' : 'hover:scale-110'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Participant Video Grid (Overlay or Side) */}
                    <div className="w-72 bg-slate-900 border-l border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-2">Video Streams</div>
                        
                        {/* Local User */}
                        <div className="relative aspect-video bg-slate-800 rounded-3xl overflow-hidden border-2 border-indigo-600 shadow-2xl group">
                            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                            <div className="absolute bottom-3 left-3 px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-full text-[10px] font-black text-white border border-white/10">
                                YOU (HOST)
                            </div>
                            <div className="absolute top-3 right-3 flex gap-2">
                                {!isVideoOn && <div className="p-1.5 bg-red-600 rounded-lg text-white"><VideoOff size={12} /></div>}
                                {!isAudioOn && <div className="p-1.5 bg-red-600 rounded-lg text-white"><MicOff size={12} /></div>}
                            </div>
                        </div>

                        {/* Remote Peers */}
                        {participants.map((p) => (
                            <div key={p.socketId} className="relative aspect-video bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 group hover:border-indigo-400 transition-colors shadow-lg">
                                <video 
                                    ref={el => { if (el) remoteVideosRef.current[p.socketId] = el; }} 
                                    autoPlay 
                                    playsInline 
                                    className="w-full h-full object-cover" 
                                />
                                <div className="absolute bottom-3 left-3 px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-full text-[10px] font-black text-white border border-white/10">
                                    {p.userDetails.name}
                                </div>
                            </div>
                        ))}

                        {/* Control Bar */}
                        <div className="mt-auto flex justify-center gap-3 p-4 bg-slate-800/80 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl">
                            <button 
                                onClick={toggleVideo}
                                className={`p-3 rounded-2xl transition-all ${isVideoOn ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-red-600 text-white'}`}
                            >
                                {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
                            </button>
                            <button 
                                onClick={toggleAudio}
                                className={`p-3 rounded-2xl transition-all ${isAudioOn ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-red-600 text-white'}`}
                            >
                                {isAudioOn ? <Mic size={18} /> : <MicOff size={18} />}
                            </button>
                            <button className="p-3 bg-slate-700 text-white rounded-2xl hover:bg-slate-600 transition-all">
                                <ScreenShare size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar: Chat */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div 
                        initial={{ x: 350 }}
                        animate={{ x: 0 }}
                        exit={{ x: 350 }}
                        className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col z-30 shadow-2xl"
                    >
                        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="text-indigo-500" size={18} />
                                <span className="text-xs font-black text-white uppercase tracking-widest">Session Feed</span>
                            </div>
                            <button onClick={() => setIsSidebarOpen(false)} className="text-slate-500 hover:text-white uppercase text-[8px] font-black tracking-widest">Hide</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex flex-col ${m.senderId === user?._id ? 'items-end' : 'items-start'}`}>
                                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">
                                        {m.senderId === user?._id ? 'You' : m.userDetails.name} • {new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className={`px-4 py-2.5 rounded-2xl text-xs font-bold leading-relaxed max-w-[90%] ${
                                        m.senderId === user?._id 
                                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/10' 
                                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                    }`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={sendMessage} className="p-4 bg-slate-900 border-t border-slate-800">
                            <div className="relative">
                                <input 
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    placeholder="Type a group message..."
                                    className="w-full pl-4 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-xs font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                                />
                                <button type="submit" className="absolute right-2 top-1.5 p-2 text-indigo-500 hover:bg-slate-700 rounded-xl transition-all">
                                    <Send size={16} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isSidebarOpen && (
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="fixed right-6 bottom-24 p-4 bg-indigo-600 text-white rounded-full shadow-2xl z-40 hover:scale-110 transition-transform"
                >
                    <MessageSquare size={24} />
                </button>
            )}
        </div>
    );
};

export default PrepRoomSession;
