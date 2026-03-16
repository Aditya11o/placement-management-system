import { motion } from 'framer-motion';
import { ShieldOff, Home, LogIn } from 'lucide-react';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';

const Unauthorized = () => {
    return (
        <div className="flex items-center justify-center min-h-screen w-screen bg-slate-950 p-8 box-border relative overflow-hidden">
            {/* Animated Mesh Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/15 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
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
                            animate={{ rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="bg-amber-500/10 rounded-3xl p-6 border border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.1)]"
                        >
                            <ShieldOff size={56} className="text-amber-400" />
                        </motion.div>
                        <div className="absolute -inset-4 bg-amber-500/5 blur-2xl rounded-full -z-10" />
                    </div>

                    <div className="space-y-2">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 m-0"
                        >
                            403
                        </motion.h1>
                        <h2 className="text-white m-0 text-2xl font-bold tracking-tight">Access Denied</h2>
                        <p className="text-slate-400 m-0 leading-relaxed text-base font-medium">
                            You don't have permission to access this resource. Contact your administrator if you believe this is a mistake.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <Button
                            variant="primary"
                            icon={Home}
                            onClick={() => window.location.href = '/'}
                            className="w-full action-glow-indigo font-bold text-xs tracking-widest h-14"
                        >
                            Go Home
                        </Button>
                        <Button
                            variant="secondary"
                            icon={LogIn}
                            onClick={() => window.location.href = '/login'}
                            className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 font-bold text-xs tracking-widest h-14"
                        >
                            Sign In
                        </Button>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default Unauthorized;
