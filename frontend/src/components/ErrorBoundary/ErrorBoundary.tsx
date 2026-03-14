import React, { ErrorInfo, ReactNode } from 'react';
import Card from '../Card/Card';
import Button from '../Button/Button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import * as Sentry from '@sentry/react';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        if (import.meta.env.VITE_SENTRY_DSN) {
            Sentry.captureException(error, { extra: errorInfo as unknown as Record<string, unknown> });
        }
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen w-screen bg-slate-950 p-8 box-border relative overflow-hidden">
                    {/* Animated Mesh Background */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 blur-[120px] rounded-full animate-pulse" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="z-10 w-full max-w-[540px]"
                    >
                        <Card className="text-center py-16 px-10 flex flex-col items-center gap-8 border-white/5 bg-slate-900/40 backdrop-blur-3xl shadow-2xl">
                            <div className="relative">
                                <motion.div 
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                    className="bg-red-500/10 rounded-3xl p-6 border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)]"
                                >
                                    <AlertCircle size={56} className="text-red-500" />
                                </motion.div>
                                <div className="absolute -inset-4 bg-red-500/5 blur-2xl rounded-full -z-10" />
                            </div>

                            <div className="space-y-3">
                                <h1 className="text-white m-0 text-3xl font-black tracking-tight uppercase">System Fault Detected</h1>
                                <p className="text-slate-400 m-0 leading-relaxed text-base font-medium">
                                    A critical module encountered an unexpected state. Our neural diagnostic tools have been alerted.
                                </p>
                            </div>

                            {import.meta.env.MODE === 'development' && (
                                <div className="bg-black/40 p-5 rounded-2xl w-full text-left border border-white/5 backdrop-blur-sm">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Error Protocol Output:</div>
                                    <code className="text-red-400 text-xs font-mono break-all leading-relaxed">
                                        {this.state.error?.toString() || "Unknown Interrupt Exception"}
                                    </code>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                <Button 
                                    variant="primary" 
                                    icon={RefreshCw} 
                                    onClick={this.handleReload} 
                                    className="w-full action-glow-indigo font-black uppercase text-xs tracking-widest h-14"
                                >
                                    Force Reboot
                                </Button>
                                <Button 
                                    variant="secondary" 
                                    icon={Home} 
                                    onClick={this.handleGoHome} 
                                    className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 font-black uppercase text-xs tracking-widest h-14"
                                >
                                    Abort to Core
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
