import React from 'react';
import Card from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import { Code, Briefcase, Plus, X } from 'lucide-react';
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
        <>
            {/* Projects Section */}
            <Card className="col-span-1 lg:col-span-2">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <Code className="text-indigo-500" size={24} />
                        <h2 className="text-lg m-0 font-bold">Key Projects</h2>
                    </div>
                    {isEditing && (
                        <Button 
                            size="sm" 
                            variant="secondary" 
                            icon={Plus}
                            onClick={() => setProjects([...projects, { title: 'New Project', description: '', technologies: [] }])}
                        >
                            Add Project
                        </Button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((project, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 group">
                            <div className="flex justify-between items-start mb-2">
                                {isEditing ? (
                                    <input 
                                        className="bg-white border border-slate-200 rounded px-2 py-1 text-sm font-bold w-full mr-2"
                                        value={project.title}
                                        onChange={(e) => {
                                            const updated = [...projects];
                                            updated[idx].title = e.target.value;
                                            setProjects(updated);
                                        }}
                                    />
                                ) : (
                                    <h3 className="text-sm font-bold text-slate-800 m-0">{project.title}</h3>
                                )}
                                {isEditing && (
                                    <button onClick={() => setProjects(projects.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 bg-transparent border-none cursor-pointer">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            {isEditing ? (
                                <textarea 
                                    className="bg-white border border-slate-200 rounded px-2 py-1 text-xs w-full h-20 mb-2 font-sans"
                                    placeholder="Describe your project, impact and role..."
                                    value={project.description}
                                    onChange={(e) => {
                                        const updated = [...projects];
                                        updated[idx].description = e.target.value;
                                        setProjects(updated);
                                    }}
                                />
                            ) : (
                                <p className="text-xs text-slate-600 mb-3 leading-relaxed">{project.description}</p>
                            )}
                            <div className="flex flex-wrap gap-1">
                                {project.technologies?.map((tech: string, tIdx: number) => (
                                    <span key={tIdx} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-500">{tech}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Internships Section */}
            <Card className="col-span-1 lg:col-span-2">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <Briefcase className="text-emerald-500" size={24} />
                        <h2 className="text-lg m-0 font-bold">Internship Experience</h2>
                    </div>
                    {isEditing && (
                        <Button 
                            size="sm" 
                            variant="secondary" 
                            icon={Plus}
                            onClick={() => setInternships([...internships, { company: 'Company Name', role: 'Role', description: '' }])}
                        >
                            Add Practice
                        </Button>
                    )}
                </div>
                <div className="space-y-4">
                    {internships.map((intern, idx) => (
                        <div key={idx} className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-emerald-100 group">
                            <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                            <div className="flex justify-between items-start mb-1">
                                <div>
                                    {isEditing ? (
                                        <div className="flex gap-2 mb-1">
                                            <input 
                                                className="bg-white border border-slate-200 rounded px-2 py-1 text-sm font-bold"
                                                value={intern.role}
                                                onChange={(e) => {
                                                    const updated = [...internships];
                                                    updated[idx].role = e.target.value;
                                                    setInternships(updated);
                                                }}
                                            />
                                            <span className="text-slate-300">@</span>
                                            <input 
                                                className="bg-white border border-slate-200 rounded px-2 py-1 text-sm font-bold"
                                                value={intern.company}
                                                onChange={(e) => {
                                                    const updated = [...internships];
                                                    updated[idx].company = e.target.value;
                                                    setInternships(updated);
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <h3 className="text-sm font-bold text-slate-800 m-0">{intern.role} <span className="text-emerald-600">@ {intern.company}</span></h3>
                                    )}
                                </div>
                                {isEditing && (
                                    <button onClick={() => setInternships(internships.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 bg-transparent border-none cursor-pointer">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            {isEditing ? (
                                <textarea 
                                    className="bg-white border border-slate-200 rounded px-2 py-1 text-xs w-full h-16 mt-2 font-sans"
                                    placeholder="What did you achieve during this internship?"
                                    value={intern.description}
                                    onChange={(e) => {
                                        const updated = [...internships];
                                        updated[idx].description = e.target.value;
                                        setInternships(updated);
                                    }}
                                />
                            ) : (
                                <p className="text-xs text-slate-600 leading-relaxed mb-0">{intern.description}</p>
                            )}
                        </div>
                    ))}
                </div>
            </Card>
        </>
    );
};

export default ProfessionalHistory;
