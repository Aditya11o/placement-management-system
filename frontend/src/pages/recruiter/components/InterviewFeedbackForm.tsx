import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, MessageSquare, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../../services/api';
import Button from '../../../components/Button/Button';
import { useToast } from '../../../context/ToastContext';

interface InterviewFeedbackProps {
    interviewId: string;
    studentName: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const scores_fields = [
    { key: 'technical', label: 'Technical Depth' },
    { key: 'communication', label: 'Communication Skills' },
    { key: 'problem_solving', label: 'Problem Solving' },
    { key: 'culture_fit', label: 'Culture Fit' },
    { key: 'overall', label: 'Overall Impression' }
];

const recommendation_options = [
    { value: 'STRONG_HIRE', label: 'Strong Hire', color: 'bg-emerald-500', text: 'text-emerald-700' },
    { value: 'HIRE', label: 'Hire', color: 'bg-green-500', text: 'text-green-700' },
    { value: 'HOLD', label: 'Hold / Waitlist', color: 'bg-amber-500', text: 'text-amber-700' },
    { value: 'NO_HIRE', label: 'No Hire', color: 'bg-orange-500', text: 'text-orange-700' },
    { value: 'STRONG_NO_HIRE', label: 'Strong No Hire', color: 'bg-red-500', text: 'text-red-700' }
];

const InterviewFeedbackForm: React.FC<InterviewFeedbackProps> = ({ interviewId, studentName, onSuccess, onCancel }) => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [scores, setScores] = useState<Record<string, number>>({
        technical: 3,
        communication: 3,
        problem_solving: 3,
        culture_fit: 3,
        overall: 3
    });
    const [comments, setComments] = useState('');
    const [recommendation, setRecommendation] = useState('HIRE');

    const submitMutation = useMutation({
        mutationFn: async () => {
            return api.post(`/interviews/${interviewId}/feedback`, {
                scores,
                comments,
                recommendation
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recruiterInterviews'] });
            addToast('Interview feedback submitted successfully', 'success');
            if (onSuccess) onSuccess();
        },
        onError: (err: any) => {
            addToast(err.response?.data?.message || 'Failed to submit feedback', 'error');
        }
    });

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 dark:border-slate-800 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Structured Feedback</h3>
                    <p className="text-xs text-slate-500">Evaluating <span className="font-bold text-slate-700 dark:text-slate-300">{studentName}</span></p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Score Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {scores_fields.map(field => (
                        <div key={field.key} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{field.label}</span>
                            <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setScores(prev => ({ ...prev, [field.key]: val }))}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${scores[field.key] >= val ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                    >
                                        <Star size={14} fill={scores[field.key] >= val ? 'currentColor' : 'none'} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recommendation */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Final Recommendation</label>
                    <div className="flex flex-wrap gap-2">
                        {recommendation_options.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setRecommendation(opt.value)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${recommendation === opt.value ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 border-indigo-600' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Qualitative Feedback */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Detailed Comments</label>
                    <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 text-slate-400" size={16} />
                        <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Provide specific notes on strengths, weaknesses, and key signals..."
                            rows={4}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none dark:text-slate-200"
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    {onCancel && (
                        <Button variant="ghost" className="flex-1" onClick={onCancel}>Cancel</Button>
                    )}
                    <Button
                        variant="primary"
                        className="flex-1"
                        icon={Save}
                        onClick={() => submitMutation.mutate()}
                        isLoading={submitMutation.isPending}
                    >
                        Submit Evaluation
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InterviewFeedbackForm;
