import React from 'react';
import { Target, CheckCircle2, AlertCircle, Cpu } from 'lucide-react';

interface MatchBreakdownProps {
    score: number;
    jobSkills: string[];
    studentSkills: string[];
    jobMinCgpa?: number;
    studentCgpa?: number;
}

const MatchBreakdown: React.FC<MatchBreakdownProps> = ({
    score,
    jobSkills,
    studentSkills,
    jobMinCgpa,
    studentCgpa
}) => {
    const matchedSkills = jobSkills.filter(skill => 
        studentSkills.some(s => s.toLowerCase() === skill.toLowerCase())
    );
    const missingSkills = jobSkills.filter(skill => 
        !studentSkills.some(s => s.toLowerCase() === skill.toLowerCase())
    );

    const isCgpaMatched = jobMinCgpa && studentCgpa ? studentCgpa >= jobMinCgpa : true;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm overflow-hidden relative">
            {/* Background Decorative Element */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/10 dark:bg-indigo-400/10 blur-3xl rounded-full" />
            
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-600 dark:bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
                    <Cpu size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 m-0">AI Match Insights</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 m-0 uppercase tracking-wider font-semibold">Transparency Report</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Score Visualization */}
                <div className="flex flex-col items-center justify-center py-4">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-slate-100 dark:text-slate-700"
                            />
                            <circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={364.4}
                                strokeDashoffset={364.4 - (364.4 * score) / 100}
                                className={`${score >= 80 ? 'text-green-500' : score >= 50 ? 'text-indigo-500' : 'text-amber-500'} transition-all duration-1000 ease-out`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-3xl font-black text-slate-800 dark:text-white leading-none">{score}%</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mt-1">Match</span>
                        </div>
                    </div>
                </div>

                {/* Factors List */}
                <div className="space-y-5">
                    {/* CGPA Factor */}
                    <div className="flex items-start gap-3">
                        <div className={`mt-1 p-1 rounded-full ${isCgpaMatched ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                            {isCgpaMatched ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 m-0 leading-tight">Academic Eligibility</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 m-0">
                                {jobMinCgpa 
                                    ? `Required: ${jobMinCgpa} CGPA | Yours: ${studentCgpa || 'N/A'}` 
                                    : 'No minimum CGPA requirement identified.'}
                            </p>
                        </div>
                    </div>

                    {/* Skill Match Factor */}
                    <div className="flex items-start gap-3">
                        <div className={`mt-1 p-1 rounded-full ${matchedSkills.length > 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Target size={16} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 m-0 leading-tight">Skill Alignment</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {matchedSkills.map(skill => (
                                    <span key={skill} className="px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-md border border-green-100 dark:border-green-800/30">
                                        {skill}
                                    </span>
                                ))}
                                {missingSkills.length > 0 && (
                                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 italic flex items-center">
                                        + {missingSkills.length} missing skill{missingSkills.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Missing Skills Insights */}
            {missingSkills.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/50">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Improve your match score</p>
                    <div className="flex flex-wrap gap-2">
                        {missingSkills.slice(0, 3).map(skill => (
                            <div key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                {skill}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MatchBreakdown;
