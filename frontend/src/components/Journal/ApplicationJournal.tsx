import React, { useState } from 'react';
import { Book, CheckSquare, Plus, Trash2, Save, X, Lightbulb, ChevronRight, Clock, Video } from 'lucide-react';
import InterviewSimulator from '../Interview/InterviewSimulator';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import { useToast } from '../../context/ToastContext';
import { studentService } from '../../services/studentService';

interface ChecklistItem {
    _id?: string;
    task: string;
    completed: boolean;
    category: 'GENERAL' | 'TECHNICAL' | 'HR' | 'RESOURCES';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface ApplicationJournalProps {
    applicationId: string;
    initialNotes: string;
    initialChecklist: ChecklistItem[];
    jobTitle?: string;
    jobDescription?: string;
    jobSkills?: string[];
    onClose: () => void;
    onUpdate?: () => void;
}

const ApplicationJournal: React.FC<ApplicationJournalProps> = ({ 
    applicationId, 
    initialNotes, 
    initialChecklist, 
    jobTitle,
    jobDescription,
    jobSkills,
    onClose,
    onUpdate
}) => {
    const { addToast } = useToast();
    const [notes, setNotes] = useState(initialNotes || '');
    const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist || []);
    const [newTask, setNewTask] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'NOTES' | 'CHECKLIST'>('NOTES');
    const [isSimOpen, setIsSimOpen] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await studentService.updateApplicationJournal(applicationId, {
                student_notes: notes,
                checklists: checklist
            });
            addToast('Journal updated successfully!', 'success');
            if (onUpdate) onUpdate();
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to update journal', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const addTask = () => {
        if (!newTask.trim()) return;
        const item: ChecklistItem = {
            task: newTask,
            completed: false,
            category: 'GENERAL',
            priority: 'MEDIUM'
        };
        setChecklist([...checklist, item]);
        setNewTask('');
    };

    const toggleTask = (index: number) => {
        const newChecklist = [...checklist];
        newChecklist[index].completed = !newChecklist[index].completed;
        setChecklist(newChecklist);
    };

    const removeTask = (index: number) => {
        setChecklist(checklist.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <Book size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white m-0">Prep Journal</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Your private preparation space</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="primary" 
                        size="sm" 
                        icon={Save} 
                        onClick={handleSave} 
                        isLoading={isSaving}
                    >
                        Save
                    </Button>
                    {jobTitle && (
                        <Button 
                            variant="primary" 
                            size="sm" 
                            icon={Video} 
                            onClick={() => setIsSimOpen(true)}
                            className="bg-indigo-600 border-none shadow-md"
                        >
                            Mock Interview
                        </Button>
                    )}
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex px-6 pt-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <button 
                    onClick={() => setActiveTab('NOTES')}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'NOTES' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    <Book size={16} /> Notes
                </button>
                <button 
                    onClick={() => setActiveTab('CHECKLIST')}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'CHECKLIST' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    <CheckSquare size={16} /> Prep Checklist
                    {checklist.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded-full">
                            {checklist.filter(t => t.completed).length}/{checklist.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">
                {activeTab === 'NOTES' ? (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 p-4 rounded-xl flex gap-3">
                            <Lightbulb className="text-amber-500 shrink-0" size={20} />
                            <p className="text-xs text-amber-800 dark:text-amber-400 m-0 leading-relaxed font-medium">
                                Technical interviews often focus on your specific projects. Use these notes to draft your 'STAR' method responses and keep track of key talking points.
                            </p>
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Start typing your preparation notes here... (e.g., Round 1 technical focus, company values, recruiter feedback)"
                            className="w-full h-[300px] p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none resize-none transition-all shadow-sm dark:text-slate-200 font-medium leading-relaxed"
                        />
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Add Task Input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                                placeholder="Add a preparation task (e.g., Review Data Structures)"
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-indigo-500 outline-none transition-all dark:text-slate-200 shadow-sm"
                            />
                            <Button variant="primary" icon={Plus} onClick={addTask} disabled={!newTask.trim()}>Add</Button>
                        </div>

                        {/* Task List */}
                        <div className="space-y-2">
                            {checklist.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                                    <Clock size={32} className="mx-auto text-slate-300 mb-3" />
                                    <p className="text-sm font-bold text-slate-400 m-0 uppercase tracking-widest">No preparation tasks yet</p>
                                </div>
                            ) : (
                                checklist.map((item, index) => (
                                    <div 
                                        key={index}
                                        className={`flex items-center justify-between p-4 rounded-xl border hover:shadow-md transition-all group ${item.completed ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/50 opacity-60' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => toggleTask(index)}
                                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 dark:border-slate-600 hover:border-indigo-400'}`}
                                            >
                                                {item.completed && <CheckSquare size={14} />}
                                            </button>
                                            <span className={`text-sm font-bold ${item.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {item.task}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => removeTask(index)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Tip */}
            <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <ChevronRight size={14} className="text-indigo-500" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest m-0">
                    Journal data is private and only visible to you.
                </p>
            </div>
            {/* Interview Simulator Modal */}
            <Modal
                isOpen={isSimOpen}
                onClose={() => setIsSimOpen(false)}
                title="Interview Practice"
                size="lg"
            >
                <div className="h-[600px]">
                    {jobTitle && (
                        <InterviewSimulator 
                            jobTitle={jobTitle}
                            jobDescription={jobDescription}
                            skills={jobSkills}
                            onClose={() => setIsSimOpen(false)}
                        />
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default ApplicationJournal;
