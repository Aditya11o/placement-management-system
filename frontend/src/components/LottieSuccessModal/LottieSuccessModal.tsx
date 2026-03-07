import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { X } from 'lucide-react';

// Basic inline success JSON for demonstration (A clean scaling checkmark)
// In a real production app, you might fetch this from a URL or import a larger local JSON
const successAnimationData = {
    "v": "5.5.2",
    "fr": 60,
    "ip": 0,
    "op": 60,
    "w": 400,
    "h": 400,
    "nm": "Success Check",
    "ddd": 0,
    "assets": [],
    "layers": [
        {
            "ddd": 0,
            "ind": 1,
            "ty": 4,
            "nm": "Check",
            "sr": 1,
            "ks": {
                "o": { "a": 0, "k": 100, "ix": 11 },
                "r": { "a": 0, "k": 0, "ix": 10 },
                "p": { "a": 0, "k": [200, 200, 0], "ix": 2 },
                "a": { "a": 0, "k": [0, 0, 0], "ix": 1 },
                "s": {
                    "a": 1,
                    "k": [
                        { "i": { "x": [0.2], "y": [1] }, "o": { "x": [0.4], "y": [0] }, "t": 0, "s": [0, 0, 100] },
                        { "i": { "x": [0.2], "y": [1] }, "o": { "x": [0.4], "y": [0] }, "t": 20, "s": [110, 110, 100] },
                        { "t": 35, "s": [100, 100, 100] }
                    ],
                    "ix": 6
                }
            },
            "ao": 0,
            "shapes": [
                {
                    "ty": "gr",
                    "it": [
                        {
                            "ind": 0,
                            "ty": "sh",
                            "ix": 1,
                            "ks": {
                                "a": 1,
                                "k": [
                                    { "i": { "x": 0.833, "y": 0.833 }, "o": { "x": 0.167, "y": 0.167 }, "t": 10, "s": [{ "i": [[0, 0], [0, 0], [0, 0]], "o": [[0, 0], [0, 0], [0, 0]], "v": [[-40, 0], [-40, 0], [-40, 0]], "c": false }] },
                                    { "t": 25, "s": [{ "i": [[0, 0], [0, 0], [0, 0]], "o": [[0, 0], [0, 0], [0, 0]], "v": [[-40, 5], [-10, 35], [50, -25]], "c": false }] }
                                ],
                                "ix": 2
                            },
                            "nm": "Path 1",
                            "mn": "ADBE Vector Shape - Group",
                            "hd": false
                        },
                        {
                            "ty": "st",
                            "c": { "a": 0, "k": [0.188, 0.733, 0.353, 1], "ix": 3 },
                            "o": { "a": 0, "k": 100, "ix": 4 },
                            "w": { "a": 0, "k": 18, "ix": 5 },
                            "lc": 2,
                            "lj": 2,
                            "bm": 0,
                            "nm": "Stroke 1",
                            "mn": "ADBE Vector Graphic - Stroke",
                            "hd": false
                        },
                        {
                            "ty": "tr",
                            "p": { "a": 0, "k": [0, 0], "ix": 2 },
                            "a": { "a": 0, "k": [0, 0], "ix": 1 },
                            "s": { "a": 0, "k": [100, 100], "ix": 3 },
                            "r": { "a": 0, "k": 0, "ix": 6 },
                            "o": { "a": 0, "k": 100, "ix": 7 },
                            "sk": { "a": 0, "k": 0, "ix": 4 },
                            "sa": { "a": 0, "k": 0, "ix": 5 },
                            "nm": "Transform"
                        }
                    ],
                    "nm": "Shape 1",
                    "np": 3,
                    "cix": 2,
                    "bm": 0,
                    "ix": 1,
                    "mn": "ADBE Vector Group",
                    "hd": false
                }
            ]
        },
        {
            "ddd": 0,
            "ind": 2,
            "ty": 4,
            "nm": "Circle",
            "sr": 1,
            "ks": {
                "o": { "a": 0, "k": 100, "ix": 11 },
                "r": { "a": 0, "k": 0, "ix": 10 },
                "p": { "a": 0, "k": [200, 200, 0], "ix": 2 },
                "a": { "a": 0, "k": [0, 0, 0], "ix": 1 },
                "s": {
                    "a": 1,
                    "k": [
                        { "i": { "x": [0.2], "y": [1] }, "o": { "x": [0.4], "y": [0] }, "t": 0, "s": [0, 0, 100] },
                        { "i": { "x": [0.2], "y": [1] }, "o": { "x": [0.4], "y": [0] }, "t": 15, "s": [110, 110, 100] },
                        { "t": 25, "s": [100, 100, 100] }
                    ],
                    "ix": 6
                }
            },
            "ao": 0,
            "shapes": [
                {
                    "ty": "gr",
                    "it": [
                        {
                            "d": 1,
                            "ty": "el",
                            "s": { "a": 0, "k": [160, 160], "ix": 2 },
                            "p": { "a": 0, "k": [0, 0], "ix": 3 },
                            "nm": "Ellipse Path 1",
                            "mn": "ADBE Vector Shape - Ellipse",
                            "hd": false
                        },
                        {
                            "ty": "fl",
                            "c": { "a": 0, "k": [0.91, 0.98, 0.94, 1], "ix": 4 },
                            "o": { "a": 0, "k": 100, "ix": 5 },
                            "nm": "Fill 1",
                            "mn": "ADBE Vector Graphic - Fill",
                            "hd": false
                        },
                        {
                            "ty": "tr",
                            "p": { "a": 0, "k": [0, 0], "ix": 2 },
                            "a": { "a": 0, "k": [0, 0], "ix": 1 },
                            "s": { "a": 0, "k": [100, 100], "ix": 3 },
                            "r": { "a": 0, "k": 0, "ix": 6 },
                            "o": { "a": 0, "k": 100, "ix": 7 },
                            "sk": { "a": 0, "k": 0, "ix": 4 },
                            "sa": { "a": 0, "k": 0, "ix": 5 },
                            "nm": "Transform"
                        }
                    ],
                    "nm": "Ellipse 1",
                    "np": 3,
                    "cix": 2,
                    "bm": 0,
                    "ix": 1,
                    "mn": "ADBE Vector Group",
                    "hd": false
                }
            ]
        }
    ]
};

interface LottieSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    buttonText?: string;
    autoCloseDelay?: number; // Close automatically after ms (0 to disable)
}

const LottieSuccessModal: React.FC<LottieSuccessModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    buttonText = "Continue",
    autoCloseDelay = 0
}) => {

    useEffect(() => {
        if (isOpen && autoCloseDelay > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDelay);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoCloseDelay, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Premium backdrop with heavy blur and gradient overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl pointer-events-none"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-white/20 dark:border-slate-700/50"
            >
                {/* Close Button X */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10 p-1"
                >
                    <X size={20} />
                </button>

                {/* Ambient glow behind animation */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col items-center text-center p-8 pt-10">
                    {/* The Lottie Animation */}
                    <div className="w-32 h-32 mb-6 -mt-4 relative">
                        <Lottie
                            animationData={successAnimationData}
                            loop={false}
                            autoplay={true}
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>

                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl font-black text-slate-800 dark:text-white mb-2"
                    >
                        {title}
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-slate-500 dark:text-slate-400 mb-8 px-4"
                    >
                        {description}
                    </motion.p>

                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        onClick={onClose}
                        className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
                    >
                        {buttonText}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default LottieSuccessModal;
