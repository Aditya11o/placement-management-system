import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OfflineStatus: React.FC = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [showReconnected, setShowReconnected] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            setShowReconnected(true);
            setTimeout(() => setShowReconnected(false), 3000);
        };
        const handleOffline = () => {
            setIsOffline(true);
            setShowReconnected(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200]"
                >
                    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 text-red-500 rounded-lg animate-pulse">
                            <WifiOff size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold m-0 leading-tight">You are offline</p>
                            <p className="text-[10px] text-slate-400 m-0 uppercase tracking-widest font-bold">Limited functionality available</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {showReconnected && (
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200]"
                >
                    <div className="bg-emerald-600/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
                        <div className="p-2 bg-white/20 text-white rounded-lg">
                            <Wifi size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold m-0 leading-tight">Back online</p>
                            <p className="text-[10px] text-emerald-100 m-0 uppercase tracking-widest font-bold">Syncing latest updates</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OfflineStatus;
