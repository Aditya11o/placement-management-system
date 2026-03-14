import React, { useState } from 'react';
import { Plus, Trash2, Send, ChevronRight, ChevronLeft, Building, Briefcase, Award } from 'lucide-react';
import Button from '../Button/Button';
import Input from '../Input/Input';
import TagInput from '../Input/TagInput';
import { useToast } from '../../context/ToastContext';
import { experienceService } from '../../services/experienceService';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '../Modal/Modal';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareExperienceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ShareExperienceModal: React.FC<ShareExperienceModalProps> = ({ isOpen, onClose }) => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        company_name: '',
        role: '',
        difficulty: 'Medium',
        verdict: 'Selected',
        is_anonymous: true,
        tips: '',
        rounds: [{ name: 'Technical Round 1', details: '', questions: [] as string[] }]
    });

    const addRound = () => {
        setFormData({
            ...formData,
            rounds: [...formData.rounds, { name: `Round ${formData.rounds.length + 1}`, details: '', questions: [] }]
        });
    };

    const removeRound = (index: number) => {
        setFormData({
            ...formData,
            rounds: formData.rounds.filter((_, i) => i !== index)
        });
    };

    const handleRoundChange = (index: number, field: string, value: any) => {
        const newRounds = [...formData.rounds];
        (newRounds[index] as any)[field] = value;
        setFormData({ ...formData, rounds: newRounds });
    };

    const handleSubmit = async () => {
        if (!formData.company_name || !formData.role) {
            addToast('Company name and role are required', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await experienceService.shareExperience(formData);
            addToast('Thank you for sharing your experience!', 'success');
            queryClient.invalidateQueries({ queryKey: ['experiences'] });
            onClose();
            // Reset for next time
            setStep(1);
            setFormData({
                company_name: '',
                role: '',
                difficulty: 'Medium',
                verdict: 'Selected',
                is_anonymous: true,
                tips: '',
                rounds: [{ name: 'Technical Round 1', details: '', questions: [] }]
            });
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to share experience', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Share Interview Journey" 
            size="lg"
        >
            <div className="flex flex-col h-[600px]">
                {/* Progress Bar */}
                <div className="flex h-1.5 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <motion.div 
                        initial={{ width: '33%' }}
                        animate={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
                        className="h-full bg-indigo-600"
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input 
                                        label="Company Name" 
                                        placeholder="e.g. Google" 
                                        icon={Building}
                                        value={formData.company_name}
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                    />
                                    <Input 
                                        label="Target Role" 
                                        placeholder="e.g. Software Engineer Intern" 
                                        icon={Briefcase}
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Difficulty</label>
                                        <div className="flex gap-2">
                                            {['Easy', 'Medium', 'Hard'].map((d) => (
                                                <button 
                                                    key={d}
                                                    className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${formData.difficulty === d ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'}`}
                                                    onClick={() => setFormData({ ...formData, difficulty: d })}
                                                >
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Verdict</label>
                                        <select 
                                            className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500"
                                            value={formData.verdict}
                                            onChange={(e) => setFormData({ ...formData, verdict: e.target.value })}
                                        >
                                            <option value="Selected">Selected</option>
                                            <option value="Rejected">Rejected</option>
                                            <option value="Waitlisted">Waitlisted</option>
                                            <option value="In Progress">In Progress</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-slate-100 m-0 flex items-center gap-2">
                                            Post Anonymously <Award size={16} className="text-indigo-500" />
                                        </p>
                                        <p className="text-xs text-slate-500 m-0 mt-0.5">Your name will be hidden from other students.</p>
                                    </div>
                                    <button 
                                        className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.is_anonymous ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                        onClick={() => setFormData({ ...formData, is_anonymous: !formData.is_anonymous })}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${formData.is_anonymous ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 m-0 uppercase tracking-tight">Interview Rounds</h3>
                                    <Button variant="ghost" size="sm" icon={Plus} onClick={addRound}>Add Round</Button>
                                </div>

                                {formData.rounds.map((round, index) => (
                                    <div key={index} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4 relative group">
                                        {formData.rounds.length > 1 && (
                                            <button 
                                                className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors"
                                                onClick={() => removeRound(index)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                        <Input 
                                            label={`Round ${index + 1} Name`} 
                                            placeholder="e.g. Technical Coding Round"
                                            value={round.name}
                                            onChange={(e) => handleRoundChange(index, 'name', e.target.value)}
                                        />
                                        <textarea 
                                            placeholder="What happened in this round? (e.g. Discussed projects, 2 DS questions...)"
                                            className="w-full p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none focus:border-indigo-500 transition-all font-medium text-sm text-slate-700 dark:text-slate-300"
                                            rows={3}
                                            value={round.details}
                                            onChange={(e) => handleRoundChange(index, 'details', e.target.value)}
                                        />
                                        <TagInput 
                                            label="Questions Asked" 
                                            placeholder="Type a question and press enter..."
                                            value={round.questions}
                                            onChange={(tags) => handleRoundChange(index, 'questions', tags)}
                                        />
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div 
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center py-4">
                                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                        <Send size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0">Final Preparation Tips</h3>
                                    <p className="text-slate-500 mt-1">Any advice for students applying next year?</p>
                                </div>

                                <textarea 
                                    placeholder="e.g. Focus deeply on OS/Networking for this company. Don't forget to ask about team culture at the end."
                                    className="w-full h-64 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:border-indigo-500 transition-all font-medium text-lg text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm"
                                    value={formData.tips}
                                    onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center shrink-0">
                    <Button 
                        variant="secondary" 
                        icon={ChevronLeft} 
                        onClick={() => setStep(prev => prev - 1)}
                        disabled={step === 1}
                    >
                        Back
                    </Button>
                    
                    {step < 3 ? (
                        <Button 
                            variant="primary" 
                            className="px-8 font-black bg-indigo-600"
                            onClick={() => setStep(prev => prev + 1)}
                        >
                            Continue <ChevronRight size={18} className="ml-2" />
                        </Button>
                    ) : (
                        <Button 
                            variant="primary" 
                            className="px-10 font-black bg-gradient-to-r from-indigo-600 to-violet-600 border-none shadow-xl shadow-indigo-200 dark:shadow-none"
                            onClick={handleSubmit}
                            isLoading={isSubmitting}
                        >
                            Publish Experience <Send size={18} className="ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ShareExperienceModal;
