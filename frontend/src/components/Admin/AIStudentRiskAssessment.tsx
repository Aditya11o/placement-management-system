import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    AlertTriangle, 
    ChevronRight, 
    Mail, 
    UserCheck, 
    BrainCircuit, 
    TrendingUp, 
    ShieldAlert,
    MessageSquare,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import Card from '../Card/Card';
import Button from '../Button/Button';
import { useToast } from '../../context/ToastContext';

interface StudentRiskData {
    _id: string;
    name: string;
    email: string;
    branch: string;
    cgpa: number;
    riskScore: number;
    aiAnalysis: {
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        reasoning: string;
        suggestedInterventions: string[];
    };
}

const AIStudentRiskAssessment: React.FC = () => {
    const { addToast } = useToast();

    const { data: riskData, isLoading, refetch } = useQuery({
        queryKey: ['ai-risk-assessment'],
        queryFn: async () => {
            const res = await api.get('/admin/analytics/ai-risk-assessment');
            return res.data.data as StudentRiskData[];
        }
    });

    const handleIntervene = (studentName: string, action: string) => {
        addToast(`Intervention triggered: ${action} for ${studentName}`, 'success');
        // In a real app, this would call an API to send email/notification
    };

    if (isLoading) {
        return (
            <Card className="p-12 flex flex-col items-center justify-center gap-4 bg-slate-50/50 dark:bg-slate-900/50 border-dashed border-2">
                <div className="relative">
                    <BrainCircuit size={48} className="text-indigo-500 animate-pulse" />
                    <Loader2 size={20} className="absolute -bottom-1 -right-1 text-indigo-600 animate-spin" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">AI Engine Warming Up...</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Synthesizing academic profiles and application history for deep risk analysis.</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white m-0">AI At-Risk Matrix</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Predictive intelligence identifying students requiring immediate intervention.</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" icon={BrainCircuit} onClick={() => refetch()}>
                    Recalculate Insights
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {riskData?.map((student) => (
                    <Card key={student._id} className="overflow-hidden border-none shadow-lg group hover:ring-2 hover:ring-indigo-500/30 transition-all">
                        <div className={`h-1.5 w-full ${
                            student.aiAnalysis.riskLevel === 'CRITICAL' ? 'bg-red-500' :
                            student.aiAnalysis.riskLevel === 'HIGH' ? 'bg-orange-500' : 'bg-amber-500'
                        }`} />
                        
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white m-0">{student.name}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-black tracking-tighter">
                                        {student.branch} • CGPA: {student.cgpa}
                                    </p>
                                </div>
                                <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    student.aiAnalysis.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                    student.aiAnalysis.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                }`}>
                                    {student.aiAnalysis.riskLevel} RISK
                                </div>
                            </div>

                            {/* AI Reasoning */}
                            <div className="mb-5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl p-4 border border-indigo-100/50 dark:border-indigo-800/30 relative">
                                <div className="absolute -top-2 -left-2 w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                                    <BrainCircuit size={14} />
                                </div>
                                <p className="text-sm italic text-slate-600 dark:text-indigo-300 leading-relaxed m-0">
                                    "{student.aiAnalysis.reasoning}"
                                </p>
                            </div>

                            {/* Intervention Strategies */}
                            <div className="space-y-3 mb-6">
                                <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp size={12} /> Suggested Interventions
                                </h4>
                                <div className="space-y-2">
                                    {student.aiAnalysis.suggestedInterventions.map((strat, idx) => (
                                        <div key={idx} className="flex items-start gap-2 group/strat">
                                            <div className="mt-1 flex-shrink-0">
                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                            </div>
                                            <div className="flex-1 flex items-center justify-between gap-4">
                                                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{strat}</span>
                                                <button 
                                                    onClick={() => handleIntervene(student.name, strat)}
                                                    className="opacity-0 group-hover/strat:opacity-100 transition-opacity p-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded text-indigo-600 dark:text-indigo-400"
                                                    title="Trigger this action"
                                                >
                                                    <ChevronRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <Button 
                                    variant="primary" 
                                    size="sm" 
                                    className="flex-1"
                                    icon={Mail}
                                    onClick={() => handleIntervene(student.name, 'Send Warning Email')}
                                >
                                    Email Student
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="flex-1"
                                    icon={MessageSquare}
                                    onClick={() => handleIntervene(student.name, 'Chat Outreach')}
                                >
                                    Live Chat
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {(!riskData || riskData.length === 0) && (
                <div className="p-20 text-center bg-slate-50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                    <UserCheck size={48} className="text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Maximum Efficiency Detected</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        All students currently meet the placement engagement threshold. The AI engine is monitoring for any signs of regression.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AIStudentRiskAssessment;
