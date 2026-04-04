import React from 'react';
import { Award, Plus, Edit2, Trash2 } from 'lucide-react';

interface SkillsProjectsSectionProps {
  skills: string[];
  newSkill: string;
  student: any;
  onNewSkillChange: (value: string) => void;
  onAddSkill: (e: React.KeyboardEvent) => void;
  onRemoveSkill: (skill: string) => void;
  onVerify: (skill: string) => void;
  onEditProject: (project: any) => void;
  onDeleteProject: (projectId: string) => void;
  onAddProject: () => void;
}

const SkillsProjectsSection: React.FC<SkillsProjectsSectionProps> = ({
  skills, newSkill, student, onNewSkillChange, onAddSkill, onRemoveSkill,
  onVerify, onEditProject, onDeleteProject, onAddProject
}) => {
  return (
    <div className="col-span-12">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-50 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Award size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Skills & Projects</h3>
          </div>
          <button 
            onClick={onAddProject}
            className="bg-blue-950 text-white px-5 py-2 rounded-xl font-bold text-xs hover:bg-black transition-all flex items-center gap-2 shadow-md hover:scale-105 active:scale-95"
          >
            <Plus size={14} /> Add Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 block">Technical Skills</label>
            <div className="flex flex-wrap gap-2 mb-4 p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
              {skills.map((skill, i) => {
                const verification = student.verifiedSkills?.find((v: any) => v.skill === skill);
                return (
                  <div key={i} className="flex flex-col gap-1 items-start">
                    <div className="flex items-center gap-1.5 bg-blue-950 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm animate-in zoom-in duration-300">
                      {skill}
                      <button onClick={() => onRemoveSkill(skill)} className="hover:text-red-300 transition-colors">
                        <Plus size={12} className="rotate-45" />
                      </button>
                    </div>
                    {verification ? (
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        verification.status === 'Verified' ? 'text-emerald-600 bg-emerald-50' : 
                        verification.status === 'Rejected' ? 'text-rose-600 bg-rose-50' : 'text-amber-600 bg-amber-50'
                      }`}>
                        {verification.status}
                      </span>
                    ) : (
                      <button 
                        onClick={() => onVerify(skill)}
                        className="text-[9px] font-bold text-blue-600 hover:underline uppercase px-1.5"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                );
              })}
              <input 
                type="text" 
                placeholder="Type and press enter..." 
                className="flex-1 bg-transparent text-xs font-semibold outline-none min-w-[150px] py-1"
                value={newSkill}
                onChange={(e) => onNewSkillChange(e.target.value)}
                onKeyDown={onAddSkill}
              />
            </div>
          </div>

          <div className="md:col-span-7">
            {student.projects?.map((project: any, i: number) => (
              <div key={i} className="bg-gray-50/50 border border-gray-100 p-6 rounded-2xl relative group hover:border-blue-100 hover:bg-blue-50/30 transition-all mb-4">
                <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-bold text-gray-900">{project.title}</h4>
                    {(project.startDate || project.endDate) && (
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                        {project.startDate && new Date(project.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                        {project.startDate && project.endDate && ' — '}
                        {project.endDate && new Date(project.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEditProject(project)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit Project"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => onDeleteProject(project._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies?.map((tech: string, j: number) => (
                    <span key={j} className="px-2.5 py-1 bg-blue-100/50 text-blue-700 text-[10px] font-bold uppercase rounded-md tracking-wide">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {!student.projects?.length && (
              <p className="text-gray-400 italic text-sm text-center py-10">No projects added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsProjectsSection;
