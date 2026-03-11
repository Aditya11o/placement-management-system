import React, { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import Button from '../Button/Button';
import Card from '../Card/Card';

interface ScorecardFormProps {
    onSubmit: (data: {
        communication: number;
        technical: number;
        culture: number;
        overall: number;
        round_name: string;
        recommendation: 'HIRE' | 'NO_HIRE' | 'MAYBE';
        comments: string;
    }) => void;
    isSubmitting: boolean;
}

const StarRating = ({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className="p-1 -ml-1 hover:scale-110 transition-transform focus:outline-none"
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => onChange(star)}
                    >
                        <Star
                            size={24}
                            className={`transition-colors ${
                                star <= (hover || value)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-transparent text-slate-300 dark:text-slate-600'
                            }`}
                        />
                    </button>
                ))}
                <span className="ml-2 text-sm font-bold text-slate-400 w-4">{value > 0 ? value : '-'}</span>
            </div>
        </div>
    );
};

const ScorecardForm: React.FC<ScorecardFormProps> = ({ onSubmit, isSubmitting }) => {
    const [communication, setCommunication] = useState(0);
    const [technical, setTechnical] = useState(0);
    const [culture, setCulture] = useState(0);
    const [overall, setOverall] = useState(0);
    const [roundName, setRoundName] = useState('Technical 1');
    const [recommendation, setRecommendation] = useState<'HIRE' | 'NO_HIRE' | 'MAYBE'>('MAYBE');
    const [comments, setComments] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ 
            communication, 
            technical, 
            culture, 
            overall, 
            round_name: roundName, 
            recommendation, 
            comments 
        });
    };

    const isComplete = communication > 0 && technical > 0 && culture > 0 && overall > 0;

    const rounds = ['Screening', 'Technical 1', 'Technical 2', 'Managerial', 'HR', 'Final'];

    return (
        <Card className="p-6 bg-slate-50/50 dark:bg-slate-800/20 border-slate-200/60 dark:border-slate-700/50 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <Star size={20} className="fill-current" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Interview Scorecard</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Evaluate candidate across key dimensions</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Interview Round</label>
                        <select 
                            value={roundName}
                            onChange={(e) => setRoundName(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {rounds.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Recommendation</label>
                        <div className="flex gap-2">
                            {(['HIRE', 'MAYBE', 'NO_HIRE'] as const).map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRecommendation(r)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                                        recommendation === r 
                                            ? r === 'HIRE' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none' :
                                              r === 'NO_HIRE' ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-200 dark:shadow-none' :
                                              'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200 dark:shadow-none'
                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                                    }`}
                                >
                                    {r === 'HIRE' ? 'Hire' : r === 'NO_HIRE' ? 'No Hire' : 'Maybe'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <StarRating label="Communication & Soft Skills" value={communication} onChange={setCommunication} />
                    <StarRating label="Technical Proficiency" value={technical} onChange={setTechnical} />
                    <StarRating label="Culture & Team Fit" value={culture} onChange={setCulture} />
                    
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                        <StarRating label="Overall Rating" value={overall} onChange={setOverall} />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <MessageSquare size={16} className="text-slate-400" />
                        Detailed Feedback
                    </label>
                    <textarea
                        className="w-full h-24 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                        placeholder="Provide specific notes from the interview..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                    />
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                    <Button
                        type="submit"
                        disabled={!isComplete || isSubmitting}
                        isLoading={isSubmitting}
                        variant="primary"
                    >
                        Submit Evaluation
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default ScorecardForm;
