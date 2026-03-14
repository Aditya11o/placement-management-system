import React from 'react';
import { BookOpen, ExternalLink, Clock, Lightbulb } from 'lucide-react';
import { getResourcesForSkill } from '../../utils/skillResources';
import { motion } from 'framer-motion';

interface SkillGapRoadmapProps {
    missingSkills: string[];
}

const SkillGapRoadmap: React.FC<SkillGapRoadmapProps> = ({ missingSkills }) => {
    if (missingSkills.length === 0) return null;

    return (
        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                    <Lightbulb size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 m-0">Bridge the Gap</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 m-0 uppercase tracking-wider font-semibold">AI-Curated Learning Roadmap</p>
                </div>
            </div>

            <div className="space-y-6">
                {missingSkills.map((skill, index) => {
                    const resources = getResourcesForSkill(skill);
                    return (
                        <motion.div 
                            key={skill}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm"
                        >
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                {skill}
                            </h4>
                            <div className="space-y-2.5">
                                {resources.map((resource) => (
                                    <a
                                        key={resource.url}
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:bg-white dark:hover:bg-slate-800 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-white dark:bg-slate-800 rounded shadow-sm text-indigo-500 group-hover:text-indigo-600">
                                                <BookOpen size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 m-0">{resource.title}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                                        {resource.type}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                                        <Clock size={10} /> {resource.effort}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <ExternalLink size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                    </a>
                                ))}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-6 p-4 bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10 rounded-xl">
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 m-0">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1">Pro-Tip:</span>
                    Adding these skills to your profile after completing the roadmap will automatically increase your AI Match Score for similar job roles.
                </p>
            </div>
        </div>
    );
};

export default SkillGapRoadmap;
