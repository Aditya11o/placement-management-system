import React from 'react';
import Card from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import { 
    Code, Briefcase, Plus, X, Globe, Github, 
    Building, Trophy, Rocket
} from 'lucide-react';
import { Project, Internship } from '../../../types';

interface ProfessionalHistoryProps {
    isEditing: boolean;
    projects: Project[];
    internships: Internship[];
    setProjects: (projects: Project[]) => void;
    setInternships: (internships: Internship[]) => void;
}

const ProfessionalHistory: React.FC<ProfessionalHistoryProps> = ({ 
    isEditing, 
    projects, 
    internships, 
    setProjects, 
    setInternships 
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 col-span-1 lg:col-span-2">
            
            {/* Internship Life-path */}
            <Card className="p-10 rounded-[3.5rem] border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden relative group">
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <Briefcase className="text-emerald-500" size={24} />
                        <h2 className="text-2xl m-0 font-black italic tracking-tight uppercase">Career <br />Timeline.</h2>
                    </div>
                    {isEditing && (
                        <Button 
                            variant="secondary" 
                            className="rounded-2xl h-12 font-black text-[10px] uppercase tracking-widest italic" 
                            icon={Plus}
                            onClick={() => setInternships([...internships, { company: 'New Company', role: 'Role', description: '' }])}
                        >
                            Add Experience
                        </Button>
                    )}
                </div>

                <div className="space-y-12 relative">
                    <div className="absolute left-[23px] top-2 bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800" />
                    
                    {internships.length === 0 && (
                        <div className="text-center py-20">
                             <Rocket size={48} className="text-slate-200 mx-auto mb-4" />
                             <p className="text-xs text-slate-400 font-bold uppercase italic tracking-widest">No internship data indexed.</p>
                        </div>
                    )}

                    {internships.map((intern, idx) => (
                        <div key={idx} className="relative pl-16 group/item">
                            <div className="absolute left-[15px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 shadow-xl group-hover/item:scale-150 transition-all z-10" />
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        {isEditing ? (
                                            <div className="flex flex-col gap-3 max-w-sm">
                                                <input 
                                                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-black uppercase italic"
                                                    value={intern.role}
                                                    placeholder="Role (e.g. SDE Intern)"
                                                    onChange={(e) => {
                                                        const updated = [...internships];
                                                        updated[idx].role = e.target.value;
                                                        setInternships(updated);
                                                    }}
                                                />
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-slate-400">@</span>
                                                    <input 
                                                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-black uppercase italic text-emerald-600"
                                                        value={intern.company}
                                                        placeholder="Company Name"
                                                        onChange={(e) => {
                                                            const updated = [...internships];
                                                            updated[idx].company = e.target.value;
                                                            setInternships(updated);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-black text-slate-800 dark:text-white m-0 italic uppercase tracking-tight leading-tight">{intern.role}</h3>
                                                <div className="flex items-center gap-3 text-emerald-600 font-black text-[10px] uppercase tracking-widest italic">
                                                     <Building size={14} /> {intern.company}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {isEditing && (
                                        <button onClick={() => setInternships(internships.filter((_, i) => i !== idx))} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                                
                                {isEditing ? (
                                    <textarea 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs font-bold leading-relaxed resize-none h-24 italic"
                                        placeholder="Outline your impact and key deliverables..."
                                        value={intern.description}
                                        onChange={(e) => {
                                            const updated = [...internships];
                                            updated[idx].description = e.target.value;
                                            setInternships(updated);
                                        }}
                                    />
                                ) : (
                                    <p className="text-sm text-slate-500 font-bold leading-relaxed italic m-0 border-l-2 border-emerald-500/10 pl-4">{intern.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Project Artifacts Section */}
            <Card className="p-10 rounded-[3.5rem] border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 group">
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <Code className="text-indigo-500" size={24} />
                        <h2 className="text-2xl m-0 font-black italic tracking-tight uppercase">Project <br />Artifacts.</h2>
                    </div>
                    {isEditing && (
                         <Button 
                            variant="secondary" 
                            className="rounded-2xl h-12 font-black text-[10px] uppercase tracking-widest italic" 
                            icon={Plus}
                            onClick={() => setProjects([...projects, { title: 'New Portfolio Asset', description: '', technologies: [] }])}
                        >
                            Deploy Project
                        </Button>
                    )}
                </div>

                <div className="space-y-8">
                    {projects.length === 0 && (
                        <div className="text-center py-20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                             <Trophy size={48} className="text-slate-100 mx-auto mb-4" />
                             <p className="text-[10px] text-slate-400 font-black uppercase italic tracking-widest">No projects currently staged.</p>
                        </div>
                    )}

                    {projects.map((project, idx) => (
                        <div key={idx} className={`p-8 rounded-[2.5rem] border-2 transition-all relative group/card ${
                            isEditing ? 'bg-white dark:bg-slate-800 border-indigo-100 dark:border-slate-700' : 'bg-slate-50 dark:bg-slate-800/10 border-transparent hover:border-indigo-500'
                        }`}>
                             <div className="flex justify-between items-start mb-6">
                                  <div className="flex-1">
                                       {isEditing ? (
                                           <input 
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-black uppercase italic"
                                                value={project.title}
                                                placeholder="Project Identity"
                                                onChange={(e) => {
                                                    const updated = [...projects];
                                                    updated[idx].title = e.target.value;
                                                    setProjects(updated);
                                                }}
                                            />
                                       ) : (
                                           <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                                                     <Rocket size={20} />
                                                </div>
                                                <h3 className="text-xl font-black text-slate-800 dark:text-white m-0 italic uppercase tracking-tight">{project.title}</h3>
                                           </div>
                                       )}
                                  </div>
                                  {isEditing && (
                                        <button onClick={() => setProjects(projects.filter((_, i) => i !== idx))} className="ml-4 p-2 text-slate-400 hover:text-red-500">
                                            <X size={18} />
                                        </button>
                                    )}
                             </div>

                             {isEditing ? (
                                <textarea 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs font-bold leading-relaxed resize-none h-24 mb-6 italic"
                                    placeholder="Brief technical summary and your primary role..."
                                    value={project.description}
                                    onChange={(e) => {
                                        const updated = [...projects];
                                        updated[idx].description = e.target.value;
                                        setProjects(updated);
                                    }}
                                />
                            ) : (
                                <p className="text-sm text-slate-500 font-bold leading-relaxed italic mb-8">{project.description}</p>
                            )}

                            <div className="flex flex-wrap gap-2">
                                {project.technologies?.map((tech: string, tIdx: number) => (
                                    <span key={tIdx} className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[9px] font-black text-indigo-600 uppercase tracking-widest italic">{tech}</span>
                                ))}
                            </div>
                            
                            {!isEditing && (
                                <div className="absolute bottom-8 right-8 flex gap-3 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                     <button 
                                        className="p-3 bg-white dark:bg-slate-900 text-slate-400 hover:text-indigo-600 rounded-xl shadow-premium transition-all"
                                        onClick={() => project.link && window.open(project.link, '_blank')}
                                    >
                                          <Github size={18} />
                                     </button>
                                     <button 
                                        className="p-3 bg-indigo-600 text-white hover:bg-slate-900 rounded-xl shadow-premium transition-all"
                                        onClick={() => project.link && window.open(project.link, '_blank')}
                                    >
                                          <Globe size={18} />
                                     </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default ProfessionalHistory;
