import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Brain, Sparkles, TrendingUp, AlertCircle, X, Play, Square, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService, InterviewAnalysis } from '../../services/aiService';
import Button from '../Button/Button';
import Card from '../Card/Card';

interface ProfessionalInterviewSimProps {
    jobTitle: string;
    question: string;
    onClose: () => void;
}

const ProfessionalInterviewSim: React.FC<ProfessionalInterviewSimProps> = ({ jobTitle, question, onClose }) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [analysis, setAnalysis] = useState<InterviewAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const recognitionRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);

    // Initialize WebRTC and Speech Recognition
    const initMedia = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            // Audio Visualizer setup
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(mediaStream);
            const analyzer = audioContext.createAnalyser();
            analyzer.fftSize = 256;
            source.connect(analyzer);
            
            audioContextRef.current = audioContext;
            analyzerRef.current = analyzer;

            const updateVolume = () => {
                if (!analyzerRef.current) return;
                const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
                analyzerRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;
                setAudioLevel(average);
                requestAnimationFrame(updateVolume);
            };
            updateVolume();

            // Speech Recognition setup
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onresult = (event: any) => {
                    let interimTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            setTranscript(prev => prev + event.results[i][0].transcript + ' ');
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }
                };

                recognition.onerror = (event: any) => {
                    console.error('Recognition error:', event.error);
                    if (event.error === 'no-speech') return;
                    setError(`Speech recognition error: ${event.error}`);
                };

                recognitionRef.current = recognition;
            } else {
                setError('Speech recognition is not supported in this browser.');
            }

        } catch (err: any) {
            console.error('Media init error:', err);
            setError('Could not access camera/microphone. Please check permissions.');
        }
    }, []);

    useEffect(() => {
        initMedia();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [initMedia]);

    const startSession = () => {
        setTranscript('');
        setAnalysis(null);
        setIsRecording(true);
        recognitionRef.current?.start();
    };

    const stopAndAnalyze = async () => {
        setIsRecording(false);
        recognitionRef.current?.stop();
        
        if (transcript.length < 10) {
            setError('Response too short to analyze. Please speak more!');
            return;
        }

        setIsAnalyzing(true);
        try {
            const result = await aiService.analyzeInterviewResponse({ question, transcript });
            setAnalysis(result);
        } catch (err) {
            setError('AI Analysis failed. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 text-white overflow-hidden relative">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Brain size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold m-0 tracking-tight">High-Stakes Mode</h3>
                        <p className="text-[10px] text-slate-400 m-0 uppercase font-black tracking-widest">{jobTitle}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 flex items-center gap-3"
                    >
                        <AlertCircle size={16} className="text-red-400" />
                        <p className="text-xs font-semibold text-red-100 m-0">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto text-[10px] font-bold underline text-white">Dismiss</button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-6 gap-6">
                {/* Main Viewport: Video & Interaction */}
                <div className="flex-[3] flex flex-col gap-6 relative">
                    <div className="relative flex-1 bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 ring-1 ring-white/10 group">
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            muted 
                            playsInline 
                            className="w-full h-full object-cover scale-x-[-1]"
                        />
                        
                        {/* Audio Bar Overlay */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-1 px-4 py-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 h-12">
                            {[...Array(20)].map((_, i) => (
                                <motion.div 
                                    key={i}
                                    animate={{ height: isRecording ? Math.min(40, (audioLevel / 255) * 40 * (Math.random() + 0.5)) : 2 }}
                                    className="w-1 bg-indigo-400 rounded-full"
                                />
                            ))}
                        </div>

                        {/* Question Overlay */}
                        <div className="absolute top-6 left-6 right-6 p-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg">
                            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Current Question</p>
                            <h2 className="text-lg font-bold leading-relaxed">{question}</h2>
                        </div>

                        {/* Rec Label */}
                        {isRecording && (
                            <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-red-600 rounded-full shadow-lg shadow-red-600/20">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                <span className="text-[10px] font-black tracking-widest uppercase">Recording</span>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-4 py-2">
                        {!isRecording && !analysis && (
                            <Button size="lg" className="px-12 py-6 rounded-full font-black text-lg bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/20" onClick={startSession}>
                                <Play size={20} className="mr-3" /> Start Response
                            </Button>
                        )}
                        {isRecording && (
                            <Button size="lg" className="px-12 py-6 rounded-full font-black text-lg bg-slate-100 text-slate-950 hover:bg-white animate-pulse" onClick={stopAndAnalyze} disabled={isAnalyzing}>
                                {isAnalyzing ? <div className="h-5 w-5 border-2 border-slate-950 border-t-transparent animate-spin rounded-full mr-3" /> : <Square size={20} className="mr-3" />}
                                Finish & Analyze
                            </Button>
                        )}
                        {analysis && (
                            <Button size="lg" variant="secondary" className="px-12 py-6 rounded-full font-black text-lg border-2 border-slate-700 bg-slate-800" onClick={startSession}>
                                <div className="mr-3 flex items-center justify-center">
                                    <RotateCcw size={20} />
                                </div> Try Again
                            </Button>
                        )}
                    </div>
                </div>

                {/* Sidebar: STAR Coach & Analysis */}
                <div className="flex-1 w-full lg:w-96 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1">
                    {/* STAR Indicator Card */}
                    <Card className="bg-slate-900/40 border-slate-800 p-6">
                        <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
                            <Sparkles size={14} className="text-indigo-400" /> STAR Method Coach
                        </h4>
                        
                        <div className="grid grid-cols-4 gap-3 mb-6">
                            {['S', 'T', 'A', 'R'].map((letter) => {
                                const isActive = analysis?.star_status[letter as keyof typeof analysis.star_status];
                                return (
                                    <div key={letter} className="flex flex-col items-center gap-2">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border transition-all duration-500 ${
                                            analysis 
                                            ? isActive 
                                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                                            : 'bg-slate-800 border-slate-700 text-slate-600'
                                        }`}>
                                            {letter}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">{
                                            letter === 'S' ? 'Sit' : letter === 'T' ? 'Task' : letter === 'A' ? 'Act' : 'Res'
                                        }</span>
                                    </div>
                                );
                            })}
                        </div>

                        {analysis && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                                <p className="text-[11px] font-medium text-slate-300 leading-relaxed italic m-0">
                                    "{analysis.star_feedback}"
                                </p>
                            </motion.div>
                        )}
                    </Card>

                    {/* Speech Metrics Dashboard */}
                    <Card className="bg-slate-900/40 border-slate-800 p-6">
                        <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
                            <TrendingUp size={14} className="text-emerald-400" /> Speech Performance
                        </h4>

                        <div className="space-y-6">
                            {/* Confidence Score */}
                            <div>
                                <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-2">
                                    <span>CONFIDENCE SCORE</span>
                                    <span className="text-white">{analysis?.metrics.confidence || 0}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${analysis?.metrics.confidence || 0}%` }}
                                        className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                                    <span className="text-[10px] font-bold text-slate-500 block mb-1 uppercase">Fillers</span>
                                    <span className="text-xl font-black text-white">{analysis?.metrics.filler_count || 0}</span>
                                    <span className="text-[10px] text-slate-400 block mt-1">Found in speech</span>
                                </div>
                                <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                                    <span className="text-[10px] font-bold text-slate-500 block mb-1 uppercase">Pace</span>
                                    <span className="text-xs font-bold text-white line-clamp-2">{analysis?.metrics.pace_feedback || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Pro Tip Card */}
                    <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-xl shadow-indigo-900/20 relative overflow-hidden group">
                        <Volume2 className="absolute -right-4 -bottom-4 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" size={120} />
                        <h4 className="text-sm font-black text-white mb-2 flex items-center gap-2">
                            <AlertCircle size={16} /> Expert Coach Tip
                        </h4>
                        <p className="text-xs text-indigo-100 font-medium leading-relaxed relative z-10 m-0">
                            "Remember to smile and maintain eye contact with the lens, not the screen. It builds trust instantly."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RotateCcw = ({ size, className }: { size: number; className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
    </svg>
);

export default ProfessionalInterviewSim;
