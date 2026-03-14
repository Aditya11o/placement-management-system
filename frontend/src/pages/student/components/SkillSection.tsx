import React from 'react';
import Card from '../../../components/Card/Card';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import { Code, X, Plus, Sparkles, Loader2 } from 'lucide-react';

interface SkillSectionProps {
    isEditing: boolean;
    skills: string[];
    newSkill: string;
    setNewSkill: (skill: string) => void;
    handleAddSkill: () => void;
    handleRemoveSkill: (skill: string) => void;
    suggestedSkills: string[];
    isSuggestionsLoading: boolean;
    setSkills: (skills: string[]) => void;
}

const SkillSection: React.FC<SkillSectionProps> = ({
    isEditing,
    skills,
    newSkill,
    setNewSkill,
    handleAddSkill,
    handleRemoveSkill,
    suggestedSkills,
    isSuggestionsLoading,
    setSkills
}) => {
    return (
        <Card className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                <Code className="text-orange-500" size={24} />
                <h2 className="text-lg m-0 font-bold">Technical Skills</h2>
            </div>
            <p className="text-slate-500 text-sm block mb-6">Add relevant skills to improve your AI Job Matching score.</p>

            <div className="flex flex-wrap gap-2">
                {skills?.map((skill, index) => (
                    <div key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-sm font-medium transition-colors hover:bg-indigo-100">
                        {skill}
                        {isEditing && (
                            <button className="bg-transparent border-none flex items-center justify-center text-indigo-500 cursor-pointer rounded-full p-0.5 hover:bg-indigo-200 hover:text-red-500" onClick={() => handleRemoveSkill(skill)}>
                                <X size={14} />
                            </button>
                        )}
                    </div>
                ))}
                {skills?.length === 0 && !isEditing && (
                    <p className="text-slate-500 text-sm block mb-1">No skills added yet.</p>
                )}
            </div>

            {isEditing && (
                <>
                    <div className="flex items-end gap-2 mt-6 mb-8">
                        <div className="w-[250px]">
                            <Input
                                placeholder="e.g. React.js, Python, AWS"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                                fullWidth={true}
                            />
                        </div>
                        <div className="mb-[16px]">
                            <Button type="button" variant="secondary" onClick={handleAddSkill} icon={Plus}>Add</Button>
                        </div>
                    </div>

                    {suggestedSkills.length > 0 && (
                        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="text-indigo-500 w-4 h-4" />
                                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">AI Suggested Skills</span>
                                {isSuggestionsLoading && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {suggestedSkills.filter(s => !skills.includes(s)).map((skill, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setSkills([...skills, skill])}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-indigo-100 text-slate-600 rounded-full text-xs font-medium hover:border-indigo-400 hover:text-indigo-600 hover:shadow-sm transition-all animate-fade-in"
                                    >
                                        <Plus size={12} />
                                        {skill}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </Card>
    );
};

export default SkillSection;
