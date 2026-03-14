import React from 'react';
import { Check, Clock, CircleDot, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export type TimelineStatus = 'pending' | 'active' | 'completed' | 'error';

export interface TimelineStep {
    label: string;
    description?: string;
    status: TimelineStatus;
    icon?: LucideIcon;
    date?: string;
}

interface ApplicationTimelineProps {
    steps: TimelineStep[];
}

const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({ steps }) => {
    return (
        <div className="flex flex-col gap-4 w-full py-4">
            {steps.map((step, index) => {
                const isLast = index === steps.length - 1;
                
                let StatusIcon = CircleDot;
                let strokeClass = "border-slate-300 dark:border-slate-600";
                let textClass = "text-slate-500 dark:text-slate-400";
                let bgClass = "bg-white dark:bg-slate-800";
                
                if (step.status === 'completed') {
                    StatusIcon = Check;
                    strokeClass = "border-emerald-500";
                    textClass = "text-emerald-700 dark:text-emerald-400";
                    bgClass = "bg-emerald-50 dark:bg-emerald-500/20";
                } else if (step.status === 'active') {
                    StatusIcon = Clock;
                    strokeClass = "border-indigo-500";
                    textClass = "text-indigo-700 dark:text-indigo-400 font-medium";
                    bgClass = "bg-indigo-50 dark:bg-indigo-500/20";
                } else if (step.status === 'error') {
                    StatusIcon = CircleDot;
                    strokeClass = "border-red-500";
                    textClass = "text-red-700 dark:text-red-400";
                    bgClass = "bg-red-50 dark:bg-red-500/20";
                }

                if (step.icon) {
                    StatusIcon = step.icon;
                }

                return (
                    <div key={index} className="flex gap-4 relative">
                        {/* Line connecting nodes */}
                        {!isLast && (
                            <div 
                                className={`absolute left-[15px] top-[30px] bottom-[-20px] w-[2px] ${step.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} 
                            />
                        )}
                        
                        {/* Node */}
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${strokeClass} ${bgClass}`}
                        >
                            <StatusIcon size={14} className={textClass} />
                        </motion.div>
                        
                        {/* Content */}
                        <div className="flex flex-col pb-6 pt-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className={`text-sm tracking-wide ${textClass}`}>{step.label}</span>
                                {step.date && (
                                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                        {step.date}
                                    </span>
                                )}
                            </div>
                            {step.description && (
                                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[250px] leading-relaxed">
                                    {step.description}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ApplicationTimeline;
