import { forwardRef } from 'react';
import { Mail, GraduationCap, Code, Briefcase, User, Award } from 'lucide-react';

interface ResumePreviewProps {
    student: any;
    user: any;
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ student, user }, ref) => {
    if (!student || !user) return null;

    return (
        <div 
            ref={ref}
            id="resume-document" 
            className="bg-white text-slate-900 p-8 sm:p-12 shadow-2xl max-w-[800px] mx-auto min-h-[1100px] print:shadow-none print:p-0 print:m-0 font-sans"
        >
            {/* Header */}
            <header className="border-b-4 border-indigo-600 pb-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter m-0">{user.name}</h1>
                    <p className="text-indigo-600 font-bold text-lg mt-1 m-0 uppercase tracking-widest">{student.branch} Student</p>
                </div>
                <div className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                        <Mail size={16} className="text-indigo-500" />
                        {user.email}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Left Column (Sidebar) */}
                <div className="md:col-span-1 space-y-10">
                    {/* Education */}
                    <section>
                        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <GraduationCap size={16} /> Education
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="font-bold text-slate-800 m-0">University Course</p>
                                <p className="text-sm text-slate-500 m-0">Batch of {student.graduation_year}</p>
                                <p className="text-sm font-bold text-indigo-600 mt-1 m-0">CGPA: {student.cgpa} / 10</p>
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 m-0">12th Standard</p>
                                <p className="text-sm text-slate-500 m-0">Percentage: {student.marks_12th}%</p>
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 m-0">10th Standard</p>
                                <p className="text-sm text-slate-500 m-0">Percentage: {student.marks_10th}%</p>
                            </div>
                        </div>
                    </section>

                    {/* Skills */}
                    <section>
                        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Code size={16} /> Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {student.skills?.map((skill: string) => (
                                <span key={skill} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded uppercase tracking-wider">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column (Main Content) */}
                <div className="md:col-span-2 space-y-10">
                    {/* Summary */}
                    <section>
                        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <User size={16} /> Professional Summary
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-[15px] m-0">
                            Motivated and results-oriented {student.branch} student with a strong academic background and a passion for technical excellence. 
                            Skilled in {student.skills?.slice(0, 3).join(', ')} and committed to continuous learning and professional development in the field of technology and engineering.
                        </p>
                    </section>

                    {/* Experience/Projects Placeholder */}
                    <section>
                        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Briefcase size={16} /> Experience & Projects
                        </h3>
                        <div className="space-y-6">
                            <div className="relative pl-6 border-l-2 border-slate-100">
                                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-indigo-500" />
                                <p className="font-bold text-slate-800 m-0 text-lg">Academic Projects</p>
                                <p className="text-sm text-indigo-600 font-bold m-0 uppercase tracking-wider">The Neotia University</p>
                                <ul className="mt-3 text-slate-600 text-sm space-y-2 list-disc pl-4 marker:text-indigo-400">
                                    <li>Successfully managed and implemented technical modules as part of curriculum-led projects.</li>
                                    <li>Collaborated with peers to solve complex problems and deliver high-quality project outcomes.</li>
                                    <li>Documented technical processes and maintained project codebases using version control.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Certifications Placeholder */}
                    <section>
                        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Award size={16} /> Key Achievements
                        </h3>
                        <ul className="text-slate-600 text-[15px] space-y-2 list-disc pl-4 marker:text-indigo-400">
                            <li>Maintained a consistent academic record with a cumulative GPA of {student.cgpa}.</li>
                            <li>Active participant in university technical events and workshops.</li>
                        </ul>
                    </section>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                <span>Generated by TNU PMS</span>
                <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </footer>
        </div>
    );
});

ResumePreview.displayName = 'ResumePreview';

export default ResumePreview;
