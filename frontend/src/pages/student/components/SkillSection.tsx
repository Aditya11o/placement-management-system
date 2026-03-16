import React from 'react';
import Card from '../../../components/Card/Card';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import { Code, X, Plus, Sparkles, Loader2, Zap, Star, ShieldCheck } from 'lucide-react';

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
    // Mock categories for visual grouping
    const categories = [
        { name: 'Core Technology', icon: Code, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { name: 'Tools & Ecosystem', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { name: 'Soft Skills', icon: Star, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
    ];

    return (
        <Card className="col-span-1 lg:col-span-2 p-10 rounded-[3.5rem] border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 group">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <Code className="text-indigo-500" size={24} />
                    <h2 className="text-2xl m-0 font-black italic tracking-tight uppercase">Skill <br />Matrix.</h2>
                </div>
                {!isEditing && (
                     <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
                          <ShieldCheck size={16} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Verified Proficiency</span>
                     </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {categories.map((cat, idx) => {
                    // Simple heuristic for categorization if tags aren't explicitly typed
                    // In a real app, skills would have a 'category' field
                    const categorySkills = skills.filter((_, sIdx) => sIdx % 3 === idx);
                    
                    return (
                        <div key={idx} className="space-y-6">
                             <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${cat.bg} ${cat.color}`}>
                                       <cat.icon size={16} />
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{cat.name}</span>
                             </div>
                             
                             <div className="flex flex-wrap gap-3">
                                  {categorySkills.map((skill, sIdx) => (
                                       <div key={sIdx} className="group/skill relative">
                                            <div className={`px-4 py-2 rounded-2xl border-2 transition-all flex items-center gap-2 ${
                                                isEditing ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-500' : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:scale-105'
                                            }`}>
                                                 <span className="text-xs font-black italic uppercase tracking-tight text-slate-700 dark:text-slate-200">{skill}</span>
                                                 {isEditing && (
                                                      <button 
                                                        className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:bg-red-500 hover:text-white transition-all"
                                                        onClick={() => handleRemoveSkill(skill)}
                                                      >
                                                           <X size={10} />
                                                      </button>
                                                 )}
                                            </div>
                                            {/* Mock Proficiency Bar based on skill index/seed */}
                                            {!isEditing && (
                                                <div className="mt-2 flex gap-0.5">
                                                     {[1, 2, 3, 4, 5].map(p => {
                                                         const score = (skill.length % 5) + 1;
                                                         return (
                                                            <div key={p} className={`h-1 flex-1 rounded-full ${p <= score ? cat.bg.replace('/10', '') : 'bg-slate-100 dark:bg-slate-800'}`} />
                                                         );
                                                     })}
                                                </div>
                                            )}
                                       </div>
                                  ))}
                                  {categorySkills.length === 0 && <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-widest">No matching tags</p>}
                             </div>
                        </div>
                    );
                })}
            </div>

            {isEditing && (
                <div className="mt-12 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-end gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Add skill (e.g. React.js, Kubernetes...)"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                                className="h-16 rounded-[1.5rem] font-bold italic"
                            />
                        </div>
                        <Button variant="secondary" className="h-16 px-8 rounded-[1.5rem] font-black uppercase italic tracking-widest" onClick={handleAddSkill} icon={Plus}>Ingest Skill</Button>
                    </div>

                    {suggestedSkills.length > 0 && (
                        <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group/ai">
                             <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <Sparkles className="text-amber-400 animate-pulse" size={20} />
                                    <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">AI Optimization Cluster</span>
                                    {isSuggestionsLoading && <Loader2 className="w-4 h-4 animate-spin text-white/50" />}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {suggestedSkills.filter(s => !skills.includes(s)).map((skill, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setSkills([...skills, skill])}
                                            className="px-4 py-2 bg-white/10 hover:bg-white text-white hover:text-indigo-900 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic active:scale-95"
                                        >
                                            + {skill}
                                        </button>
                                    ))}
                                </div>
                             </div>
                             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px] -mr-16 -mt-16" />
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};

export default SkillSection;
