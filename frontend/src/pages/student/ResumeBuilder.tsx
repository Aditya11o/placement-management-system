import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { 
  Printer, 
  GraduationCap, Briefcase, 
  Award, Mail, Phone, MapPin, Loader2
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const ResumeBuilder: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    profile: null as any,
    skills: [] as any[],
    projects: [] as any[],
    academic: null as any
  });
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${user?.name || 'Student'}_Resume`,
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        if (!user?._id) return;
        
        console.log('Fetching resume data for Student ID:', user._id);
        
        const [profileRes, skillsRes, projectsRes, academicRes] = await Promise.all([
          api.get(`/profile/student/profile/${user._id}`),
          api.get(`/profile/student/skills/${user._id}`),
          api.get(`/profile/student/projects/${user._id}`),
          api.get(`/profile/student/academic/${user._id}`)
        ]);

        console.log('Profile Response:', profileRes.data);
        console.log('Skills Response:', skillsRes.data);
        console.log('Projects Response:', projectsRes.data);
        console.log('Academic Response:', academicRes.data);

        const resumeData = {
          profile: profileRes.data,
          skills: skillsRes.data,
          projects: projectsRes.data,
          academic: academicRes.data
        };
        
        console.log('Mapped Resume Data Object:', resumeData);
        setData(resumeData);
      } catch (err) {
        console.error('Error fetching resume data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-gray-400 font-black uppercase tracking-widest text-xs animate-pulse">Loading resume data...</p>
      </div>
    );
  }

  const { profile, skills, projects, academic } = data;

  if (!profile && !academic && skills.length === 0 && projects.length === 0) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center text-center px-6">
        <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mb-8 border border-gray-100">
           <GraduationCap size={40} className="text-gray-200" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Resume Not Ready</h2>
        <p className="text-gray-500 font-medium max-w-md">Complete your profile to generate a professional resume. Add your education, skills, and projects to get started.</p>
        <button 
          onClick={() => window.location.href = '/student/profile'}
          className="mt-8 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
        >
          Go to My Profile
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in pb-20">
      {/* Header with Actions */}
      <div className="flex justify-between items-center mb-6 no-print">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">
            <div className="w-8 h-px bg-blue-600" />
            <span>Ready for placement</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none uppercase">Resume <span className="text-blue-600">Builder</span></h1>
          <p className="text-gray-500 text-sm font-medium mt-3">Your professional identity, generated automatically from your profile.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handlePrint}
            className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 flex items-center gap-2 active:scale-95"
          >
            <Printer size={16} strokeWidth={3} /> Print / Save PDF
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .resume-container {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 0;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Resume Preview Container */}
      <div className="bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden resume-container">
        <div ref={componentRef} className="p-16 min-h-[1100px] text-gray-900 font-serif leading-normal bg-white">
          {/* Resume Header */}
          <div className="text-center pb-8 border-b-2 border-gray-900 mb-10">
            <h1 className="text-5xl font-black uppercase tracking-tighter text-gray-900 mb-4">{profile?.full_name}</h1>
            <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-gray-600 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><Mail size={12} strokeWidth={3} /> {profile?.email}</span>
              {profile?.phone && <span className="flex items-center gap-1.5"><Phone size={12} strokeWidth={3} /> {profile?.phone}</span>}
              {(profile?.city || profile?.state) && (
                <span className="flex items-center gap-1.5"><MapPin size={12} strokeWidth={3} /> {profile?.city}{profile?.city && profile?.state ? ', ' : ''}{profile?.state}</span>
              )}
            </div>
            
            <div className="mt-4 flex justify-center gap-6 text-[10px] font-black uppercase tracking-widest">
               {profile?.linkedin && (
                 <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn</a>
               )}
               {profile?.github && (
                 <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:underline">GitHub</a>
               )}
               {profile?.portfolio && (
                 <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Portfolio</a>
               )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12">
            {/* Education */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b-2 border-gray-900/10 pb-2">
                <GraduationCap size={22} className="text-gray-900" strokeWidth={2.5} />
                <h2 className="text-xl font-black uppercase tracking-[0.2em] text-gray-900">Education</h2>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">{academic?.course}</h3>
                    <p className="text-gray-500 font-bold uppercase text-[11px] tracking-widest mt-1 tracking-wider">{academic?.department}</p>
                    <p className="text-gray-400 font-bold italic text-xs mt-2">Class of {academic?.passing_year}</p>
                  </div>
                  {academic?.current_cgpa > 0 && (
                    <div className="text-right">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">Current CGPA</div>
                      <span className="text-2xl font-black text-gray-900">{academic?.current_cgpa}</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-8 pt-4">
                  {academic?.twelfth_percentage > 0 && (
                   <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Class XII Senior Secondary</p>
                      <p className="text-lg font-black text-gray-900">{academic?.twelfth_percentage}%</p>
                   </div>
                  )}
                  {academic?.tenth_percentage > 0 && (
                   <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Class X Secondary</p>
                      <p className="text-lg font-black text-gray-900">{academic?.tenth_percentage}%</p>
                   </div>
                  )}
                </div>
              </div>
            </section>

            {/* Skills */}
            {skills && skills.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b-2 border-gray-900/10 pb-2">
                <Award size={22} className="text-gray-900" strokeWidth={2.5} />
                <h2 className="text-xl font-black uppercase tracking-[0.2em] text-gray-900">Technical Expertise</h2>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-3">
                {skills.map((skill: string, i: number) => (
                  <span key={i} className="px-5 py-2 border-2 border-gray-900 text-xs font-black uppercase tracking-widest bg-white">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b-2 border-gray-900/10 pb-2">
                <Briefcase size={22} className="text-gray-900" strokeWidth={2.5} />
                <h2 className="text-xl font-black uppercase tracking-[0.2em] text-gray-900">Projects & Contributions</h2>
              </div>
              <div className="space-y-10">
                {projects.map((project: any, i: number) => (
                  <div key={i} className="group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{project.title}</h3>
                        {project.link && (
                          <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline mt-1 block">
                            View Live Project
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2">
                         {project.technologies?.map((tech: string, j: number) => (
                           <span key={j} className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                             {tech}
                           </span>
                         ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-[13px] leading-relaxed font-medium">{project.description}</p>
                  </div>
                ))}
              </div>
            </section>
            )}
            
            <div className="pt-20 text-center no-print">
               <div className="w-16 h-1 bg-gray-900 mx-auto mb-4 opacity-10" />
               <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">End of Resume</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
