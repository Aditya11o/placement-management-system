import React from 'react';
import { AlertCircle, ChevronRight, User } from 'lucide-react';
import Card from '../Card/Card';

interface RiskStudent {
    id: string;
    name: string;
    email: string;
    branch: string;
    riskScore: number;
    riskFactors: string[];
    level: 'CRITICAL' | 'MEDIUM' | 'LOW';
}

interface StudentRiskWidgetProps {
    students: RiskStudent[];
    isLoading?: boolean;
    onViewStudent?: (id: string) => void;
}

const StudentRiskWidget: React.FC<StudentRiskWidgetProps> = ({ students, isLoading, onViewStudent }) => {
    if (isLoading) {
        return (
            <Card className="flex flex-col h-[480px]">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white m-0">Risk Assessment</h3>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col h-[480px] overflow-hidden" hoverable>
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white m-0">Risk Assessment</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 m-0 mt-0.5">Students requiring immediate attention</p>
                </div>
                <span className="px-2 py-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded text-[10px] font-black uppercase tracking-wider border border-rose-100 dark:border-rose-500/20">
                    {students?.length || 0} Detained
                </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                {!students || students.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
                            <span className="text-emerald-500 text-xl font-bold">✓</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white mb-1">All clear!</p>
                        <p className="text-xs text-slate-500">No students currently flagged as high-risk.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {students.map((student) => (
                            <div 
                                key={student.id} 
                                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                                onClick={() => onViewStudent?.(student.id)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors shadow-sm">
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 m-0">{student.name}</h4>
                                            <p className="text-[11px] text-slate-500 m-0 uppercase tracking-wider font-semibold">{student.branch}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase ${
                                        student.level === 'CRITICAL' 
                                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                                            : student.level === 'MEDIUM'
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                            : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
                                    }`}>
                                        {student.level}
                                    </span>
                                </div>
                                <div className="space-y-1 ml-11">
                                    {student.riskFactors.slice(0, 2).map((factor, i) => (
                                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-rose-500/80 dark:text-rose-400/80 font-medium">
                                            <AlertCircle size={10} />
                                            {factor}
                                        </div>
                                    ))}
                                    {student.riskFactors.length > 2 && (
                                        <div className="text-[10px] text-slate-400 italic">+{student.riskFactors.length - 2} more factors</div>
                                    )}
                                </div>
                                <div className="mt-3 flex items-center justify-between ml-11">
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 relative overflow-hidden flex-1 max-w-[120px]">
                                        <div 
                                            className={`h-full transition-all duration-500 ${
                                                student.riskScore > 70 ? 'bg-rose-500' : student.riskScore > 40 ? 'bg-amber-500' : 'bg-indigo-500'
                                            }`}
                                            style={{ width: `${student.riskScore}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-indigo-500 transition-colors flex items-center gap-0.5 ml-2">
                                        Resolution Required <ChevronRight size={10} />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                <button className="text-[11px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.15em] hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">
                    Generate Intervention Report
                </button>
            </div>
        </Card>
    );
};

export default StudentRiskWidget;
