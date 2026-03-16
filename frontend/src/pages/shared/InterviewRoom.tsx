import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Mic, MicOff, Video, VideoOff, ScreenShare, PhoneOff, 
    Settings, MessageSquare, Timer, Users, 
    ShieldCheck, Briefcase, Loader2
} from 'lucide-react';
import { useWebRTC } from '../../hooks/useWebRTC';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface RoomData {
    room_id: string;
    job_title: string;
    student_name: string;
    recruiter_name: string;
    scheduled_at: string;
    duration: number;
}

const InterviewRoom: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [roomData, setRoomData] = useState<RoomData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    const {
        localVideoRef,
        remoteVideoRef,
        remoteStream,
        startLocalStream,
        toggleAudio,
        toggleVideo,
        shareScreen,
        isSharingScreen,
        endCall
    } = useWebRTC({
        roomId: roomData?.room_id || '',
        onSessionEnded: () => {
            addToast('Interview session has ended', 'info');
            navigate('/student/dashboard'); // Or recruiter dashboard based on role
        }
    });

    useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                const res = await api.get(`/interviews/${id}/join`);
                setRoomData(res.data.data);
                await startLocalStream();
            } catch (error: any) {
                addToast(error.response?.data?.message || 'Failed to join interview room', 'error');
                navigate(-1);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchRoomDetails();
    }, [id, startLocalStream, addToast, navigate]);

    // Timer logic
    useEffect(() => {
        if (!roomData) return;
        const interval = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [roomData]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleToggleAudio = () => {
        toggleAudio();
        setIsMuted(!isMuted);
    };

    const handleToggleVideo = () => {
        toggleVideo();
        setIsVideoOff(!isVideoOff);
    };

    const handleEndCall = () => {
        if (window.confirm('Are you sure you want to end this interview?')) {
            endCall();
            navigate(-1);
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-white">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-400 font-medium animate-pulse">Establishing secure connection...</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden font-sans">
            {/* Header */}
            <header className="h-16 px-6 flex items-center justify-between border-b border-white/10 bg-slate-900/50 backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Briefcase className="text-indigo-400" size={20} />
                    </div>
                    <div>
                        <h1 className="text-white font-bold leading-none">{roomData?.job_title}</h1>
                        <p className="text-slate-400 text-xs mt-1 flex items-center gap-2">
                            <Users size={12} /> {roomData?.student_name} vs {roomData?.recruiter_name}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/5">
                        <Timer size={16} className="text-amber-400" />
                        <span className="text-amber-400 font-mono font-bold text-sm">{formatTime(elapsedTime)}</span>
                        <span className="text-slate-500 text-xs font-medium ml-2">/ {roomData?.duration} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20 text-xs font-bold uppercase tracking-wider">
                        <ShieldCheck size={14} /> Encrypted
                    </div>
                </div>
            </header>

            {/* Video Canvas Area */}
            <main className="flex-1 relative p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Remote Peer (Main Spotlight) */}
                <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/5 flex items-center justify-center group">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    {!remoteStream && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm transition-all group-hover:bg-slate-900/60">
                            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4 animate-pulse">
                                <Users className="text-slate-600" size={40} />
                            </div>
                            <p className="text-slate-400 font-medium">Waiting for participant to join...</p>
                        </div>
                    )}
                    <div className="absolute bottom-6 left-6 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white text-sm font-medium border border-white/10">
                        {roomData?.recruiter_name} (Remote)
                    </div>
                </div>

                {/* Local Peer (Self View) */}
                <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/5 flex items-center justify-center group">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover -scale-x-100" // Mirror self view
                    />
                    {isVideoOff && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                                <VideoOff className="text-slate-600" size={40} />
                            </div>
                            <p className="text-slate-400 font-medium">Your camera is off</p>
                        </div>
                    )}
                    <div className="absolute bottom-6 left-6 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white text-sm font-medium border border-white/10">
                        {roomData?.student_name} (You)
                    </div>
                    {/* Overlay for screen sharing status */}
                    {isSharingScreen && (
                        <div className="absolute top-6 right-6 bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg animate-pulse">
                            <ScreenShare size={14} /> Sharing Screen
                        </div>
                    )}
                </div>

                {/* Mobile Floating PIP View (if implemented, but for now simple grid) */}
            </main>

            {/* Controls Bar */}
            <footer className="h-24 bg-slate-950 flex items-center justify-center px-8 z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleToggleAudio}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                    <button
                        onClick={handleToggleVideo}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    >
                        {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                    </button>

                    <div className="w-px h-10 bg-white/10 mx-2" />

                    <button
                        onClick={shareScreen}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isSharingScreen ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                        title="Share Screen"
                    >
                        <ScreenShare size={24} />
                    </button>

                    <button className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center transition-all">
                        <MessageSquare size={24} />
                    </button>

                    <button className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center transition-all">
                        <Settings size={24} />
                    </button>

                    <div className="w-px h-10 bg-white/10 mx-2" />

                    <button
                        onClick={handleEndCall}
                        className="px-8 h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl flex items-center gap-3 font-bold transition-all shadow-xl shadow-red-900/20"
                    >
                        <PhoneOff size={24} />
                        End Interview
                    </button>
                </div>
            </footer>

            {/* Side Info Panel (Optional) */}
        </div>
    );
};

export default InterviewRoom;
